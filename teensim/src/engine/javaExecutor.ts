import { parseMain } from '../parser/mainParser';
import { instrumentTeenager, instrumentMain, mergeForSingleFile } from './codeInstrumenter';
import { useAppStore } from '../store/useAppStore';
import type { MethodName } from '../constants/methodEffects';
import { KNOWN_METHODS, DEFAULT_STATE } from '../constants/methodEffects';
import type { TeenagerState } from '../constants/methodEffects';

// ─── Backend config ────────────────────────────────────────────────────────────
// Judge0 CE is the default (free, no auth, no registration).
// Set VITE_PISTON_URL to use a self-hosted Piston instance instead.
const PISTON_URL = import.meta.env.VITE_PISTON_URL as string | undefined;
const JUDGE0_URL = (import.meta.env.VITE_JUDGE0_URL as string | undefined) ?? 'https://ce.judge0.com';
const JUDGE0_LANG_JAVA = 62; // OpenJDK 13

const TIMEOUT_MS = 15000;
const ANIM_DURATION_MS = 2000;

// ─── Public types ──────────────────────────────────────────────────────────────

export interface JavaExecutionResult {
  instancesCreated: boolean;
  methodsRan: boolean;
  encapsulationViolation: boolean;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function executeWithJava(
  teenagerCode: string,
  mainCode: string,
): Promise<JavaExecutionResult> {
  const store = useAppStore.getState();
  const { appendConsole, addInstance, updateInstanceState, setAnimation, symbolTable } = store;

  // Instrument code (state reporters injected by the existing mainParser AST)
  const { statements } = parseMain(mainCode, symbolTable);
  const definedFieldNames = (store.classSchema?.fields ?? []).map((f) => f.name);
  const instrTeenager = instrumentTeenager(teenagerCode, definedFieldNames);
  const instrMain = instrumentMain(mainCode, statements);

  // Choose backend
  let stdout: string;
  let stderr: string;
  let compileOutput: string;

  if (PISTON_URL) {
    ({ stdout, stderr, compileOutput } = await runWithPiston(instrTeenager, instrMain));
  } else {
    // Judge0 needs one merged file (two public classes in one file is not allowed)
    const merged = mergeForSingleFile(instrTeenager, instrMain);
    ({ stdout, stderr, compileOutput } = await runWithJudge0(merged));
  }

  return processOutput({ stdout, stderr, compileOutput }, store, {
    addInstance, updateInstanceState, setAnimation, appendConsole,
  });
}

// ─── Piston backend ────────────────────────────────────────────────────────────

async function runWithPiston(instrTeenager: string, instrMain: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(PISTON_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'java',
        version: '*',
        files: [
          { name: 'Teenager.java', content: instrTeenager },
          { name: 'Main.java', content: instrMain },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`PISTON_HTTP_${res.status}`);
    const data = await res.json() as {
      compile?: { stderr: string };
      run: { stdout: string; stderr: string };
    };
    return {
      stdout: data.run.stdout ?? '',
      stderr: data.run.stderr ?? '',
      compileOutput: data.compile?.stderr ?? '',
    };
  } catch {
    clearTimeout(timer);
    throw new Error('PISTON_UNREACHABLE');
  }
}

// ─── Judge0 backend ────────────────────────────────────────────────────────────

async function runWithJudge0(merged: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Submit
    const submitRes = await fetch(`${JUDGE0_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_id: JUDGE0_LANG_JAVA, source_code: merged, stdin: '' }),
      signal: controller.signal,
    });
    if (!submitRes.ok) throw new Error(`JUDGE0_HTTP_${submitRes.status}`);
    const { token } = await submitRes.json() as { token: string };

    // Poll until done (status > 2 means no longer queued/processing)
    for (let attempt = 0; attempt < 15; attempt++) {
      await sleep(1000);
      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?fields=status,stdout,stderr,compile_output`,
        { signal: controller.signal }
      );
      const data = await pollRes.json() as {
        status: { id: number };
        stdout: string | null;
        stderr: string | null;
        compile_output: string | null;
      };
      if (data.status.id > 2) {
        clearTimeout(timer);
        return {
          stdout: data.stdout ?? '',
          stderr: data.stderr ?? '',
          compileOutput: data.compile_output ?? '',
        };
      }
    }
    throw new Error('JUDGE0_TIMEOUT');
  } catch {
    clearTimeout(timer);
    throw new Error('JUDGE0_UNREACHABLE');
  }
}

