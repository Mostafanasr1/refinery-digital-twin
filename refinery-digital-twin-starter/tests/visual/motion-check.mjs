import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook } from './look-common.mjs';
const output = resolve(root, 'docs/handbacks/evidence/stageC-task-01');
await mkdir(output, { recursive: true });
const run = await openRun();
try {
  const hardware = await openLook(run, 'photoreal');
  const overlap = async (a, b) => {
    const x = await run.page.locator(a).boundingBox(), y = await run.page.locator(b).boundingBox();
    return x && y && x.x < y.x + y.width && x.x + x.width > y.x && x.y < y.y + y.height && x.y + x.height > y.y;
  };
  assert.equal(await overlap('.time-controls', '.operations'), false, 'desktop controls must not overlap');
  for (const [label, hour] of [['day', 12], ['dusk', 18], ['night', 22]]) {
    await run.page.evaluate(hour => window.__refineryMotion.setHour(hour), hour);
    for (const spec of config.cameras) {
      await camera(run.page, spec);
      await run.page.screenshot({ path: resolve(output, `${spec.id}-${label}.png`) });
    }
  }
  await run.page.setViewportSize(config.viewport);
  run.url += '&animate=1&captureCycle=1';
  await openLook(run, 'photoreal');
  await camera(run.page, config.cameras[5]);
  const before = await run.page.evaluate(() => window.__refineryMotionActors());
  await run.page.waitForTimeout(700);
  const moved = await run.page.evaluate(() => window.__refineryMotionActors());
  for (const key of ['vehicles', 'fans', 'flag', 'dust', 'steam']) assert.notDeepEqual(before[key], moved[key], `${key} must move`);
  const blink = new Set();
  for (let i = 0; i < 20; i++) { blink.add(await run.page.evaluate(() => window.__refineryMotionActors().aviation)); await run.page.waitForTimeout(100); }
  assert.deepEqual([...blink].sort(), [false, true]);
  await run.page.getByRole('checkbox', { name: 'Motion', exact: true }).uncheck();
  await run.page.waitForTimeout(150);
  const frozen = await run.page.evaluate(() => window.__refineryMotionActors());
  await run.page.waitForTimeout(700);
  assert.deepEqual(await run.page.evaluate(() => window.__refineryMotionActors()), frozen, 'master must freeze all actors');
  await run.page.getByRole('checkbox', { name: 'Motion', exact: true }).check();
  await run.page.waitForTimeout(400);
  assert.notDeepEqual(await run.page.evaluate(() => window.__refineryMotionActors()), frozen);
  await run.page.getByRole('button', { name: 'Night lighting', exact: true }).click();
  await run.page.waitForTimeout(400);
  await run.page.getByRole('button', { name: 'Day', exact: true }).click();
  await run.page.waitForTimeout(400);
  await run.page.goBack(); await run.page.waitForFunction(() => window.__refineryMotion.read().hour === 22 && window.__refineryVisual.look === 'photoreal-night');
  await run.page.goForward(); await run.page.waitForFunction(() => window.__refineryMotion.read().hour === 12 && window.__refineryVisual.look === 'photoreal');
  await run.page.evaluate(() => window.__refineryMotion.setCycle(true));
  await run.page.waitForTimeout(500);
  assert.ok((await run.page.evaluate(() => window.__refineryMotion.read())).hour > 12);
  await run.page.mouse.move(100, 800);
  assert.equal((await run.page.evaluate(() => window.__refineryMotion.read())).cycling, false);
  await switchLook(run.page, 'engineering');
  assert.equal(await run.page.evaluate(() => window.__refineryMotionActors().visible), false);
  await switchLook(run.page, 'engineering');
  await camera(run.page, config.cameras[0]);
  await run.page.screenshot({ path: resolve(output, 'engineering-control.png') });
  await switchLook(run.page, 'photoreal');
  await run.page.evaluate(() => window.__refineryMotion.setHour(12));
  for (const viewport of [{ width: 412, height: 915 }, { width: 915, height: 412 }]) {
    await run.page.setViewportSize(viewport); await camera(run.page, config.cameras[5]);
    const bounds = await run.page.locator('.time-controls').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width && bounds.y + bounds.height <= viewport.height);
    await run.page.screenshot({ path: resolve(output, `mobile-${viewport.width}x${viewport.height}.png`) });
    await run.page.getByRole('button', { name: 'Controls', exact: true }).click();
    assert.equal(await overlap('.time-controls', '.operations'), false);
    const path = await run.page.getByLabel('Process path', { exact: true }).locator('option').nth(1).getAttribute('value');
    await run.page.getByLabel('Process path', { exact: true }).selectOption(path);
    assert.equal(await overlap('.time-controls', '.playback'), false);
    await run.page.screenshot({ path: resolve(output, `mobile-${viewport.width}x${viewport.height}-flow.png`) });
    await run.page.getByLabel('Process path', { exact: true }).selectOption('');
    await run.page.getByRole('button', { name: 'Controls', exact: true }).click();
  }
  await run.page.setViewportSize(config.viewport);
  for (const look of ['engineering', 'photoreal']) {
    await switchLook(run.page, look);
    const path = await run.page.getByLabel('Process path', { exact: true }).locator('option').nth(1).getAttribute('value');
    await run.page.getByLabel('Process path', { exact: true }).selectOption(path);
    await run.page.waitForFunction(() => window.__refineryMotionActors().flows.length > 0);
    const flow = await run.page.evaluate(() => window.__refineryMotionActors().flows[0]);
    await run.page.waitForTimeout(300);
    assert.notDeepEqual(await run.page.evaluate(() => window.__refineryMotionActors().flows[0]), flow);
    await run.page.getByRole('checkbox', { name: 'Motion', exact: true }).uncheck(); await run.page.waitForTimeout(100);
    const stopped = await run.page.evaluate(() => window.__refineryMotionActors().flows[0]);
    await run.page.waitForTimeout(200);
    assert.deepEqual(await run.page.evaluate(() => window.__refineryMotionActors().flows[0]), stopped);
    await run.page.getByRole('checkbox', { name: 'Motion', exact: true }).check();
    await run.page.getByLabel('Process path', { exact: true }).selectOption('');
  }
  // Real idle entry, not the measurement bridge: camera + cycle then any input exits.
  run.url = run.url.replace('&captureCycle=1', '');
  await openLook(run, 'photoreal');
  await run.page.waitForFunction(() => document.querySelector('main').dataset.presentation === 'attract', { }, { timeout: 70000 });
  assert.equal(await run.page.evaluate(() => window.__refineryMotion.read().cycling), true);
  assert.equal(await overlap('.time-controls', '.tour-caption'), false);
  await run.page.waitForTimeout(400);
  await run.page.mouse.move(300, 300);
  await run.page.waitForFunction(() => document.querySelector('main').dataset.presentation === 'idle');
  assert.equal(await run.page.evaluate(() => window.__refineryMotion.read().cycling), false);
  await run.page.getByRole('button', { name: 'Follow the process' }).click();
  await run.page.waitForFunction(() => document.querySelector('main').dataset.presentation === 'tour');
  assert.equal(await overlap('.time-controls', '.tour-caption'), false);
  await run.page.screenshot({ path: resolve(output, 'desktop-tour-controls.png') });
  await run.page.waitForFunction(() => document.querySelector('.tour-complete'), {}, { timeout: 50000 });
  assert.equal(await overlap('.time-controls', '.tour-complete'), false);
  await run.page.screenshot({ path: resolve(output, 'desktop-tour-complete.png') });
  assert.deepEqual(run.errors, []);
  await writeFile(resolve(output, 'capture-check.json'), JSON.stringify({ status: 'PASS', hardware, errors: run.errors }, null, 2));
} finally { await run.close(); }
