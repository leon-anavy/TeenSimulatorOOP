import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { AvatarBase } from './AvatarBase';
import { StatusBars } from './StatusBars';
import { MethodAnimation } from '../animations/MethodAnimations';
import './SimulationView.css';

export function SimulationView() {
  const instances = useAppStore((s) => s.instances);
  const instanceList = Object.values(instances).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="simulation-view">
      <div className="bedroom-bg">
        {/* Bedroom elements */}
        <div className="bedroom-window">🪟</div>
        <div className="bedroom-shelf">📚 🏆 🎧</div>
        <div className="bedroom-floor" />
      </div>

      <div className="instances-row">
        <AnimatePresence>
          {instanceList.map((inst) => (
            <motion.div
              key={inst.id}
              className="instance-card"
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="instance-label">
                <code>Teenager {inst.id}</code>
              </div>
              <div className="avatar-wrap">
                <AvatarBase state={inst.state} />
                <MethodAnimation active={inst.activeAnimation} />
              </div>
              <StatusBars state={inst.state} />
            </motion.div>
          ))}
        </AnimatePresence>

        {instanceList.length === 0 && (
          <div className="empty-world">
            <p>העולם ריק...</p>
            <p>צור מתבגר עם <code>new Teenager()</code></p>
          </div>
        )}
      </div>
    </div>
  );
}
