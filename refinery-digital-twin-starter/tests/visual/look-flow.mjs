import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook, snapshot, plantIdentity } from './look-common.mjs';

const output = resolve(root, 'tests/visual/output/look-flow');
await mkdir(output, { recursive: true });
const assets = JSON.parse(await readFile(resolve(root, 'data/normalized/assets.json'), 'utf8'));
const paths = JSON.parse(await readFile(resolve(root, 'data/normalized/process_paths.json'), 'utf8'));
const scenarios = JSON.parse(await readFile(resolve(root, 'data/normalized/scenarios.json'), 'utf8'));
const select = async (page, tag) => {
  const asset = assets.find(asset => asset.tag === tag);
  await page.getByRole('button', { name: `${asset.tag} ${asset.name}`, exact: true }).click();
  await page.mouse.move(1590, 890);
  assert.match(await page.locator('.card').innerText(), new RegExp(tag));
};
const results = [];
const run = await openRun();
let glbRequests = 0;
run.page.on('request', request => { if (new URL(request.url()).pathname.endsWith('/models/refinery.glb')) glbRequests++; });
try {
  const hardware = await openLook(run);
  for (const geometry of ['proxy', 'blender']) {
    await run.page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption(geometry);
    await run.page.waitForTimeout(500);
    assert.deepEqual((await snapshot(run.page)).registryIds, assets.map(asset => asset.asset_id).sort(), 'geometry replacement preserves every registry binding before other interactions');
  }
  for (const geometry of ['blender', 'proxy']) {
    await run.page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption(geometry);
    await select(run.page, 'T-201');
    await camera(run.page, config.cameras[0]);
    const before = await snapshot(run.page);
    assert.deepEqual(before.registryIds, assets.map(asset => asset.asset_id).sort(), 'all canonical registry bindings survive geometry switches');
    const card = await run.page.locator('.card').innerText();
    assert.ok(plantIdentity(before).length, 'plant identity snapshot must not be empty');
    const requestsBefore = glbRequests;
    await switchLook(run.page, 'photoreal');
    const photo = await snapshot(run.page);
    assert.deepEqual(photo.camera, before.camera, 'look switch preserves camera');
    assert.deepEqual(plantIdentity(photo), plantIdentity(before), 'same plant meshes and geometry across looks');
    assert.equal(await run.page.locator('.card').innerText(), card, 'identical card after switch');
    await switchLook(run.page, 'engineering');
    const warm = await snapshot(run.page);
    const counts = [];
    for (let index = 0; index < 10; index++) {
      const look = index % 2 ? 'engineering' : 'photoreal';
      await switchLook(run.page, look);
      const state = await snapshot(run.page);
      assert.deepEqual(plantIdentity(state), plantIdentity(before), 'ten switches never replace plant geometry');
      assert.deepEqual(state.camera, before.camera);
      assert.equal(await run.page.locator('.card').innerText(), card);
      counts.push({ look, geometries: state.geometries, textures: state.textures });
    }
    const after = await snapshot(run.page);
    assert.equal(after.geometries, warm.geometries, 'geometry count stable after ten switches');
    assert.equal(after.textures, warm.textures, 'texture count stable after ten switches');
    assert.equal(after.geometries, before.geometries, 'return to engineering does not accumulate geometry');
    assert.equal(glbRequests, requestsBefore, 'switches never reload the GLB');

    for (const layer of ['health', 'temperature', 'energy', 'sensors']) {
      await run.page.getByRole('combobox', { name: 'Data layer', exact: true }).selectOption(layer);
      const legend = await run.page.locator('.legend').innerText();
      await switchLook(run.page, 'photoreal');
      assert.equal(await run.page.locator('.legend').innerText(), legend);
      assert.equal(await run.page.getByRole('combobox', { name: 'Data layer', exact: true }).inputValue(), layer);
      await switchLook(run.page, 'engineering');
      assert.equal(await run.page.locator('.legend').innerText(), legend);
    }
    await run.page.getByRole('combobox', { name: 'Process path', exact: true }).selectOption(paths[0].process_path_id);
    await run.page.getByRole('button', { name: 'Pause', exact: true }).click();
    const playback = await run.page.locator('.playback').innerText();
    await switchLook(run.page, 'photoreal');
    assert.equal(await run.page.locator('.playback').innerText(), playback, 'process position preserved');
    await switchLook(run.page, 'engineering');
    assert.equal(await run.page.locator('.playback').innerText(), playback);
    await run.page.getByRole('combobox', { name: 'Scenario', exact: true }).selectOption(scenarios[0].scenario_id);
    await select(run.page, 'P-101A');
    const scenarioCard = await run.page.locator('.card').innerText();
    assert.match(scenarioCard, /trip/i);
    const alerts = await run.page.locator('.alerts').innerText();
    await switchLook(run.page, 'photoreal');
    assert.equal(await run.page.locator('.card').innerText(), scenarioCard);
    assert.equal(await run.page.locator('.alerts').innerText(), alerts);
    await run.page.getByRole('button', { name: 'Play', exact: true }).click();
    await run.page.waitForFunction(() => [...document.querySelectorAll('.card .metric')].some(metric => metric.querySelector('span')?.textContent === 'flow' && metric.querySelector('strong')?.textContent?.startsWith('0 ')));
    await run.page.getByRole('button', { name: 'Pause', exact: true }).click();
    const advancedCard = await run.page.locator('.card').innerText();
    assert.notEqual(advancedCard, scenarioCard, 'scenario advances operating values while photoreal is active');
    await switchLook(run.page, 'engineering');
    assert.equal(await run.page.locator('.card').innerText(), advancedCard);
    await run.page.getByRole('button', { name: 'Stop / reset', exact: true }).click();
    results.push({ geometry, initialGeometryCount: before.geometries, finalGeometryCount: after.geometries, counts, lookSwitches: 10, glbRequestsDuringSwitches: glbRequests - requestsBefore, selection: 'PASS', layers: 'PASS', process: 'PASS', scenario: 'PASS', camera: 'PASS' });
  }
  // Fresh direct URL proves persistence, and supplies all fixed photoreal captures.
  await openLook(run, 'photoreal');
  for (const variant of ['default', 'selected']) {
    if (variant === 'selected') await select(run.page, config.selectedTag);
    for (const spec of config.cameras) {
      await camera(run.page, spec);
      await run.page.screenshot({ path: resolve(output, `${spec.id}-photoreal-${variant}.png`), animations: 'disabled' });
    }
  }
  assert.deepEqual(run.errors, []);
  const report = { hardware, results, directPhotorealUrl: 'PASS', screenshotCount: 10, errors: run.errors };
  await writeFile(resolve(output, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await run.close(); }
