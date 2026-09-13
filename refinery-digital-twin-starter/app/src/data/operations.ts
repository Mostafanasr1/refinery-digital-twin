import type { Asset, NormalizedData, Scenario } from './loader';
export const layers = ['none', 'health', 'temperature', 'energy', 'sensors'] as const;
export type Layer = typeof layers[number];
export interface ScenarioState {
  statuses: Record<string, string>; metrics: Record<string, string | number | boolean>;
  highlights: string[]; alerts: Record<string, string>; pathId: string | null;
  layer: Layer | null; cameraId: string | null;
}
export const emptyScenario = (): ScenarioState => ({ statuses: {}, metrics: {}, highlights: [], alerts: {}, pathId: null, layer: null, cameraId: null });
/** Pure time evaluation makes restart, seek, and reset deterministic. Source data stays immutable. */
export function evaluateScenario(scenario: Scenario | undefined, seconds: number): ScenarioState {
  const state = emptyScenario();
  if (!scenario) return state;
  for (const step of scenario.steps) {
    if (step.at_seconds > seconds) continue;
    for (const action of step.actions) {
      const id = action.asset_id ?? '';
      switch (action.type) {
        case 'set_asset_status': state.statuses[id] = String(action.value); break;
        case 'set_metric': state.metrics[`${id}:${action.metric}`] = action.value!; break;
        case 'highlight_asset': if (action.style === 'clear') state.highlights = state.highlights.filter(value => value !== id); else state.highlights.push(id); break;
        case 'highlight_path': state.pathId = action.path_id ?? null; break;
        case 'set_layer': state.layer = action.layer_id as Layer; break;
        case 'show_alert': state.alerts[id] = action.message ?? 'Alert'; break;
        case 'clear_alert': delete state.alerts[id]; break;
        case 'camera_focus': state.cameraId = id; break;
        case 'wait': break; // Absolute at_seconds is the scheduling authority.
        default: throw new Error(`Unsupported scenario action: ${action.type}`);
      }
    }
  }
  return state;
}
export function effectiveData(data: NormalizedData, state: ScenarioState): NormalizedData {
  return { ...data, assets: data.assets.map(a => ({ ...a, status: state.statuses[a.asset_id] ?? a.status })),
    telemetry: data.telemetry.map(t => ({ ...t, value: state.metrics[`${t.asset_id}:${t.parameter}`] ?? t.value })) };
}
export function traceAt(data: NormalizedData, pathId: string, seconds: number) {
  const path = data.process_paths.find(p => p.process_path_id === pathId);
  if (!path) return { path: undefined, index: -1, assetId: null, complete: false };
  const index = Math.min(Math.floor(Math.max(0, seconds) / 2), path.ordered_asset_ids.length - 1);
  return { path, index, assetId: path.ordered_asset_ids[index], complete: seconds >= path.ordered_asset_ids.length * 2 };
}
export function layerStyle(asset: Asset, data: NormalizedData, layer: Layer): { color: string; label: string } | null {
  if (layer === 'none') return null;
  if (layer === 'health' && asset.status === 'trip') return { color: '#ed665c', label: 'Trip' };
  const points = data.telemetry.filter(t => t.asset_id === asset.asset_id);
  const point = points.find(t => layer === 'temperature' ? t.parameter.includes('temperature') : layer === 'energy' ? t.parameter === 'power' : t.parameter === layer);
  const value = layer === 'sensors' ? points.length : typeof point?.value === 'number' ? point.value : null;
  if (value === null) return { color: '#52616c', label: 'No data' };
  if (layer === 'health') return { color: value >= 90 ? '#44c39e' : value >= 70 ? '#e3b85c' : '#ed665c', label: `${value}%` };
  const max = layer === 'temperature' ? 400 : layer === 'energy' ? 30 : 5;
  const t = Math.min(1, Math.max(0, value / max));
  return { color: `hsl(${195 - 180 * t}, 70%, 58%)`, label: layer === 'sensors' ? `${value} points` : `${value} ${point?.unit}` };
}
