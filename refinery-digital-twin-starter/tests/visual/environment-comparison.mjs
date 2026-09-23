import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import assert from 'node:assert/strict';
import { openRun, root } from '../../scripts/visual-common.mjs';
const folder = resolve(root, 'docs/handbacks/evidence/stageB-task-03');
const baseline = PNG.sync.read(await readFile(resolve(root, 'tests/visual/baseline/engineering/CAM-1-default.png')));
const returned = PNG.sync.read(await readFile(resolve(folder, 'CAM-1-engineering-after-switch.png')));
const percent = pixelmatch(baseline.data, returned.data, null, baseline.width, baseline.height, { threshold: .1, includeAA: true }) * 100 / (baseline.width * baseline.height);
await writeFile(resolve(folder, 'return-engineering.json'), JSON.stringify({ differingPixelsPercent: percent, passed: percent <= .5 }, null, 2));
assert.ok(percent <= .5, 'engineering restored after visiting photoreal');
const reference = (await readFile(resolve(root, 'docs/reference/petromind-wide.png'))).toString('base64');
const current = (await readFile(resolve(folder, 'CAM-1-photoreal-default.png'))).toString('base64');
const run = await openRun();
try {
  await run.page.setViewportSize({ width: 2400, height: 800 });
  await run.page.setContent(`<style>body{margin:0;background:#101923;color:#eef2f5;font:22px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px}img{width:100%;height:660px;object-fit:contain;background:#172331}h2{font-size:22px;margin:8px 0}</style><main><section><h2>Mostafa's PetroMind reference — wide view</h2><img src="data:image/png;base64,${reference}"></section><section><h2>Stage B Task 3 — fixed CAM-1, environment only</h2><img src="data:image/png;base64,${current}"></section></main>`);
  await run.page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  await run.page.screenshot({ path: resolve(folder, 'CAM-1-benchmark-comparison.png') });
  console.log(`Engineering after round trip: ${percent.toFixed(4)}% PASS; benchmark comparison rendered.`);
} finally { await run.close(); }