// ─── Output processor (shared by both backends) ────────────────────────────────

function processOutput(
  { stdout, stderr, compileOutput }: { stdout: string; stderr: string; compileOutput: string },
  store: ReturnType<typeof useAppStore.getState>,
  actions: {
    addInstance: (v: string) => void;
    updateInstanceState: (v: string, s: TeenagerState) => void;
    setAnimation: (v: string, m: MethodName | null) => void;
    appendConsole: (kind: 'log' | 'error' | 'success' | 'system', msg: string, sug?: string) => void;
  }
): JavaExecutionResult {
  const { addInstance, updateInstanceState, setAnimation, appendConsole } = actions;
  let instancesCreated = false;
  let methodsRan = false;
  let encapsulationViolation = false;
  const knownInstances = new Set<string>(Object.keys(store.instances));

  // Compile errors
  if (compileOutput.trim()) {
    for (const line of compileOutput.split('\n')) {
      if (!line.trim()) continue;
      const msg = translateCompileError(line);
      if (msg) appendConsole('error', msg);
      if (line.includes('has private access')) encapsulationViolation = true;
    }
    return { instancesCreated, methodsRan, encapsulationViolation };
  }

  // stdout: interleaved student output + __TS__ state markers
  for (const rawLine of stdout.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith('__TS__|')) {
      const payload = line.slice(7); // strip '__TS__|'
      const pipe1 = payload.indexOf('|');
      const marker = payload.slice(0, pipe1);
      const rest = payload.slice(pipe1 + 1);

      if (marker === 'new') {
        const pipe2 = rest.indexOf('|');
        const varName = rest.slice(0, pipe2);
        const jsonStr = rest.slice(pipe2 + 1);
        const state = parseState(jsonStr);
        if (!knownInstances.has(varName)) {
          addInstance(varName);
          knownInstances.add(varName);
          instancesCreated = true;
          appendConsole('success', `אובייקט "${varName}" נוצר בזיכרון! 🎉`);
        }
        updateInstanceState(varName, state);
      } else if (marker === 'call') {
        const pipe2 = rest.indexOf('|');
        const methodName = rest.slice(0, pipe2);
        const rest2 = rest.slice(pipe2 + 1);
        const pipe3 = rest2.indexOf('|');
        const varName = rest2.slice(0, pipe3);
        const jsonStr = rest2.slice(pipe3 + 1);
        const state = parseState(jsonStr);
        updateInstanceState(varName, state);
        methodsRan = true;
        appendConsole('log', `${varName}.${methodName}() הופעל בהצלחה`);

        if (KNOWN_METHODS.includes(methodName as MethodName)) {
          setAnimation(varName, methodName as MethodName);
          const v = varName;
          setTimeout(() => useAppStore.getState().setAnimation(v, null), ANIM_DURATION_MS);
        }
      }
    } else {
      appendConsole('log', line);
    }
  }

  // Runtime stderr
  if (stderr.trim()) {
    for (const line of stderr.split('\n')) {
      if (line.trim()) appendConsole('error', line);
    }
  }

  return { instancesCreated, methodsRan, encapsulationViolation };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseState(jsonStr: string): TeenagerState {
  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(jsonStr) as Partial<TeenagerState>) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function translateCompileError(line: string): string | null {
  if (line.startsWith('Note:') || !line.trim()) return null;
  if (line.includes('has private access')) {
    const m = line.match(/(\w+) has private access in (\w+)/);
    return `שגיאת הידור: ניסית לגשת לשדה הפרטי "${m?.[1] ?? ''}" — זהו עיקרון האנקפסולציה! שדות private אינם נגישים מחוץ למחלקה.`;
  }
  if (line.includes('cannot find symbol')) {
    const m = line.match(/symbol:\s+(\S+ \S+)/);
    return `שגיאת הידור: סמל לא מוכר — ${m?.[1] ?? line}`;
  }
  if (line.includes('error:')) return `שגיאת הידור: ${line}`;
  return line;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
