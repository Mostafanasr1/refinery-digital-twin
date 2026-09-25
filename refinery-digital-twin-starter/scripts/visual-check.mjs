import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { openRun, captureEngineering, config, root } from './visual-common.mjs';
import { validateBaselineProtocol } from './visual-config.mjs';
const output = resolve(root, 'tests/visual/output/engineering');
const run = await openRun();
try {
  const hardware = await captureEngineering(run, output);
  const baselineHardware = JSON.parse(await readFile(resolve(root, 'tests/visual/baseline/engineering/capture.json'), 'utf8'));
  if (hardware.browser !== baselineHardware.browser || hardware.renderer !== baselineHardware.renderer || JSON.stringify(hardware.flags) !== JSON.stringify(baselineHardware.flags)) throw new Error('Browser, renderer or flags differ from approved capture environment. Do not silently replace the baseline.');
  const { regressionCameras, captureOnlyCameras } = validateBaselineProtocol(config, baselineHardware.config);
  const results = [];
  for (const spec of regressionCameras) for (const variant of ['default', 'selected']) {
    const name = `${spec.id}-${variant}.png`;
    const before = PNG.sync.read(await readFile(resolve(root, 'tests/visual/baseline/engineering', name)));
    const after = PNG.sync.read(await readFile(resolve(output, name)));
    if (before.width !== after.width || before.height !== after.height) throw new Error(`Dimensions differ: ${name}`);
    const diff = new PNG({ width: before.width, height: before.height });
    const pixels = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: 0.1, includeAA: true });
    const percent = pixels * 100 / (before.width * before.height);
    results.push({ name, pixels, percent, passed: percent <= 0.5 });
    await writeFile(resolve(output, name.replace('.png', '-diff.png')), PNG.sync.write(diff));
    console.log(`${name}: ${percent.toFixed(4)}% differing pixels (${percent <= 0.5 ? 'PASS' : 'FAIL'})`);
  }
  for (const spec of captureOnlyCameras) for (const variant of ['default', 'selected']) {
    const name = `${spec.id}-${variant}.png`;
    results.push({ name, status: 'capture-only', reason: 'New approved camera; no engineering baseline or pixel percentage exists.' });
    console.log(`${name}: CAPTURED — new approved camera, no baseline comparison`);
  }
  await writeFile(resolve(output, 'comparison.json'), JSON.stringify(results, null, 2) + '\n');
  if (results.some(result => result.passed === false)) process.exitCode = 1;
} finally { await run.close(); }
