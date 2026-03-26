import { useRunMain } from '../../hooks/useRunMain';
import { useAppStore } from '../../store/useAppStore';
import './RunButton.css';

export function RunButton() {
  const { run } = useRunMain();
  const activeFile = useAppStore((s) => s.activeFile);
  const symbolTable = useAppStore((s) => s.symbolTable);
  const isExecuting = useAppStore((s) => s.isExecuting);
  const executionMode = useAppStore((s) => s.executionMode);
  const setExecutionMode = useAppStore((s) => s.setExecutionMode);
  const resetInstances = useAppStore((s) => s.resetInstances);
  const clearConsole = useAppStore((s) => s.clearConsole);

  if (activeFile !== 'Main.java') return null;

  function handleReset() {
    resetInstances();
    clearConsole();
  }

  return (
    <div className="run-bar">
      <button
        className="run-button"
        onClick={run}
        disabled={!symbolTable || isExecuting}
      >
        {isExecuting ? '⏳ מריץ...' : '▶ הרץ'}
      </button>
      <button className="reset-button" onClick={handleReset} title="אפס את העולם" disabled={isExecuting}>
        ↺ אפס
      </button>
      <button
        className={`mode-toggle ${executionMode === 'java' ? 'mode-java' : 'mode-local'}`}
        onClick={() => setExecutionMode(executionMode === 'java' ? 'local' : 'java')}
        title={executionMode === 'java' ? 'מצב: Java אמיתי — לחץ לעבור למצב מקומי' : 'מצב: סימולטור מקומי — לחץ לעבור ל-Java אמיתי'}
        disabled={isExecuting}
      >
        {executionMode === 'java' ? '☕ Java' : '⚡ Local'}
      </button>
    </div>
  );
}
