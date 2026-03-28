import { useAppStore } from '../../store/useAppStore';
import './FileTabs.css';

export function FileTabs() {
  const activeFile = useAppStore((s) => s.activeFile);
  const mainTabUnlocked = useAppStore((s) => s.mainTabUnlocked);
  const mainTabBlinking = useAppStore((s) => s.mainTabBlinking);
  const stopBlinking = useAppStore((s) => s.stopMainTabBlinking);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const teenagerCode = useAppStore((s) => s.teenagerCode);
  const mainCode = useAppStore((s) => s.mainCode);

  function handleMainTabClick() {
    if (!mainTabUnlocked) return;
    stopBlinking();
    setActiveFile('Main.java');
  }

  function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownload() {
    downloadFile('Teenager.java', teenagerCode);
    if (mainTabUnlocked) downloadFile('Main.java', mainCode);
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
      <button
        className="tab download-btn"
        onClick={handleDownload}
        title="הורד את קבצי הג'אווה למחשב"
      >
        ⬇ הורד קבצים
      </button>
    </div>
  );
}
