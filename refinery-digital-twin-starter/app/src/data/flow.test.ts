import { expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { JsonNormalizedDataLoader } from './loader';
import { evaluateScenario } from './operations';
import { flowCurve } from '../FlowOverlay';
const load = () => new JsonNormalizedDataLoader('./', async input => new Response(await readFile(new URL(`../../../data/normalized/${String(input).slice(2)}`, import.meta.url), 'utf8'))).load();
it('keeps flow endpoints above equipment and moves over distance', async () => {
  const data = await load();
  for (const c of data.connections) {
    const from=data.assets.find(a=>a.asset_id===c.from_asset_id)!;
    const to=data.assets.find(a=>a.asset_id===c.to_asset_id)!;
    const curve=flowCurve(from,to);
    expect(curve.getPointAt(0).y).toBeGreaterThan(from.position.z+from.dimensions.height);
    expect(curve.getPointAt(1).y).toBeGreaterThan(to.position.z+to.dimensions.height);
    expect(curve.getPointAt(0.2).distanceTo(curve.getPointAt(0.4))).toBeGreaterThan(1);
  }
});
it('switches the scenario to a valid standby route after trip', async () => {
  const data=await load(), scenario=data.scenarios[0];
  const tripped=evaluateScenario(scenario,0), recovery=evaluateScenario(scenario,4);
  expect(tripped.pathId).not.toBe(recovery.pathId);
  const path=data.process_paths.find(p=>p.process_path_id===recovery.pathId)!;
  expect(path).toBeDefined();
  expect(path.ordered_asset_ids.some(id=>recovery.statuses[id]==='trip')).toBe(false);
});
