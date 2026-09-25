import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, root } from '../../scripts/visual-common.mjs';
const expected = process.argv.find(arg => arg.startsWith('--main='))?.split('=')[1];
assert.match(expected ?? '', /^[a-f0-9]{40}$/);
const base = 'https://mostafanasr1.github.io/refinery-digital-twin/';
const output = resolve(root, 'docs/handbacks/evidence/stageB-task-09/loading-mobile/live');
await mkdir(output, { recursive: true });
for (const [name, executable] of [['chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'], ['edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']]) {
  process.env.VISUAL_BROWSER_PATH = executable;
  const run = await openRun();
  try {
    const release = await (await run.page.request.get(base + 'deploy.json')).json();
    assert.equal(release.branch, 'main'); assert.equal(release.commit, expected);
    const preview = await (await run.page.request.get(base + 'next/deploy.json')).json();
    assert.equal(preview.branch, 'dual-look');
    await run.page.goto(base + '?measure=1', { waitUntil: 'networkidle' });
    await run.page.locator('.load-overlay').waitFor({ state: 'detached' });
    assert.match(await run.page.locator('footer').innerText(), /57 assets bound/);
    await run.page.getByRole('link', { name: 'Photoreal', exact: true }).click();
    await run.page.waitForFunction(() => document.querySelector('main')?.dataset.look === 'photoreal');
    await run.page.locator('.load-overlay').waitFor({ state: 'detached' });
    const history = await run.page.evaluate(() => window.__refineryLoading.history);
    assert.deepEqual(history.map(item => item.pack), ['engineering', 'photoreal']);
    for (const item of history) { assert.equal(item.received, item.total); assert.ok(item.finished > item.drawn); }
    await run.page.setViewportSize({ width: 412, height: 915 });
    await run.page.getByRole('button', { name: 'Equipment', exact: true }).click();
    await run.page.getByRole('textbox', { name: 'Search equipment' }).fill('T-201');
    await run.page.getByRole('button', { name: 'T-201 Atmospheric Distillation Column', exact: true }).click();
    assert.ok(await run.page.locator('.card').isVisible());
    await run.page.screenshot({ path: resolve(output, `${name}-mobile-layout.png`) });
    await run.page.goto(base + 'next/?measure=1', { waitUntil: 'networkidle' });
    await run.page.locator('.load-overlay').waitFor({ state: 'detached' });
    assert.match(await run.page.locator('footer').innerText(), /57 assets bound/);
    assert.deepEqual(run.errors, []);
    await writeFile(resolve(output, `${name}.json`), JSON.stringify({ result: 'PASS', browser: run.browser.version(), release, preview, history, mobile: '412x915 desktop viewport only; physical phone review deferred by ruling', errors: run.errors }, null, 2));
    console.log(`${name}: live release loading, mobile controls and preserved preview PASS`);
  } finally { await run.close(); }
}
