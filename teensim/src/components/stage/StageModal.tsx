import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import './StageModal.css';

export function StageModal() {
  const viewingStage = useAppStore((s) => s.viewingStage);
  const welcomeCompleted = useAppStore((s) => s.welcomeCompleted);
  const showLevelComplete = useAppStore((s) => s.showLevelComplete);
  const config = STAGE_CONFIGS[viewingStage];
  const [dismissed, setDismissed] = useState(false);

  // Reset every time viewingStage changes — show modal again
  useEffect(() => {
    setDismissed(false);
  }, [viewingStage]);

  // Only show after welcome is done and no level-complete screen is visible
  const show = !dismissed && welcomeCompleted && !showLevelComplete;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="stage-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="stage-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            dir="rtl"
          >
            <div className="stage-modal-stage-badge">שלב {viewingStage} מתוך 7</div>
            <h2 className="stage-modal-title">{config.modalTitle}</h2>
            <p className="stage-modal-body">{config.modalBody}</p>

            {config.modalCode && (
              <pre className="stage-modal-code">{config.modalCode}</pre>
            )}

            <button
              className="stage-modal-btn"
              onClick={() => setDismissed(true)}
            >
              {config.modalButtonText} →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
