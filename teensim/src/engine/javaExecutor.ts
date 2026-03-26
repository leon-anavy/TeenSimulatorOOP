import { parseMain } from '../parser/mainParser';
import { instrumentTeenager, instrumentMain } from './codeInstrumenter';
import { useAppStore } from '../store/useAppStore';
import type { MethodName } from '../constants/methodEffects';
import { KNOWN_METHODS, DEFAULT_STATE } from '../constants/methodEffects';
import type { TeenagerState } from '../constants/methodEffects';

const PISTON_URL = (import.meta.env.VITE_PISTON_URL as string | undefined)
  ?? 'https://emkc.org/api/v2/piston/execute';

const TIMEOUT_MS = 12000;

const ANIM_DURATION_MS = 2000;

interface PistonResponse {
  compile?: { stdout: string; stderr: string; code: number };
  run: { stdout: string; stderr: string; code: number };
}

export interface JavaExecutionResult {
  instancesCreated: boolean;
  methodsRan: boolean;
  encapsulationViolation: boolean;
}

export async function executeWithJava(
  teenagerCode: string,
  mainCode: string,
): Promise<JavaExecutionResult> {
  const store = useAppStore.getState();
  const { appendConsole, addInstance, updateInstanceState, setAnimation, symbolTable } = store;

  // Instrument both files
  const { statements } = parseMain(mainCode, symbolTable);
  const instrumentedTeenager = instrumentTeenager(teenagerCode);
  const instrumentedMain = instrumentMain(mainCode, statements);

  // Call Piston API with a timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let pistonData: PistonResponse;
  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'java',
        version: '*',
        files: [
          { name: 'Teenager.java', content: instrumentedTeenager },
          { name: 'Main.java', content: instrumentedMain },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    pistonData = (await res.json()) as PistonResponse;
  } catch {
    clearTimeout(timer);
    throw new Error('PISTON_UNREACHABLE');
  }

  let instancesCreated = false;
  let methodsRan = false;
  let encapsulationViolation = false;
  const knownInstances = new Set<string>(Object.keys(store.instances));

  // ── Compile errors ──────────────────────────────────────────────────────────
  const compileStderr = pistonData.compile?.stderr?.trim() ?? '';
  if (compileStderr) {
    for (const line of compileStderr.split('\n')) {
      if (!line.trim()) continue;
      const msg = translateCompileError(line);
      if (msg) appendConsole('error', msg);
      if (line.includes('has private access')) encapsulationViolation = true;
    }
    // Don't process stdout if compilation failed
    return { instancesCreated, methodsRan, encapsulationViolation };
  }

  // ── Runtime stdout ──────────────────────────────────────────────────────────
  for (const rawLine of pistonData.run.stdout.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith('__TS__|')) {
      // Protocol: __TS__|<marker>|[methodName|]<varName>|<jsonState>
      const payload = line.slice(7); // after '__TS__|'
      const parts = payload.split('|');

      const marker = parts[0]; // 'new' or 'call'
      if (marker === 'new') {
        const varName = parts[1];
        const jsonStr = parts[2];
        const state = parseState(jsonStr);
        if (!knownInstances.has(varName)) {
          addInstance(varName);
          knownInstances.add(varName);
          instancesCreated = true;
          appendConsole('success', `אובייקט "${varName}" נוצר בזיכרון! 🎉`);
        }
        updateInstanceState(varName, state);
      } else if (marker === 'call') {
        const methodName = parts[1];
        const varName = parts[2];
        const jsonStr = parts[3];
        const state = parseState(jsonStr);
        updateInstanceState(varName, state);
        methodsRan = true;
        appendConsole('log', `${varName}.${methodName}() הופעל בהצלחה`);

        // Trigger animation for the 5 canonical methods
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

  // ── Runtime stderr (exceptions) ─────────────────────────────────────────────
  const runStderr = pistonData.run.stderr?.trim() ?? '';
  if (runStderr) {
    for (const line of runStderr.split('\n')) {
      if (line.trim()) appendConsole('error', line);
    }
  }

  return { instancesCreated, methodsRan, encapsulationViolation };
}

function parseState(jsonStr: string): TeenagerState {
  try {
    const parsed = JSON.parse(jsonStr) as Partial<TeenagerState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function translateCompileError(line: string): string | null {
  // Skip raw file path noise (e.g. blank lines, "Note:" lines)
  if (line.startsWith('Note:') || !line.trim()) return null;

  if (line.includes('has private access')) {
    const match = line.match(/(\w+) has private access in (\w+)/);
    const field = match?.[1] ?? '';
    return `שגיאת הידור: ניסית לגשת לשדה הפרטי "${field}" — זהו עיקרון האנקפסולציה! שדות private אינם נגישים מחוץ למחלקה.`;
  }
  if (line.includes('cannot find symbol')) {
    const symMatch = line.match(/symbol:\s+(\w+\s+\w+)/);
    return `שגיאת הידור: סמל לא מוכר — ${symMatch?.[1] ?? line}`;
  }
  if (line.includes('error:')) {
    return `שגיאת הידור: ${line}`;
  }
  return line;
}
