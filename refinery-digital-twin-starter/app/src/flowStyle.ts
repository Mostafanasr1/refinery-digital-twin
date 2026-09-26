import { useSyncExternalStore } from 'react';
import config from '../../data/presentation/flow.json';
export type FlowStyle = 'pipes' | 'arcs';
export function flowStyleFromUrl(url: URL): FlowStyle {
  return url.searchParams.get('flow') === 'arcs' ? 'arcs' : config.defaultStyle as FlowStyle;
}
export function flowStyleUrl(url: URL, style: FlowStyle): URL {
  const next = new URL(url); next.searchParams.set('flow', style); return next;
}
const eventName = 'refinery-flow-style';
function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener); window.addEventListener(eventName, listener);
  return () => { window.removeEventListener('popstate', listener); window.removeEventListener(eventName, listener); };
}
export function setFlowStyle(style: FlowStyle) {
  history.pushState(null, '', flowStyleUrl(new URL(location.href), style));
  window.dispatchEvent(new Event(eventName));
}
export function useFlowStyle(): FlowStyle {
  return useSyncExternalStore(subscribe, () => flowStyleFromUrl(new URL(location.href)), () => 'pipes');
}
