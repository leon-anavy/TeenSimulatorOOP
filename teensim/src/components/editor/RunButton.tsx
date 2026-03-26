import { useRunMain } from '../../hooks/useRunMain';
import { useAppStore } from '../../store/useAppStore';
import { useAppStore as useStore } from '../../store/useAppStore';
import './RunButton.css';

export function RunButton() {
  const { run } = useRunMain();
  const activeFile = useAppStore((s) => s.activeFile);
  const symbolTable = useAppStore((s) => s.symbolTable);
  const resetInstances = useStore((s) => s.resetInstances);
  const clearConsole = useStore((s) => s.clearConsole);

  if (activeFile !== 'Main.java') return null;

  function handleReset() {
    resetInstances();
    clearConsole();
  }

  return (
    <div className="run-bar">
      <button className="run-button" onClick={run} disabled={!symbolTable}>
        ▶ הרץ
      </button>
      <button className="reset-button" onClick={handleReset} title="אפס את העולם">
        ↺ אפס
      </button>
    </div>
  );
}
