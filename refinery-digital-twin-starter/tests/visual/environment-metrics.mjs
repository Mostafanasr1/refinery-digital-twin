import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
const before = process.argv.includes('--before');
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const quantile = (values, q) => [...values].sort((a, b) => a - b)[Math.ceil(q * values.length) - 1];
const cases = before ? [{ look: 'engineering', stress: 0 }] : [{ look: 'engineering', stress: 0 }, { look: 'photoreal', stress: 0 }, { look: 'engineering', stress: 500 }];
const results = [];
for (const { look, stress } of cases) {
  const run = await openRun();
  try {
    if (before) run.url = 'http://127.0.0.1:3102/?measure=1';
    if (stress) run.url += `&stress=${stress}`;
    const hardware = await openLook(run, look);
    await camera(run.page, config.cameras[0]);
    const initialDownloadBytes = await run.page.evaluate(() => [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].filter(entry => entry.responseEnd <= window.__refineryVisual.interactiveAt).reduce((sum, entry) => sum + entry.transferSize, 0));
    assert.ok(initialDownloadBytes > 0);
    const { samples, categories } = await run.page.evaluate(async spec => {
      const start = performance.now(), categories = []; let active = true;
      const record = () => {
        if (!active) return;
        if (performance.now() - start >= 3000) categories.push(window.__refineryBudgetSnapshot());
        requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
      const samples = await window.__refineryVisual.orbit(spec);
      active = false;
      return { samples, categories };
    }, config.cameras[0]);
    assert.ok(samples.length > 1 && categories.length > 1);
    assert.ok(categories.every(sample => Number.isFinite(sample.total) && sample.post >= 0), 'Profiler must account for actual frame submissions');
    const categoryMean = {};
    for (const group of ['color', 'shadow']) {
      categoryMean[group] = {};
      for (const name of ['equipment', 'pipes', 'lamps', 'ground', 'helpers']) categoryMean[group][name] = mean(categories.map(sample => sample[group][name]));
    }
    categoryMean.post = mean(categories.map(sample => sample.post));
    const result = { look, stressAssets: stress, hardware, drawCallsMean: mean(samples.map(s => s.calls)), trianglesMean: mean(samples.map(s => s.triangles)), fpsMedian: quantile(samples.map(s => 1000 / s.ms), .5), frameTimeP95Ms: quantile(samples.map(s => s.ms), .95), geometries: Math.max(...samples.map(s => s.geometries)), textures: Math.max(...samples.map(s => s.textures)), initialDownloadBytes, categoryMean, samples };
    result.budgetPass = before || (stress ? result.fpsMedian >= 40 : result.drawCallsMean <= (look === 'engineering' ? 150 : 200) && result.fpsMedian >= (look === 'engineering' ? 60 : 40) && result.frameTimeP95Ms <= (look === 'engineering' ? 20 : 33) && (look !== 'engineering' || initialDownloadBytes <= 13200115));
    results.push(result);
    assert.deepEqual(run.errors, []);
  } finally { await run.close(); }
}
const output = resolve(root, 'docs/metrics'); await mkdir(output, { recursive: true });
const suffix = before ? 'before' : 'after';
await writeFile(resolve(output, `stageB-task-03-${suffix}.json`), JSON.stringify({ source: before ? 'Approved Task 1 source with identical profiler only, no rendering change' : 'Task 3 candidate', results }, null, 2) + '\n');
const text = `# Task 3 ${suffix}\n\n| Look | Stress assets | Draw calls | Triangles | FPS median | p95 ms | Initial bytes | Budget |\n|---|---:|---:|---:|---:|---:|---:|---|\n${results.map(r => `| ${r.look} | ${r.stressAssets || 'normal'} | ${r.drawCallsMean.toFixed(1)} | ${r.trianglesMean.toFixed(0)} | ${r.fpsMedian.toFixed(1)} | ${r.frameTimeP95Ms.toFixed(2)} | ${r.initialDownloadBytes} | ${before ? 'baseline' : r.budgetPass ? 'PASS' : 'FAIL'} |`).join('\n')}\n\n` + results.map(r => `## ${r.look} / ${r.stressAssets || 'normal'} submissions\n\n| Category | Color | Shadow |\n|---|---:|---:|\n${Object.keys(r.categoryMean.color).map(name => `| ${name} | ${r.categoryMean.color[name].toFixed(1)} | ${r.categoryMean.shadow[name].toFixed(1)} |`).join('\n')}\n\nPost passes: ${r.categoryMean.post.toFixed(1)}.\n`).join('\n');
await writeFile(resolve(output, `stageB-task-03-${suffix}.md`), text); console.log(text);
if (!before && results.some(result => !result.budgetPass)) { console.error('HARD STOP: an approved rendering budget was missed.'); process.exitCode = 1; }
