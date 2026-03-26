import type { MainStatement, SymbolTable } from '../parser/types';
import type { MethodName, TeenagerState } from '../constants/methodEffects';
import { KNOWN_METHODS } from '../constants/methodEffects';
import { validateStatements } from './validator';
import { runBodyStatement } from './bodyRunner';
import { useAppStore } from '../store/useAppStore';

export interface ExecutionResult {
  methodsRan: boolean;
  instancesCreated: boolean;
}

const ANIM_DURATION: Record<MethodName, number> = {
  study: 2000,
  sleep: 2500,
  eat: 1500,
  playGames: 2000,
  talkToFriends: 1800,
};

export function executeMain(
  statements: MainStatement[],
  symbolTable: SymbolTable,
  existingInstances: Record<string, unknown>
): ExecutionResult {
  const store = useAppStore.getState();
  const { addInstance, updateInstanceState, setAnimation, appendConsole } = store;

  const knownInstances = new Set<string>(Object.keys(existingInstances));
  const validationErrors = validateStatements(statements, symbolTable, new Set(knownInstances));

  // Report validation errors to console
  for (const err of validationErrors) {
    appendConsole('error', err.message, err.suggestion);
  }

  // Stop execution on hard errors (anything except encapsulation violations, which are educational)
  const hardErrors = validationErrors.filter((e) => e.kind !== 'ENCAPSULATION_VIOLATION');
  if (hardErrors.length > 0) {
    return { methodsRan: false, instancesCreated: false };
  }

  let methodsRan = false;
  let instancesCreated = false;

  for (const stmt of statements) {
    const hasError = validationErrors.some((e) => e.line === stmt.line);
    if (hasError && stmt.kind !== 'INSTANTIATE') continue;

    if (stmt.kind === 'INSTANTIATE') {
      addInstance(stmt.varName);
      knownInstances.add(stmt.varName);
      instancesCreated = true;
      appendConsole('success', `אובייקט "${stmt.varName}" נוצר בזיכרון! 🎉`);
      continue;
    }

    if (stmt.kind === 'METHOD_CALL') {
      if (!knownInstances.has(stmt.varName)) continue;

      const methodDef = symbolTable.publicMethods.get(stmt.methodName);
      if (!methodDef) continue; // validator already reported

      // Build parameter bindings from call arguments
      const params: Record<string, unknown> = {};
      methodDef.params.forEach((p, i) => {
        params[p.name] = stmt.args[i];
      });

      // Execute the student's method body against a copy of the instance state
      const currentInst = useAppStore.getState().instances[stmt.varName];
      if (!currentInst) continue;

      const newState = { ...currentInst.state } as unknown as Record<string, unknown>;
      for (const bodyStmt of methodDef.bodyStatements) {
        runBodyStatement(newState, bodyStmt, params);
      }
      updateInstanceState(stmt.varName, newState as unknown as TeenagerState);

      methodsRan = true;
      appendConsole('log', `${stmt.varName}.${stmt.methodName}() הופעל בהצלחה`);

      // Trigger animation for the 5 canonical methods
      const animKey = KNOWN_METHODS.includes(stmt.methodName as MethodName)
        ? (stmt.methodName as MethodName)
        : null;
      if (animKey) {
        setAnimation(stmt.varName, animKey);
        const varName = stmt.varName;
        setTimeout(() => {
          useAppStore.getState().setAnimation(varName, null);
        }, ANIM_DURATION[animKey]);
      }
      continue;
    }

    if (stmt.kind === 'FIELD_READ') {
      if (!knownInstances.has(stmt.varName)) continue;
      const inst = useAppStore.getState().instances[stmt.varName];
      if (inst) {
        const val = (inst.state as unknown as Record<string, unknown>)[stmt.fieldName];
        appendConsole('log', `${stmt.varName}.${stmt.fieldName} = ${val}`);
      }
      continue;
    }

    if (stmt.kind === 'PRINT') {
      const arg = stmt.arg;
      if (arg.kind === 'literal') {
        appendConsole('log', String(arg.value));
      } else if (arg.kind === 'field_access') {
        // Block direct access to private fields — encapsulation violation
        if (symbolTable.privateFields.has(arg.fieldName)) {
          appendConsole(
            'error',
            `שורה ${stmt.line}: ניסית לגשת ישירות לשדה הפרטי "${arg.fieldName}" דרך println. זהו עיקרון האנקפסולציה — שדות private אינם נגישים מחוץ למחלקה!`,
            `השתמש ב-toString() כדי להדפיס את האובייקט: System.out.println(${arg.varName})`
          );
        } else {
          const inst = useAppStore.getState().instances[arg.varName];
          if (inst) {
            const val = (inst.state as unknown as Record<string, unknown>)[arg.fieldName];
            appendConsole('log', val !== undefined ? String(val) : `${arg.varName}.${arg.fieldName} = undefined`);
          } else {
            appendConsole('error', `משתנה "${arg.varName}" לא קיים`);
          }
        }
      } else {
        // arg.kind === 'raw': treat as a variable name — look up instance and call toString()
        const instName = arg.text;
        const inst = useAppStore.getState().instances[instName];
        if (inst) {
          const schema = useAppStore.getState().classSchema;
          const hasToString = schema?.methods.some(
            (m) => m.name === 'toString' && m.returnType === 'String'
          ) ?? false;
          if (hasToString) {
            const definedFields = schema?.fields.map((f) => f.name) ?? [];
            const state = inst.state as unknown as Record<string, unknown>;
            const fieldStr = definedFields.map((f) => `${f}=${state[f]}`).join(', ');
            appendConsole('log', `Teenager [${fieldStr}]`);
          } else {
            appendConsole(
              'error',
              `כדי להדפיס אובייקט, יש להגדיר מתודת toString() ב-Teenager.java`,
              `הוסף: public String toString() { return "Teenager [...]"; }`
            );
          }
        } else {
          appendConsole('log', arg.text);
        }
      }
      continue;
    }
  }

  return { methodsRan, instancesCreated };
}
