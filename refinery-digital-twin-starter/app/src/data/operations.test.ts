import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { JsonNormalizedDataLoader } from './loader';
import { effectiveData, emptyScenario, evaluateScenario, layerStyle, traceAt } from './operations';
const load = () => new JsonNormalizedDataLoader('./', async input => new Response(await readFile(new URL(`../../../data/normalized/${String(input).slice(2)}`, import.meta.url), 'utf8'))).load();
describe('data driven operations', () => {
  it('visits each path asset in order and clamps at completion', async () => {
    const data = await load();
    for (const path of data.process_paths) {
      path.ordered_asset_ids.forEach((id, i) => expect(traceAt(data, path.process_path_id, i * 2).assetId).toBe(id));
      expect(traceAt(data, path.process_path_id, 1000).complete).toBe(true);
    }
    expect(traceAt(data, 'missing', 0).path).toBeUndefined();
  });
  it('applies trip, downstream loss, standby recovery, and clears all alerts', async () => {
    const data = await load(), scenario = data.scenarios[0];
    const initial = JSON.stringify(data);
    expect(evaluateScenario(scenario, 0).statuses[scenario.trigger_asset_id!]).toBe('trip');
    const loss = evaluateScenario(scenario, 1);
    expect(Object.values(loss.metrics)).toContain(0);
    const recovered = evaluateScenario(scenario, 7);
    expect(recovered.alerts).toEqual({});
    expect(Object.values(recovered.metrics)).toContain(238);
    expect(effectiveData(data, recovered).telemetry).not.toEqual(data.telemetry);
    expect(effectiveData(data, emptyScenario())).toEqual(data);
    expect(JSON.stringify(data)).toBe(initial);
    expect(evaluateScenario(scenario, 1)).toEqual(loss);
  });
  it('layers handle missing values and use telemetry', async () => {
    const data = await load();
    const asset = data.assets[0];
    expect(layerStyle(asset, data, 'none')).toBeNull();
    expect(layerStyle(asset, { ...data, telemetry: [] }, 'temperature')?.label).toBe('No data');
    expect(layerStyle(asset, data, 'sensors')?.label).toContain('points');
  });
});
