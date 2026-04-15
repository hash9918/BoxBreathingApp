import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PHASES = [
  { key: 'inhale', label: 'Inhale', seconds: 4, scale: 1.2 },
  { key: 'holdIn', label: 'Hold', seconds: 4, scale: 1.2 },
  { key: 'exhale', label: 'Exhale', seconds: 4, scale: 0.8 },
  { key: 'holdOut', label: 'Hold', seconds: 4, scale: 0.8 },
];

const phaseDurationMs = PHASES.map((phase) => phase.seconds * 1000);

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseStartedAt, setPhaseStartedAt] = useState(0);
  const [remainingMs, setRemainingMs] = useState(phaseDurationMs[0]);
  const [completedCycles, setCompletedCycles] = useState(0);

  const rafRef = useRef(0);

  const currentPhase = useMemo(() => PHASES[phaseIndex], [phaseIndex]);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!phaseStartedAt) {
      setPhaseStartedAt(performance.now());
      setRemainingMs(phaseDurationMs[phaseIndex]);
      return;
    }

    const tick = (now) => {
      const elapsed = now - phaseStartedAt;
      const duration = phaseDurationMs[phaseIndex];
      const nextRemaining = Math.max(duration - elapsed, 0);
      setRemainingMs(nextRemaining);

      if (elapsed >= duration) {
        const nextIndex = (phaseIndex + 1) % PHASES.length;
        if (nextIndex === 0) {
          setCompletedCycles((value) => value + 1);
        }
        setPhaseIndex(nextIndex);
        setPhaseStartedAt(now);
        setRemainingMs(phaseDurationMs[nextIndex]);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, phaseIndex, phaseStartedAt]);

  const handleControl = () => {
    if (!isRunning && (phaseIndex !== 0 || completedCycles > 0 || phaseStartedAt > 0)) {
      setPhaseIndex(0);
      setCompletedCycles(0);
      setPhaseStartedAt(0);
      setRemainingMs(phaseDurationMs[0]);
      setIsRunning(true);
      return;
    }

    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (!phaseStartedAt) {
      setPhaseStartedAt(performance.now());
    }
    setIsRunning(true);
  };

  const buttonLabel = isRunning
    ? 'Pause'
    : phaseStartedAt > 0 || completedCycles > 0 || phaseIndex !== 0
      ? 'Reset & Start'
      : 'Start';

  return (
    <main className="app-shell">
      <section className="card" aria-live="polite">
        <p className="count">Cycles Completed: {completedCycles}</p>

        <div className="shape-wrap" aria-hidden="true">
          <motion.div
            className="shape"
            animate={{ scale: currentPhase.scale }}
            transition={{ duration: currentPhase.seconds, ease: 'easeInOut' }}
          />
        </div>

        <p className="phase">
          {currentPhase.label} ({(remainingMs / 1000).toFixed(1)}s)
        </p>

        <button type="button" className="control" onClick={handleControl}>
          {buttonLabel}
        </button>
      </section>
    </main>
  );
}

export default App;
