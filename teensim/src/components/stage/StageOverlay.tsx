import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import './StageOverlay.css';

export function StageOverlay() {
  const viewingStage = useAppStore((s) => s.viewingStage);
  const currentStage = useAppStore((s) => s.currentStage);
  const config = STAGE_CONFIGS[viewingStage];
  const [showWhyPrivate, setShowWhyPrivate] = useState(false);

  const isReviewing = viewingStage < currentStage;

  return (
    <div className="stage-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewingStage}
          className={`stage-card ${isReviewing ? 'reviewing' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {isReviewing && (
            <div className="reviewing-badge">מחזור חזרה — שלב {viewingStage}</div>
          )}
          <div className="stage-badge">שלב {viewingStage}/4</div>
          <div className="stage-title">{config.titleHebrew}</div>
          <div className="stage-instruction">{config.instructionHebrew}</div>
          <div className="stage-hint">
            <span className="hint-icon">💡</span>
            <code>{config.hintHebrew}</code>
          </div>

          {/* Why private? — only in stage 1 */}
          {viewingStage === 1 && (
            <div className="why-private-section">
              <button
                className="why-private-toggle"
                onClick={() => setShowWhyPrivate((v) => !v)}
              >
                {showWhyPrivate ? '▲' : '▼'} למה private?
              </button>
              <AnimatePresence>
                {showWhyPrivate && (
                  <motion.div
                    className="why-private-body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="why-row">
                      <code className="access-tag private">private</code>
                      <span>רק המחלקה עצמה יכולה לגשת לשדה זה. הנתון מוגן.</span>
                    </div>
                    <div className="why-row">
                      <code className="access-tag public">public</code>
                      <span>כל קוד חיצוני יכול לשנות את הנתון ישירות — מסוכן!</span>
                    </div>
                    <div className="why-note">
                      📌 <strong>אנקפסולציה</strong> מגנה על הנתונים של האובייקט.
                      בשלב 4 תראה מה קורה כשמנסים לשבור את הכלל.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
