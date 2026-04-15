import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { STAGE_CONFIGS } from '../../constants/stageConfig';
import './StageModal.css';

export function StageModal() {
  const viewingStage = useAppStore((s) => s.viewingStage);
  const welcomeCompleted = useAppStore((s) => s.welcomeCompleted);
  const showLevelComplete = useAppStore((s) => s.showLevelComplete);
  const seenStageModals = useAppStore((s) => s.seenStageModals);
  const stageModalOpen = useAppStore((s) => s.stageModalOpen);
  const markStageModalSeen = useAppStore((s) => s.markStageModalSeen);

  const config = STAGE_CONFIGS[viewingStage];

  // Show automatically only on first visit; also show when manually reopened
  const isFirstVisit = !seenStageModals.includes(viewingStage);
  const show = welcomeCompleted && !showLevelComplete && (isFirstVisit || stageModalOpen);

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
              onClick={() => markStageModalSeen(viewingStage)}
            >
              {config.modalButtonText} →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
