import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import './ConsolePanel.css';

export function ConsolePanel() {
  const entries = useAppStore((s) => s.consoleEntries);
  const consoleVisible = useAppStore((s) => s.consoleVisible);
  const clearConsole = useAppStore((s) => s.clearConsole);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (!consoleVisible && entries.length === 0) return null;

  return (
    <div className="console-panel">
      <div className="console-header">
        <span>📟 פלט / שגיאות מהדר</span>
        <button className="console-clear" onClick={clearConsole}>נקה</button>
      </div>
      <div className="console-body">
        {entries.length === 0 && (
          <div className="console-empty">לחץ הרץ כדי להפעיל את הקוד</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={`console-entry ${entry.kind}`}>
            <span className="entry-prefix">
              {entry.kind === 'error' ? '✗' :
               entry.kind === 'success' ? '✓' :
               entry.kind === 'system' ? '▶' : '›'}
            </span>
            <span className="entry-message">{entry.message}</span>
            {entry.suggestion && (
              <div className="entry-suggestion">💡 {entry.suggestion}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
