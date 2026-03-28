import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import type { Stage } from '../../constants/stageConfig';
import './LevelComplete.css';

// ─── Per-stage completion message ─────────────────────────────────────────────

const COMPLETE_MESSAGES: Record<Stage, { icon: string; headline: string; detail: string }> = {
  1: {
    icon: '🏗️',
    headline: 'השרטוט הבסיסי מוכן!',
    detail: 'הגדרת שדות פרטיים — המחלקה שלך כבר מחזיקה מידע. private מגן עליו.',
  },
  2: {
    icon: '🎮',
    headline: 'המתבגר יכול לעשות דברים!',
    detail: 'הוספת פעולות פנימיות — כל פעולה משנה את מצב האובייקט בדרך מוגדרת.',
  },
  3: {
    icon: '🔧',
    headline: 'הקונסטרקטור מוכן!',
    detail: 'כל אובייקט שייוצר יתחיל עם הערכים שהגדרת — שליטה מלאה על נקודת ההתחלה.',
  },
  4: {
    icon: '🖨️',
    headline: 'toString() מוגדרת!',
    detail: 'עכשיו System.out.println(t1) יעבוד אוטומטית. הגיע הזמן לחיים!',
  },
  5: {
    icon: '✨',
    headline: 'אובייקט חי נוצר!',
    detail: 'מתבגר אמיתי מסתובב בזיכרון המחשב שלך. השרטוט הפך לישות.',
  },
  6: {
    icon: '🎬',
    headline: 'ביצעת אינטראקציה!',
    detail: 'ראית בפועל איך פעולות פנימיות משנות את מצב האובייקט לפני ואחרי.',
  },
  7: {
    icon: '🎓',
    headline: 'כל הכבוד — סיימת את הקורס!',
    detail: 'למדת: שדות • פעולות פנימיות • קונסטרקטור • toString() • יצירת אובייקט • אינטראקציה • אנקפסולציה',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LevelComplete() {
  const showLevelComplete = useAppStore((s) => s.showLevelComplete);
  const pendingLevelComplete = useAppStore((s) => s.pendingLevelComplete);
  const levelCompleteForStage = useAppStore((s) => s.levelCompleteForStage);
  const currentStage = useAppStore((s) => s.currentStage);
  const isModuleComplete = useAppStore((s) => s.isModuleComplete);
  const dismissLevelComplete = useAppStore((s) => s.dismissLevelComplete);
  const triggerLevelComplete = useAppStore((s) => s.triggerLevelComplete);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const setEditorReadOnly = useAppStore((s) => s.setEditorReadOnly);

  // 3-second delay: when pendingLevelComplete becomes true, wait then show overlay
  useEffect(() => {
    if (!pendingLevelComplete) return;
    const timer = setTimeout(() => triggerLevelComplete(), 3000);
    return () => clearTimeout(timer);
  }, [pendingLevelComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNext() {
    // Switch to the required file for the new stage
    const requiredFile = STAGE_CONFIGS[currentStage].requiredFile;
    if (requiredFile) setActiveFile(requiredFile);
    dismissLevelComplete(true);
  }

  function handleStay() {
    dismissLevelComplete(false);
  }

  if (!levelCompleteForStage) return null;
  const msg = COMPLETE_MESSAGES[levelCompleteForStage];
  const isFinal = isModuleComplete && levelCompleteForStage === 7;
  // Offer manual editing for the Teenager.java stages (1–4)
  const showEditPrompt = levelCompleteForStage <= 4;

  function handleEditManually() {
    setEditorReadOnly(false);
    dismissLevelComplete(false); // stay on completed stage, editor unlocked
  }

  return (
    <AnimatePresence>
      {showLevelComplete && (
        <motion.div
          className="level-complete-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="level-complete-card"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            dir="rtl"
          >
            {/* Confetti-like top bar */}
            <div className="level-complete-bar" />

            <div className="level-complete-icon">{msg.icon}</div>

            <div className="level-complete-stage-label">
              {isFinal ? 'סיום הקורס' : `שלב ${levelCompleteForStage} הושלם ✓`}
            </div>

            <h2 className="level-complete-headline">{msg.headline}</h2>
            <p className="level-complete-detail">{msg.detail}</p>

            {showEditPrompt && (
              <div className="lc-edit-prompt" dir="rtl">
                <span>💡 רוצה לנסות לערוך את הקוד ישירות?</span>
                <button className="lc-edit-btn" onClick={handleEditManually}>
                  ✏️ ערוך ידנית
                </button>
              </div>
            )}

            {isFinal ? (
              <div className="level-complete-actions">
                <button className="lc-stay-btn" onClick={handleStay}>
                  חזרה לסקירה
                </button>
              </div>
            ) : (
              <div className="level-complete-actions">
                <button className="lc-stay-btn" onClick={handleStay}>
                  🔄 להישאר ולתרגל
                </button>
                <button className="lc-next-btn" onClick={handleNext}>
                  לשלב הבא ←
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
