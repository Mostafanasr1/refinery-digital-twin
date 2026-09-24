import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';

const assets = JSON.parse(await readFile(resolve(root, 'data/normalized/assets.json'), 'utf8'));
const results = [];
const run = await openRun();
try {
  const hardware = await openLook(run);
  for (const look of process.argv.includes('--night-only') ? ['photoreal-night'] : ['engineering', 'photoreal']) {
    await openLook(run, look);
    for (const geometry of ['blender', 'proxy']) {
      await run.page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption(geometry);
      for (const asset of assets) {
        const close = run.page.getByRole('button', { name: 'Close equipment details', exact: true });
        if (await close.count()) await close.click();
        const { x, y, z } = asset.position;
        const size = Math.max(...Object.values(asset.dimensions), 5);
        const height = asset.dimensions.height ?? size;
        const target = [x, z + height * .45, -y];
        let clicked = false;
        for (const [dx, dy, dz] of [[1,.8,1],[-1,.9,1],[1,1,-1],[-1,1,-1],[.1,2,.1]]) {
          await camera(run.page, { position: target.map((value, index) => value + [dx,dy,dz][index] * size * 1.7), target });
          const point = await run.page.evaluate(id => window.__refineryPickPoint(id), asset.asset_id);
          if (!point) continue;
          const canvasTopmost = await run.page.evaluate(({x,y}) => document.elementFromPoint(x,y)?.tagName === 'CANVAS', point);
          if (!canvasTopmost) continue;
          await run.page.mouse.click(point.x, point.y);
          await run.page.waitForTimeout(100);
          if (await run.page.locator('.card h2').textContent().catch(() => '') === asset.tag) { clicked = true; break; }
        }
        assert.ok(clicked, `${look}/${geometry}: actual canvas pick must select ${asset.asset_id}`);
        assert.equal(await run.page.locator('.card .asset-name').textContent(), asset.name);
        results.push({ look, geometry, assetId: asset.asset_id, tag: asset.tag });
      }
      console.log(`${look}/${geometry}: ${assets.length}/${assets.length} actual canvas picks and cards PASS`);
    }
  }
  assert.deepEqual(run.errors, []);
  const task = process.argv.find(arg => arg.startsWith('--task='))?.split('=')[1] ?? '02';
  assert.match(task, /^\d{2}$/);
  const output = resolve(root, `docs/handbacks/evidence/stageB-task-${task}`);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'selection-all.json'), JSON.stringify({ hardware, results }, null, 2) + '\n');
} finally { await run.close(); }
