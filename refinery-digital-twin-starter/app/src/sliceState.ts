import { useSyncExternalStore } from 'react';
let enabled = (typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search)).get('dressing') !== '0';
const listeners = new Set<() => void>();
export function setDressing(value: boolean) { enabled = value; listeners.forEach(fn => fn()); }
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const useDressing = () => useSyncExternalStore(subscribe, () => enabled);
