import { motion, AnimatePresence } from 'framer-motion';
import type { MethodName } from '../../constants/methodEffects';
import './MethodAnimations.css';

interface AnimProps {
  active: MethodName | null;
}

function StudyAnimation() {
  return (
    <motion.div
      className="anim-overlay study-anim"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="anim-desk">
        <div className="anim-book">📖</div>
        <div className="anim-book" style={{ animationDelay: '0.2s' }}>📝</div>
      </div>
      <motion.div
        className="anim-light"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >💡</motion.div>
    </motion.div>
  );
}

function SleepAnimation() {
  return (
    <motion.div
      className="anim-overlay sleep-anim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="sleep-backdrop" />
      {['Z', 'Z', 'Z'].map((z, i) => (
        <motion.span
          key={i}
          className="zzz"
          style={{ left: `${30 + i * 20}%` }}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -40, scale: [0.5, 1, 0.5] }}
          transition={{ delay: i * 0.4, duration: 1.2, repeat: Infinity }}
        >{z}</motion.span>
      ))}
    </motion.div>
  );
}

function EatAnimation() {
  return (
    <motion.div
      className="anim-overlay eat-anim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="anim-food"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >🍕</motion.div>
      <motion.div
        className="energy-pulse"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0] }}
        transition={{ duration: 0.8, repeat: 2 }}
      >+20 ⚡</motion.div>
    </motion.div>
  );
}

function PlayGamesAnimation() {
  return (
    <motion.div
      className="anim-overlay play-anim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="controller"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >🎮</motion.div>
      <motion.div
        className="screen-glow"
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
    </motion.div>
  );
}

function TalkAnimation() {
  return (
    <motion.div
      className="anim-overlay talk-anim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="phone-icon"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >📱</motion.div>
      {['💬', '💭', '💬'].map((b, i) => (
        <motion.span
          key={i}
          className="chat-bubble"
          style={{ left: `${20 + i * 25}%` }}
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -30, scale: 1 }}
          transition={{ delay: i * 0.3, duration: 0.9, repeat: Infinity }}
        >{b}</motion.span>
      ))}
    </motion.div>
  );
}

export function MethodAnimation({ active }: AnimProps) {
  return (
    <AnimatePresence>
      {active === 'study' && <StudyAnimation key="study" />}
      {active === 'sleep' && <SleepAnimation key="sleep" />}
      {active === 'eat' && <EatAnimation key="eat" />}
      {active === 'playGames' && <PlayGamesAnimation key="play" />}
      {active === 'talkToFriends' && <TalkAnimation key="talk" />}
    </AnimatePresence>
  );
}
