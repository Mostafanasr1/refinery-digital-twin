import { DefaultLoadingManager } from 'three';
import sizes from 'virtual:asset-sizes';

type Pack = 'engineering' | 'photoreal';
type Progress = { pack: Pack; received: number; total: number; phase: 'download' | 'draw' | 'done' | 'error'; started: number; error?: string; drawn?: number; finished?: number };
const listeners = new Set<() => void>();
const blobs = new Map<string, string>();
const pending = new Map<Pack, Promise<void>>();
const history: Progress[] = [];
const packs = new Map<Pack, Progress>();
const rendered = new Set<Pack>();
let active: Pack | null = 'engineering';
const isEngineeringAsset = (path: string) => path === 'models/refinery.glb' || path.startsWith('assets/dressing/');
let state: Progress = { pack: 'engineering', received: 0, total: Object.keys(sizes).filter(isEngineeringAsset).reduce((sum,path)=>sum+sizes[path],0), phase: 'download', started: performance.now() };
export const loadingSnapshot = () => state;
export const subscribeLoading = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const publish = (value: Partial<Progress>) => { state = { ...state, ...value }; listeners.forEach(fn => fn()); };
const absolute = (path: string) => new URL(import.meta.env.BASE_URL + path, document.baseURI).href;
export const assetUrl = (url: string) => blobs.get(new URL(url, document.baseURI).href) ?? url;
DefaultLoadingManager.setURLModifier(assetUrl);

/** Count decoded response-body bytes against build-time file sizes, including cache hits.
 * Blob URLs feed the existing Three loaders without a second network download. */
export function preparePack(pack: Pack): Promise<void> {
  const existing = pending.get(pack);
  if (existing) {
    if (!rendered.has(pack)) { active = pack; publish(packs.get(pack)!); }
    return existing;
  }
  active = pack;
  const paths = Object.keys(sizes).filter(path => pack === 'engineering' ? isEngineeringAsset(path) : !isEngineeringAsset(path));
  publish({ pack, received: 0, total: paths.reduce((sum, path) => sum + sizes[path], 0), phase: 'download', started: performance.now(), drawn: undefined, finished: undefined, error: undefined });
  packs.set(pack, state);
  const update = (value: Partial<Progress>) => {
    const next = { ...packs.get(pack)!, ...value }; packs.set(pack, next);
    if (active === pack) publish(next);
  };
  const controller = new AbortController();
  const promise = Promise.all(paths.map(async path => {
    const response = await fetch(absolute(path), { signal: controller.signal });
    if (!response.ok || !response.body) throw new Error(`Could not load ${path} (${response.status})`);
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); received += value.byteLength;
      update({ received: packs.get(pack)!.received + value.byteLength });
    }
    if (received !== sizes[path]) throw new Error(`Asset size changed: ${path}. Reload the page to get the latest build.`);
    blobs.set(absolute(path), URL.createObjectURL(new Blob(chunks, { type: response.headers.get('content-type') ?? 'application/octet-stream' })));
  })).then(() => { update({ phase: 'draw' }); }).catch((error: unknown) => {
    controller.abort(); update({ phase: 'error', error: String(error) }); throw error;
  });
  pending.set(pack, promise);
  return promise;
}
export function finishLoading(drawn: number) {
  if (state.phase !== 'draw') return;
  publish({ phase: 'done', drawn, finished: performance.now() }); history.push(state);
  rendered.add(state.pack); packs.set(state.pack, state);
  // Decoded Three resources are now resident; release the temporary response copies.
  for (const path of Object.keys(sizes).filter(path => state.pack === 'engineering' ? isEngineeringAsset(path) : !isEngineeringAsset(path))) {
    const url = absolute(path), blob = blobs.get(url);
    if (blob) { URL.revokeObjectURL(blob); blobs.delete(url); }
  }
}
export function dismissLoading() {
  if (!rendered.has('engineering') && packs.has('engineering')) {
    active = 'engineering'; publish(packs.get('engineering')!);
  } else { active = null; publish({ phase: 'done' }); }
}
export function loadingFailed(error: unknown) { publish({ phase: 'error', error: String(error) }); }
// Small, read-only evidence surface; normal rendering does not depend on it.
if (typeof window !== 'undefined' && new URLSearchParams(location.search).get('measure') === '1') Object.assign(window, { __refineryLoading: { snapshot: loadingSnapshot, history } });
