import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { looks, lookFromUrl, lookUrl, type LookId } from './looks';
const LookContext = createContext({ look: looks.engineering, switching: false, environmentLoading: false, setEnvironmentLoading: (loading: boolean) => { void loading; }, setMaterialLoading: (loading: boolean) => { void loading; }, choose: (id: LookId) => { void id; } });
export const useLook = () => useContext(LookContext);
export function LookProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<LookId>(() => lookFromUrl(new URL(location.href)));
  const [environmentLoading, setEnvironmentLoading] = useState(false);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const current = useRef(id);
  const switchTo = (next: LookId, writeUrl: boolean) => {
    if (current.current === next) return;
    timers.current.forEach(clearTimeout);
    current.current = next;
    setPhase('out');
    timers.current = [setTimeout(() => {
      setId(next);
      if (writeUrl) history.pushState(null, '', lookUrl(new URL(location.href), next));
      setPhase('in');
    }, 150), setTimeout(() => setPhase('idle'), 300)];
  };
  useEffect(() => {
    const sync = () => switchTo(lookFromUrl(new URL(location.href)), false);
    window.addEventListener('popstate', sync); window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); timers.current.forEach(clearTimeout); };
  }, []);
  return <LookContext.Provider value={{ look: looks[id], environmentLoading: environmentLoading || materialLoading, setEnvironmentLoading, setMaterialLoading, switching: phase !== 'idle', choose: next => switchTo(next, true) }}>{children}<div aria-hidden="true" data-look-fade={phase} style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#08151e', pointerEvents: phase === 'idle' ? 'none' : 'auto', opacity: phase === 'out' ? 1 : 0, transition: 'opacity 150ms ease' }} /></LookContext.Provider>;
}
