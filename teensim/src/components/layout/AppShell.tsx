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
import { WelcomeScreen } from '../stage/WelcomeScreen';
import { StageModal } from '../stage/StageModal';
import { LevelComplete } from '../stage/LevelComplete';
import { TaskChecklist } from '../stage/TaskChecklist';
import { AttributePicker } from '../stage/AttributePicker';
import realiLogo from '../../assets/reali_logo.png';
import './AppShell.css';

export function AppShell() {
  useParseTeenager();
  const currentStage = useAppStore((s) => s.currentStage);
  const viewingStage = useAppStore((s) => s.viewingStage);
  const setViewingStage = useAppStore((s) => s.setViewingStage);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const activeFile = useAppStore((s) => s.activeFile);
  const jumpToMain = useAppStore((s) => s.jumpToMain);

  function handleDotClick(s: Stage) {
    if (s > currentStage) return;
    setViewingStage(s);
    const requiredFile = STAGE_CONFIGS[s].requiredFile;
    if (requiredFile) setActiveFile(requiredFile);
  }

  return (
    <div className="app-shell-wrapper">
      {/* Welcome screen — shown once on first load */}
      <WelcomeScreen />
      {/* Level complete screen — shown after each stage is done */}
      <LevelComplete />
      {/* Stage intro modal — shown every time a stage is entered */}
      <StageModal />

      <header className="app-header">
        <div className="app-header-brand">
          <img src={realiLogo} alt="הריאלי" className="header-logo" />
          <span className="app-title">TeenSim</span>
        </div>
        {currentStage < 5 && (
          <button className="quick-start-btn" onClick={jumpToMain} title="דלג לשלב Main.java עם קוד מלא">
            ⚡ Quick Start
          </button>
        )}
        <div className="app-stage-dots">
          {([1, 2, 3, 4, 5, 6, 7] as Stage[]).map((s) => (
            <button
              key={s}
              className={`stage-dot-btn ${viewingStage === s ? 'viewing' : ''} ${currentStage === s ? 'active' : ''} ${currentStage > s ? 'done' : ''} ${s > currentStage ? 'locked' : ''}`}
              onClick={() => handleDotClick(s)}
              title={STAGE_CONFIGS[s].titleHebrew}
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

        {/* Right Pane: Checklist + Picker + Simulation + Inspector + Console */}
        <div className="right-pane">
          <TaskChecklist />
          {activeFile === 'Teenager.java' && <AttributePicker />}
          <div className="visualizer-area">
            <VisualizerPane />
          </div>
          <ObjectInspector />
          <ConsolePanel />
        </div>
      </div>

      <footer className="app-footer">
        <span dir="rtl">
          נוצר על ידי{' '}
          <a
            href="https://github.com/leon-anavy/TeenSimulatorOOP"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leon Anavy
          </a>
          {' '}| בית הספר הריאלי העברי בחיפה
        </span>
        <a
          className="footer-github"
          href="https://github.com/leon-anavy/TeenSimulatorOOP"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository"
        >
          <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
      </footer>
    </div>
  );
}
