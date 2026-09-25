import { useSyncExternalStore } from 'react';
import config from '../../data/presentation/motion.json';
const params = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);
let state = { hour: params.get('look') === 'photoreal-night' ? config.nightHour : config.dayHour, enabled: true, cycling: false, revision: 0 };
let time = 2, cycleHour = state.hour, notified = 0;
const listeners = new Set<() => void>();
export const motionSnapshot = () => state;
export const motionTime = () => time;
const publish = (next: Partial<typeof state>) => { state = { ...state, ...next }; listeners.forEach(fn => fn()); };
export const useMotion = () => useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, motionSnapshot);
export const setHour = (hour: number) => { cycleHour = ((hour % 24) + 24) % 24; publish({ hour: cycleHour, cycling: false }); };
export const setMotion = (enabled: boolean) => publish({ enabled, cycling: enabled && state.cycling });
export const setCycle = (cycling: boolean) => { cycleHour = state.hour; publish({ cycling: cycling && state.enabled }); };
export const pauseCycle = () => { if (state.cycling) publish({ cycling: false }); };
export function advanceMotion(delta: number) {
  if (!state.enabled) return;
  time += delta;
  if (state.cycling) {
    cycleHour = (cycleHour + delta * 24 / config.cycleSeconds) % 24;
    notified += delta;
    if (notified >= .1) { notified = 0; publish({ hour: cycleHour }); }
  }
}
if (typeof window !== 'undefined' && params.get('measure') === '1') Object.assign(window, { __refineryMotion: {
  read: () => ({ ...state, time }), setHour, setMotion, setCycle,
  setTime: (seconds: number) => { time = seconds; publish({ revision: state.revision + 1 }); },
} });
