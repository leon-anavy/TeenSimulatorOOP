import { useAppStore } from '../store/useAppStore';
import { parseMain } from '../parser/mainParser';
import { executeMain } from '../engine/interpreter';

export function useRunMain() {
  const mainCode = useAppStore((s) => s.mainCode);
  const symbolTable = useAppStore((s) => s.symbolTable);
  const classSchema = useAppStore((s) => s.classSchema);
  const instances = useAppStore((s) => s.instances);
  const currentStage = useAppStore((s) => s.currentStage);
  const appendConsole = useAppStore((s) => s.appendConsole);
  const clearConsole = useAppStore((s) => s.clearConsole);
  const advanceStage = useAppStore((s) => s.advanceStage);
  const setActiveFile = useAppStore((s) => s.setActiveFile);

  function run() {
    if (!symbolTable || !classSchema) {
      appendConsole('error', 'קודם הגדר לפחות 2 שדות ב-Teenager.java');
      return;
    }

    clearConsole();
    appendConsole('system', '▶ מריץ קוד...');

    const { statements, errors } = parseMain(mainCode, symbolTable);

    // Report parse errors
    for (const err of errors) {
      appendConsole('error', err.message, err.suggestion);
    }

    const result = executeMain(statements, symbolTable, instances);

    // Stage transitions
    if (currentStage === 5 && result.instancesCreated) {
      advanceStage(6);
      setActiveFile('Main.java');
    }
    if (currentStage === 6 && result.methodsRan) {
      advanceStage(7);
    }
  }

  return { run };
}
