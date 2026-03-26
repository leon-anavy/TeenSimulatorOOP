import { useAppStore } from '../store/useAppStore';
import { parseMain } from '../parser/mainParser';
import { executeMain } from '../engine/interpreter';
import { executeWithJava } from '../engine/javaExecutor';

export function useRunMain() {
  const mainCode = useAppStore((s) => s.mainCode);
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const symbolTable = useAppStore((s) => s.symbolTable);
  const classSchema = useAppStore((s) => s.classSchema);
  const instances = useAppStore((s) => s.instances);
  const currentStage = useAppStore((s) => s.currentStage);
  const executionMode = useAppStore((s) => s.executionMode);
  const appendConsole = useAppStore((s) => s.appendConsole);
  const clearConsole = useAppStore((s) => s.clearConsole);
  const advanceStage = useAppStore((s) => s.advanceStage);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const setIsExecuting = useAppStore((s) => s.setIsExecuting);
  const setExecutionMode = useAppStore((s) => s.setExecutionMode);

  async function run() {
    if (!symbolTable || !classSchema) {
      appendConsole('error', 'קודם הגדר לפחות 2 שדות ב-Teenager.java');
      return;
    }

    clearConsole();
    setIsExecuting(true);
    appendConsole('system', '▶ מריץ קוד...');

    let instancesCreated = false;
    let methodsRan = false;
    let encapsulationViolation = false;

    if (executionMode === 'java') {
      try {
        const result = await executeWithJava(teenagerCode, mainCode);
        instancesCreated = result.instancesCreated;
        methodsRan = result.methodsRan;
        encapsulationViolation = result.encapsulationViolation;
      } catch (err) {
        // Fall back to local interpreter
        const isAuth = String(err).includes('401') || String(err).includes('403');
        appendConsole(
          'system',
          isAuth
            ? '⚠️ שרת ה-Java אינו זמין (נדרשת הרשאה). עובר לסימולטור המקומי.'
            : '⚠️ מצב לא מקוון — מריץ בסימולטור המקומי'
        );
        setExecutionMode('local');
        const localResult = runLocal(mainCode, symbolTable, instances, appendConsole);
        instancesCreated = localResult.instancesCreated;
        methodsRan = localResult.methodsRan;
      }
    } else {
      const localResult = runLocal(mainCode, symbolTable, instances, appendConsole);
      instancesCreated = localResult.instancesCreated;
      methodsRan = localResult.methodsRan;
    }

    setIsExecuting(false);

    // Stage transitions
    if (currentStage === 5 && instancesCreated) {
      advanceStage(6);
      setActiveFile('Main.java');
    }
    if (currentStage === 6 && methodsRan) {
      advanceStage(7);
    }
    if (currentStage === 7 && encapsulationViolation) {
      // Already at final stage — just let the error be educational
    }
  }

  return { run };
}

function runLocal(
  mainCode: string,
  symbolTable: ReturnType<typeof useAppStore.getState>['symbolTable'],
  instances: ReturnType<typeof useAppStore.getState>['instances'],
  appendConsole: ReturnType<typeof useAppStore.getState>['appendConsole'],
) {
  if (!symbolTable) return { instancesCreated: false, methodsRan: false };
  const { statements, errors } = parseMain(mainCode, symbolTable);
  for (const err of errors) appendConsole('error', err.message, err.suggestion);
  return executeMain(statements, symbolTable, instances);
}
