import { Component, type ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import { loadingFailed, loadingSnapshot, subscribeLoading } from './loading';
export function LoadingIndicator() {
  const state = useSyncExternalStore(subscribeLoading, loadingSnapshot);
  const [now, setNow] = useState(() => performance.now());
  const active = state.phase !== 'done';
  useEffect(() => {
    if (!active || state.phase === 'error') return;
    const timer = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(timer);
  }, [active, state.phase]);
  useEffect(() => {
    const onFailure = (event: PromiseRejectionEvent) => {
      if (loadingSnapshot().phase !== 'done' && /WebGL|Error creating.*context/i.test(String(event.reason))) loadingFailed('WebGL is unavailable. Enable hardware acceleration or try another browser.');
    };
    window.addEventListener('unhandledrejection', onFailure);
    return () => window.removeEventListener('unhandledrejection', onFailure);
  }, []);
  if (!active) return null;
  const percentage = Math.min(100, Math.floor(state.received / state.total * 100));
  const label = state.phase === 'error' ? 'Loading interrupted' : state.phase === 'draw' ? 'Preparing scene' : state.pack === 'engineering' ? 'Loading plant' : 'Loading photoreal';
  return <section className="load-overlay" data-look={state.pack} data-phase={state.phase} aria-label="Scene loading">
    <div className="load-panel"><span className="eyebrow">REFINERY DIGITAL TWIN</span><h2 role="status">{label}</h2>
      <div className="load-numbers"><strong>{percentage}%</strong><span>{(Math.max(0, now - state.started) / 1000).toFixed(1)} s elapsed</span></div>
      <progress aria-label={label} value={state.received} max={state.total} />
      {state.error && <><p role="alert">{state.error}</p><button onClick={() => location.reload()}>Reload</button></>}
    </div>
  </section>;
}

export class SceneLoadingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { loadingFailed(error.message); }
  render() { return this.state.failed ? null : this.props.children; }
}
