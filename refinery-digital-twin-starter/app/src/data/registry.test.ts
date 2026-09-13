import { expect, it } from 'vitest';
import { Group, Mesh } from 'three';
import { AssetRegistry, worldPosition } from './registry';
import { JsonNormalizedDataLoader } from './loader';
import { readFile } from 'node:fs/promises';
const load = () => new JsonNormalizedDataLoader('./', async input => new Response(await readFile(new URL(`../../../data/normalized/${String(input).slice(2)}`, import.meta.url), 'utf8'))).load();
it('maps every asset and child mesh to canonical identity', async () => {
  const data = await load();
  const registry = new AssetRegistry(data);
  for (const asset of data.assets) {
    const group = new Group(); const child = new Mesh(); group.add(child);
    registry.bind(asset.asset_id, group);
    expect(child.userData.asset_id).toBe(asset.asset_id);
    expect(registry.modelRefs.get(asset.model_ref)).toBe(asset.asset_id);
    expect(worldPosition(asset)).toEqual([asset.position.x, asset.position.z, -asset.position.y]);
    registry.bind(asset.asset_id, null);
    expect(registry.objects.has(asset.asset_id)).toBe(false);
  }
});
it('rejects missing bindings', async () => {
  const data = await load(); data.model_bindings = [];
  expect(() => new AssetRegistry(data)).toThrow('Missing binding');
});
