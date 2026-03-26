import { useParseTeenager } from '../../hooks/useParseTeenager';
import { useAppStore } from '../../store/useAppStore';
import type { Stage } from '../../constants/stageConfig';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import { FileTabs } from '../editor/FileTabs';
import { CodeEditor } from '../editor/CodeEditor';
import { RunButton } from '../editor/RunButton';
import { VisualizerPane } from '../visualizer/VisualizerPane';
import { ObjectInspector } from '../inspector/ObjectInspector';
import { ConsolePanel } from '../console/ConsolePanel';
import { StageOverlay } from '../stage/StageOverlay';
import { AttributePicker } from '../stage/AttributePicker';
import './AppShell.css';

const STAGE_TITLES: Record<Stage, string> = {
  1: 'שלב 1: Blueprint',
  2: 'שלב 2: מתודות',
  3: 'שלב 3: קונסטרקטור',
  4: 'שלב 4: toString()',
  5: 'שלב 5: יצירת אובייקט',
  6: 'שלב 6: אינטראקציה',
  7: 'שלב 7: אנקפסולציה',
};

export function AppShell() {
  useParseTeenager();
  const currentStage = useAppStore((s) => s.currentStage);
  const viewingStage = useAppStore((s) => s.viewingStage);
  const setViewingStage = useAppStore((s) => s.setViewingStage);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const activeFile = useAppStore((s) => s.activeFile);

  function handleDotClick(s: Stage) {
    if (s > currentStage) return;
    setViewingStage(s);
    const requiredFile = STAGE_CONFIGS[s].requiredFile;
    if (requiredFile) setActiveFile(requiredFile);
  }

  return (
    <div className="app-shell-wrapper">
      <header className="app-header">
        <span className="app-title">TeenSim: Master OOP</span>
        <div className="app-stage-dots">
          {([1, 2, 3, 4, 5, 6, 7] as Stage[]).map((s) => (
            <button
              key={s}
              className={`stage-dot-btn ${viewingStage === s ? 'viewing' : ''} ${currentStage === s ? 'active' : ''} ${currentStage > s ? 'done' : ''} ${s > currentStage ? 'locked' : ''}`}
              onClick={() => handleDotClick(s)}
              title={STAGE_TITLES[s]}
              disabled={s > currentStage}
            >
              {currentStage > s ? '✓' : s}
            </button>
          ))}
        </div>
      </header>
      <div className="app-shell">
        {/* Left Pane: Editor */}
        <div className="left-pane">
          <FileTabs />
          <div className="editor-area">
            <CodeEditor />
          </div>
          <RunButton />
        </div>

        {/* Right Pane: Instructions + Simulation + Inspector + Console */}
        <div className="right-pane">
          <StageOverlay />
          {activeFile === 'Teenager.java' && <AttributePicker />}
          <div className="visualizer-area">
            <VisualizerPane />
          </div>
          <ObjectInspector />
          <ConsolePanel />
        </div>
      </div>
    </div>
  );
}
