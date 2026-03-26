import { useAppStore } from '../../store/useAppStore';
import './FileTabs.css';

export function FileTabs() {
  const activeFile = useAppStore((s) => s.activeFile);
  const mainTabUnlocked = useAppStore((s) => s.mainTabUnlocked);
  const mainTabBlinking = useAppStore((s) => s.mainTabBlinking);
  const stopBlinking = useAppStore((s) => s.stopMainTabBlinking);
  const setActiveFile = useAppStore((s) => s.setActiveFile);

  function handleMainTabClick() {
    if (!mainTabUnlocked) return;
    stopBlinking();
    setActiveFile('Main.java');
  }

  return (
    <div className="file-tabs">
      <button
        className={`tab ${activeFile === 'Teenager.java' ? 'active' : ''}`}
        onClick={() => setActiveFile('Teenager.java')}
      >
        Teenager.java
      </button>
      <button
        className={`tab ${activeFile === 'Main.java' ? 'active' : ''} ${!mainTabUnlocked ? 'locked' : ''} ${mainTabBlinking ? 'blinking' : ''}`}
        onClick={handleMainTabClick}
        title={!mainTabUnlocked ? 'הגדר לפחות 2 שדות כדי לפתוח קובץ זה' : ''}
      >
        Main.java
        {mainTabBlinking && <span className="unlock-badge">✨</span>}
        {!mainTabUnlocked && <span className="lock-icon">🔒</span>}
      </button>
    </div>
  );
}
