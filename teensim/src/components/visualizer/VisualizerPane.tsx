import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { BlueprintView } from './BlueprintView';
import { SimulationView } from './SimulationView';
import './VisualizerPane.css';

export function VisualizerPane() {
  const activeFile = useAppStore((s) => s.activeFile);
  const isBlueprintMode = activeFile === 'Teenager.java';

  return (
    <div className="visualizer-pane">
      <div className="visualizer-mode-badge">
        {isBlueprintMode ? '🔬 Blueprint View' : '🌍 Simulation View'}
      </div>
      <AnimatePresence mode="wait">
        {isBlueprintMode ? (
          <motion.div
            key="blueprint"
            className="visualizer-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BlueprintView />
          </motion.div>
        ) : (
          <motion.div
            key="simulation"
            className="visualizer-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SimulationView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
