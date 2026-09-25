import { motionSnapshot, pauseCycle, setCycle } from './motionState';
import { useCallback, useEffect, useRef, useState } from 'react';
import config from '../../data/presentation/tours.json';
import { useLook } from './looks/LookProvider';
import type { LookId } from './looks/looks';
export type Pose = { position: number[]; target: number[] };
export type CameraMove = { from: Pose; to: Pose; duration: number; easing: string; startedAt: number };
export function interpolatePose(move: CameraMove, now: number): Pose {
  const t = Math.max(0, Math.min(1, (now - move.startedAt) / (move.duration * 1000)));
  const amount = move.easing === 'linear' ? t : t * t * (3 - 2 * t);
  const mix = (a: number[], b: number[]) => a.map((value, i) => value + (b[i] - value) * amount);
  return { position: mix(move.from.position, move.to.position), target: mix(move.from.target, move.to.target) };
}
const tour = config.tours[0];
export function usePresentation(select: (id: string | null) => void) {
  const { choose, look } = useLook();
  const callbacks = useRef({ choose, select, look: look.id });
  callbacks.current = { choose, select, look: look.id };
  const [mode, setMode] = useState<'idle' | 'tour' | 'attract'>('idle');
  const [move, setMove] = useState<CameraMove | null>(null);
  const [caption, setCaption] = useState('');
  const [complete, setComplete] = useState(false);
  const state = useRef({ mode: 'idle' as 'idle' | 'tour' | 'attract', start: 0, lastInput: performance.now(), leg: -1, reveal: false, revealed: false, photoAttract: false });
  const stop = useCallback(() => {
    state.current.mode = 'idle'; state.current.lastInput = performance.now();
    pauseCycle(); setMode('idle'); setMove(null); setCaption('');
  }, []);
  const start = useCallback((reveal = false) => {
    Object.assign(state.current, { mode: 'tour', start: performance.now(), leg: -1, reveal, revealed: false });
    setComplete(false); setMode('tour');
  }, []);
  useEffect(() => {
    const input = (event: Event) => {
      state.current.lastInput = performance.now();
      if (state.current.mode === 'attract' || (state.current.mode === 'tour' && ((event instanceof KeyboardEvent && event.key === 'Escape') || ((event.type === 'pointerdown' || event.type === 'wheel') && event.target instanceof HTMLCanvasElement)))) stop();
    };
    const events = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'focusin'];
    events.forEach(name => window.addEventListener(name, input, { passive: true }));
    const timer = window.setInterval(() => {
      const s = state.current, now = performance.now();
      if (document.hidden) { s.lastInput = now; if (s.mode !== 'idle') stop(); return; }
      if (!motionSnapshot().enabled) { if (s.mode !== 'idle') stop(); return; }
      if (!(new URLSearchParams(location.search).get('measure') === '1' && new URLSearchParams(location.search).get('captureCycle') === '1') && s.mode === 'idle' && now - s.lastInput >= config.idleSeconds * 1000) {
        Object.assign(s, { mode: 'attract', start: now, leg: -1, photoAttract: callbacks.current.look !== 'engineering' });setMode('attract');setComplete(false); if(callbacks.current.look !== 'engineering')setCycle(true);
      }
      if (s.mode === 'tour') {
        const elapsed = (now - s.start) / 1000;
        if (elapsed >= tour.duration) { stop(); setComplete(true); return; }
        const action = tour.actions.find(a => a.type === 'camera_move' && elapsed >= a.at && elapsed < a.at + a.duration);
        if (action && action.at !== s.leg && action.from && action.to) {
          s.leg = action.at;
          setMove({ from: action.from, to: action.to, duration: action.duration, easing: action.easing ?? 'smoothstep', startedAt: s.start + action.at * 1000 });
          callbacks.current.select(action.assetId ?? null);
        }
        setCaption(tour.actions.find(a => a.type === 'caption' && elapsed >= a.at && elapsed < a.at + a.duration)?.text ?? '');
        if (s.reveal && !s.revealed && elapsed >= tour.reveal.at) { s.revealed = true; callbacks.current.choose(tour.reveal.look as LookId); }
      } else if (s.mode === 'attract') {
        const leg = Math.floor((now - s.start) / (config.attractLegSeconds * 1000));
        if (leg !== s.leg) {
          s.leg = leg;const cameras = config.attractCameras;
          setMove({ from: cameras[leg % cameras.length], to: cameras[(leg + 1) % cameras.length], duration: config.attractLegSeconds, easing: 'smoothstep', startedAt: s.start + leg * config.attractLegSeconds * 1000 });
          callbacks.current.select(null); if (!s.photoAttract) callbacks.current.choose(leg % 2 ? 'photoreal' : 'engineering');
          setCaption('Explore the refinery · move the pointer or press any key to take control');
        }
      }
    }, 100);
    return () => { clearInterval(timer);events.forEach(name => window.removeEventListener(name, input)); };
  }, [stop]);
  return { mode, move, caption, complete, start, stop };
}
