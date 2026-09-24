import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
import { readMeasurementState, measurementValidity } from '../../scripts/measurement-validity.mjs';
const before = false;
const task = process.argv.find(arg => arg.startsWith('--task='))?.split('=')[1];
assert.match(task ?? '', /^\d{2}$/, 'Specify --task=NN to avoid overwriting historical measurements');
const previous = JSON.parse(await readFile(resolve(root, 'docs/metrics/stageB-task-02-after.json'), 'utf8')).results;
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const quantile = (values, q) => [...values].sort((a, b) => a - b)[Math.ceil(q * values.length) - 1];
const cases = before ? [{ look: 'engineering', stress: 0 }] : [{ look: 'engineering', stress: 0 }, { look: 'photoreal', stress: 0 }, { look: 'engineering', stress: 500 }];
if (task === '06') cases.push({ look: 'photoreal-night', stress: 0 });
const results = [];
for (const { look, stress } of cases) {
  const displayState = readMeasurementState();
  const refreshHz = displayState.displays.find(display => display.primary)?.refreshHz;
  const prior = previous.find(result => result.look === look && result.stressAssets === stress);
  const setup = measurementValidity({ fpsMedian: 0, previousFps: 0, refreshHz, state: displayState, uncapped: true });
  if (!setup.valid) {
    await writeFile(resolve(root, `docs/metrics/stageB-task-${task}-invalid-setup.json`), JSON.stringify({ displayState, validity: setup }, null, 2));
    console.error('INVALID measurement setup: ' + setup.reasons.join('; ')); process.exit(2);
  }
  const run = await openRun({ metrics: true });
  try {
    if (before) run.url = 'http://127.0.0.1:3102/?measure=1';
    if (stress) run.url += `&stress=${stress}`;
    if (task === '06') run.url += '&animate=1';
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
    const result = { look, stressAssets: stress, hardware, drawCallsMean: mean(samples.map(s => s.calls)), trianglesMean: mean(samples.map(s => s.triangles)), frameTimeMedianMs: quantile(samples.map(s => s.ms), .5), fpsMedian: 1000 / quantile(samples.map(s => s.ms), .5), frameTimeP95Ms: quantile(samples.map(s => s.ms), .95), geometries: Math.max(...samples.map(s => s.geometries)), textures: Math.max(...samples.map(s => s.textures)), initialDownloadBytes, categoryMean, samples };
    result.displayState = displayState;
    result.displayCount = displayState.displays.length;
    result.refreshHz = refreshHz;
    result.previousFps = prior?.fpsMedian;
    result.validity = measurementValidity({ fpsMedian: result.fpsMedian, previousFps: result.previousFps, refreshHz, state: displayState, uncapped: true });
    result.budgetPass = before || (stress ? result.frameTimeMedianMs <= 25 : result.drawCallsMean <= (look === 'engineering' ? 150 : 200) && result.frameTimeMedianMs <= (look === 'engineering' ? 1000 / 60 : 25) && result.frameTimeP95Ms <= (look === 'engineering' ? 20 : 33) && (look !== 'engineering' || initialDownloadBytes <= 13200115));
    if (!result.validity.valid) result.budgetPass = null;
    results.push(result);
    assert.deepEqual(run.errors, []);
  } finally { await run.close(); }
}
const output = resolve(root, 'docs/metrics'); await mkdir(output, { recursive: true });
const suffix = 'rerun';
await writeFile(resolve(output, `stageB-task-${task}-${suffix}.json`), JSON.stringify({ source: before ? 'Approved Task 1 source with identical profiler only, no rendering change' : `Task ${task} candidate, uncapped frame-time protocol`, results }, null, 2) + '\n');
const text = `# Task ${task} ${suffix}\n\n| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |\n|---|---:|---:|---:|---:|---:|---:|---:|---|\n${results.map(r => `| ${r.look} | ${r.stressAssets || 'normal'} | ${r.drawCallsMean.toFixed(1)} | ${r.trianglesMean.toFixed(0)} | ${r.frameTimeMedianMs.toFixed(2)} | ${r.frameTimeP95Ms.toFixed(2)} | ${r.fpsMedian.toFixed(1)} | ${r.initialDownloadBytes} | ${before ? 'baseline' : !r.validity.valid ? 'INVALID' : r.budgetPass ? 'PASS' : 'FAIL'} |`).join('\n')}\n\n` + results.map(r => `## ${r.look} / ${r.stressAssets || 'normal'} submissions\n\nDisplay: ${r.refreshHz} Hz; AC: ${r.displayState.acConnected}; laptop only: ${r.displayState.noExternalMonitor}; ${r.displayState.powerPlan}. Previous comparable FPS: ${r.previousFps?.toFixed(1) ?? 'not measured'}. Measurement: ${r.validity.valid ? 'VALID' : 'INVALID — ' + r.validity.reasons.join('; ')}.\n\n| Category | Color | Shadow |\n|---|---:|---:|\n${Object.keys(r.categoryMean.color).map(name => `| ${name} | ${r.categoryMean.color[name].toFixed(1)} | ${r.categoryMean.shadow[name].toFixed(1)} |`).join('\n')}\n\nPost passes: ${r.categoryMean.post.toFixed(1)}.\n`).join('\n');
await writeFile(resolve(output, `stageB-task-${task}-${suffix}.md`), text); console.log(text);
if (results.some(result => !result.validity.valid)) { console.error('INVALID: refresh-capped measurement; no budget verdict.'); process.exitCode = 2; }
else if (!before && results.some(result => !result.budgetPass)) { console.error('HARD STOP: an approved rendering budget was missed.'); process.exitCode = 1; }
