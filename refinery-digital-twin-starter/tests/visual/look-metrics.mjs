import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
const quantile = (values, q) => [...values].sort((a, b) => a - b)[Math.ceil(q * values.length) - 1];
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const results = [];
for (const look of ['engineering', 'photoreal']) {
  const run = await openRun();
  try {
    const hardware = await openLook(run, look);
    await camera(run.page, config.cameras[0]);
    const initialDownloadBytes = await run.page.evaluate(() => [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].filter(entry => entry.responseEnd <= window.__refineryVisual.interactiveAt).reduce((sum, entry) => sum + entry.transferSize, 0));
    assert.ok(initialDownloadBytes > 0, 'cold Resource Timing download must be positive');
    const samples = await run.page.evaluate(spec => window.__refineryVisual.orbit(spec), config.cameras[0]);
    assert.ok(samples.length > 1 && samples.every(sample => Number.isFinite(sample.ms) && sample.ms > 0));
    results.push({ look, hardware, warmupSeconds: 3, orbitSeconds: 10, frames: samples.length, drawCallsMean: mean(samples.map(s => s.calls)), trianglesMean: mean(samples.map(s => s.triangles)), fpsMedian: quantile(samples.map(s => 1000 / s.ms), .5), frameTimeP95Ms: quantile(samples.map(s => s.ms), .95), geometries: Math.max(...samples.map(s => s.geometries)), textures: Math.max(...samples.map(s => s.textures)), initialDownloadBytes, samples });
    assert.deepEqual(run.errors, []);
  } finally { await run.close(); }
}
const output = resolve(root, 'docs/metrics');
await mkdir(output, { recursive: true });
const note = 'Task 1 whole-plant photoreal placeholder uses shared plant geometry and procedural colors only: no additional downloadable photoreal assets (0 bytes). Archived study is not served. Task 0 baseline is retained separately. Budgets apply from Task 2.';
await writeFile(resolve(output, 'stageB-task-01.json'), JSON.stringify({ note, lazyPhotorealAssetBytes: 0, results }, null, 2) + '\n');
const markdown = `# Stage B Task 1 metrics\n\n${note}\n\n| Look | Draw calls | Triangles | Median FPS | p95 ms | Geometries | Textures | Initial bytes |\n|---|---:|---:|---:|---:|---:|---:|---:|\n${results.map(r => `| ${r.look} | ${r.drawCallsMean.toFixed(1)} | ${r.trianglesMean.toFixed(0)} | ${r.fpsMedian.toFixed(1)} | ${r.frameTimeP95Ms.toFixed(2)} | ${r.geometries} | ${r.textures} | ${r.initialDownloadBytes} |`).join('\n')}\n`;
await writeFile(resolve(output, 'stageB-task-01.md'), markdown);
console.log(markdown);
