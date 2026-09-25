import assert from 'node:assert/strict';
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook, snapshot, plantIdentity } from './look-common.mjs';
const run = await openRun(), requests = [];
const output = resolve(root, 'docs/handbacks/evidence/stageB-task-03');
await mkdir(output, { recursive: true });
run.page.on('request', request => { if (request.url().includes('/assets/env/')) requests.push(request.url()); });
try {
  const hardware = await openLook(run);
  await camera(run.page, config.cameras[0]);
  assert.equal(requests.length, 0, 'engineering does not fetch environment assets');
  const before = await snapshot(run.page);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await run.page.route('**/assets/env/sky.hdr', async route => { await pending; await route.continue(); });
  await run.page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  try {
    await run.page.waitForFunction(() => document.querySelector('a[aria-label="Photoreal"]')?.getAttribute('aria-busy') === 'true');
    assert.match(await run.page.getByRole('link', { name: 'Photoreal', exact: true }).innerText(), /Loading/);
  } finally { release(); }
  await run.page.waitForFunction(() => document.querySelector('canvas')?.dataset.environmentReady === 'true');
  await run.page.waitForTimeout(400);
  assert.deepEqual(plantIdentity(await snapshot(run.page)), plantIdentity(before));
  assert.ok(requests.some(url => url.endsWith('sky.hdr')) && requests.some(url => url.endsWith('context.glb')));
  const loadedRequests = requests.length;
  await switchLook(run.page, 'engineering');
  await camera(run.page, config.cameras[0]);
  await run.page.screenshot({ path: resolve(output, 'CAM-1-engineering-after-switch.png') });
  await switchLook(run.page, 'photoreal');
  assert.equal(requests.length, loadedRequests, 'repeat switch reuses cached assets');
  for (const spec of config.cameras) {
    await camera(run.page, spec);
    await run.page.screenshot({ path: resolve(output, `${spec.id}-photoreal-default.png`) });
  }
  const folder = resolve(root, 'data/normalized/assets/env');
  const sizes = await Promise.all((await readdir(folder)).map(async name => ({ name, bytes: (await stat(resolve(folder, name))).size })));
  const lazyBytes = sizes.reduce((sum, item) => sum + item.bytes, 0);
  assert.ok(lazyBytes <= 40_000_000, 'photoreal asset budget');
  assert.deepEqual(run.errors, []);
  const result = { hardware, loadingIndicator: 'PASS while HDR request held', engineeringEnvironmentRequests: 0, loadedRequests, repeatSwitchRequests: requests.length - loadedRequests, lazyBytes, files: sizes, plantIdentity: 'unchanged', errors: run.errors };
  await writeFile(resolve(output, 'environment-flow.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await run.close(); }
