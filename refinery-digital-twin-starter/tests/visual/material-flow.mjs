import assert from 'node:assert/strict';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook, snapshot, plantIdentity } from './look-common.mjs';
const output = resolve(root, 'docs/handbacks/evidence/stageB-task-04');
await mkdir(output, { recursive: true });
const run = await openRun(), requests = [];
run.page.on('request', request => { if (request.url().includes('/assets/materials/')) requests.push(request.url()); });
try {
  const hardware = await openLook(run);
  assert.equal(requests.length, 0, 'Engineering must not fetch the material pack');
  const identity = plantIdentity(await snapshot(run.page));
  await switchLook(run.page, 'photoreal');
  assert.deepEqual(plantIdentity(await snapshot(run.page)), identity);
  assert.equal(requests.filter(url => url.endsWith('.ktx2')).length, 24);
  const loaded = requests.length;
  await switchLook(run.page, 'engineering');
  await switchLook(run.page, 'photoreal');
  assert.equal(requests.length, loaded, 'Material pack is cached across look changes');
  for (const look of ['engineering', 'photoreal']) {
    await switchLook(run.page, look);
    for (const spec of config.cameras) {
      await camera(run.page, spec);
      await run.page.screenshot({ path: resolve(output, `${spec.id}-${look}-default.png`) });
    }
  }
  const files = [];
  for (const folder of ['env', 'materials']) {
    const directory = resolve(root, 'data/normalized/assets', folder);
    for (const file of await readdir(directory)) files.push({ file: `${folder}/${file}`, bytes: (await stat(resolve(directory, file))).size });
  }
  const lazyBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  assert.ok(lazyBytes <= 40_000_000, `Lazy package ${lazyBytes} exceeds budget`);
  const result = { hardware, materialRequestsOnEngineeringLoad: 0, textureRequests: 24, cached: true, plantIdentity: 'unchanged', lazyBytes, files, errors: run.errors };
  assert.deepEqual(run.errors, []);
  await writeFile(resolve(output, 'material-flow.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await run.close(); }
const swatches = await openRun();
try {
  swatches.url += '&materialSwatches=1';
  await openLook(swatches, 'photoreal');
  await swatches.page.waitForTimeout(500);
  await swatches.page.screenshot({ path: resolve(output, 'material-swatches.png') });
  assert.deepEqual(swatches.errors, []);
} finally { await swatches.close(); }
