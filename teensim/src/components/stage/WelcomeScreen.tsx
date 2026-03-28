import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import realiLogo from '../../assets/reali_logo.png';
import './WelcomeScreen.css';

export function WelcomeScreen() {
  const welcomeCompleted = useAppStore((s) => s.welcomeCompleted);
  const setWelcomeCompleted = useAppStore((s) => s.setWelcomeCompleted);

  if (welcomeCompleted) return null;

  return (
    <div className="welcome-overlay">
      <motion.div
        className="welcome-card"
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
        dir="rtl"
      >
        <div className="welcome-hero">
          <img src={realiLogo} alt="בית הספר הריאלי העברי" className="welcome-school-logo" />
          <h1 className="welcome-headline">ברוכים הבאים ל-TeenSim!</h1>
          <p className="welcome-subtitle">סימולטור ללמידת תכנות מונחה עצמים (OOP) בג'אווה</p>
        </div>

        <div className="welcome-body">
          <p className="welcome-intro">
            היום נבנה יחד <strong>מחלקה</strong> — מסמך תכנון למתבגר דיגיטלי.
            נגדיר מה הוא יודע, מה הוא יכול לעשות, ואיך הוא מגן על המידע שלו.
          </p>

          <div className="welcome-two-files" dir="rtl">
            <div className="two-files-title">📂 נעבוד עם שני קבצים נפרדים — כמו בפרויקטים אמיתיים בג'אווה:</div>
            <div className="two-files-row">
              <div className="two-file-chip file-chip-teenager">
                <span className="file-chip-name">Teenager.java</span>
                <span className="file-chip-desc">הגדרת המחלקה — השרטוט</span>
              </div>
              <div className="two-files-arrow">←</div>
              <div className="two-file-chip file-chip-main">
                <span className="file-chip-name">Main.java</span>
                <span className="file-chip-desc">הקוד שמשתמש במחלקה</span>
              </div>
            </div>
            <div className="two-files-note">הפרדה זו היא עיקרון בסיסי בתכנות מונחה עצמים: הגדרת הסוג בקובץ אחד, שימוש בו בקובץ אחר.</div>
          </div>

          <div className="welcome-steps">
            <div className="welcome-step">
              <span className="step-icon">🏗️</span>
              <div>
                <div className="step-title">נגדיר שדות ופעולות</div>
                <div className="step-desc">המידע שהמתבגר מחזיק וה"דברים" שהוא יכול לעשות — ב-Teenager.java</div>
              </div>
            </div>
            <div className="welcome-step">
              <span className="step-icon">✨</span>
              <div>
                <div className="step-title">ניצור אובייקטים חיים</div>
                <div className="step-desc">ב-Main.java נשתמש במחלקה כדי ליצור מתבגרים אמיתיים</div>
              </div>
            </div>
            <div className="welcome-step">
              <span className="step-icon">🔒</span>
              <div>
                <div className="step-title">נבין אנקפסולציה</div>
                <div className="step-desc">למה private קיים — ומה קורה כשמנסים לשבור את הכלל</div>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-footer">
          <div className="welcome-lang-note">
            <span className="lang-badge">Java</span>
            <span>הקוד בג'אווה, ממשק בעברית</span>
          </div>
          <button className="welcome-start-btn" onClick={setWelcomeCompleted}>
            בואו נתחיל! →
          </button>
        </div>

        <div className="welcome-credit" dir="rtl">
          נוצר על ידי{' '}
          <a href="mailto:leon.anavy@reali.org.il">Leon Anavy</a>
          {' '}• בית הספר הריאלי העברי בחיפה
          <br />
          קוד המקור זמין ב-{' '}
          <a
            href="https://github.com/leon-anavy/TeenSimulatorOOP"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </motion.div>
    </div>
  );
}
