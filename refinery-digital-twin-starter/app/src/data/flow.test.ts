import { expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { JsonNormalizedDataLoader } from './loader';
import { evaluateScenario } from './operations';
const load = () => new JsonNormalizedDataLoader('./', async input => new Response(await readFile(new URL(`../../../data/normalized/${String(input).slice(2)}`, import.meta.url), 'utf8'))).load();
it('switches the scenario to a valid standby route after trip', async () => {
  const data=await load(), scenario=data.scenarios[0];
  const tripped=evaluateScenario(scenario,0), recovery=evaluateScenario(scenario,4);
  expect(tripped.pathId).not.toBe(recovery.pathId);
  const path=data.process_paths.find(p=>p.process_path_id===recovery.pathId)!;
  expect(path).toBeDefined();
  expect(path.ordered_asset_ids.some(id=>recovery.statuses[id]==='trip')).toBe(false);
});
