import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useLook } from './looks/LookProvider';
import { advanceMotion, pauseCycle, setHour, setMotion, useMotion } from './motionState';
import config from '../../data/presentation/motion.json';
import { setDressing, useDressing } from './sliceState';
export function MotionClock() {
  const { look } = useLook();
  const state = useMotion();
  const invalidate = useThree(s => s.invalidate);
  useEffect(() => { invalidate(); }, [state, invalidate]);
  useFrame((_, delta) => {
    const query = new URLSearchParams(location.search);
    const frozen = query.get('measure') === '1' && query.get('animate') !== '1';
    if (look.id !== 'engineering' && !frozen) advanceMotion(Math.min(delta, .1));
    if (look.id !== 'engineering' && state.enabled && !frozen) invalidate();
  }, -2);
  return null;
}
export function TimeControls() {
  const dressing = useDressing();
  const state = useMotion();
  const { choose } = useLook();
  useEffect(() => {
    const events = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'focusin'];
    events.forEach(name => window.addEventListener(name, pauseCycle, { passive: true }));
    return () => events.forEach(name => window.removeEventListener(name, pauseCycle));
  }, []);
  const minutes = Math.floor(state.hour * 60);
  return <div className="time-controls" aria-label="Time and motion">
    <label>Time <output>{String(Math.floor(minutes / 60)).padStart(2, '0')}:{String(minutes % 60).padStart(2, '0')}</output><input aria-label="Time of day" type="range" min="0" max="23.99" step="0.01" value={state.hour} onChange={e => setHour(Number(e.target.value))} /></label>
    <button onClick={() => { choose('photoreal'); setHour(config.dayHour); }}>Day</button><button aria-label="Night lighting" onClick={() => { choose('photoreal-night'); setHour(config.nightHour); }}>Night</button>
    <label className="motion-switch"><input type="checkbox" checked={state.enabled} onChange={e => setMotion(e.target.checked)} />Motion</label>
    <label className="motion-switch"><input type="checkbox" checked={dressing} onChange={e => setDressing(e.target.checked)} />Dressing</label>
  </div>;
}
