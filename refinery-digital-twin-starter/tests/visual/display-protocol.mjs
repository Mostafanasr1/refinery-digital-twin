import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { openRun, camera, config, root, metricsFlags } from '../../scripts/visual-common.mjs';
import { readMeasurementState } from '../../scripts/measurement-validity.mjs';

const condition = process.argv[2];
const staticRoot = resolve(process.argv[3] ?? '');
assert.ok(['external', 'laptop'].includes(condition), 'Specify external or laptop, then the preserved Task 3 artifact directory');
const sourceCommit = 'c1c5b70ce6e3e6af075306ee25c8b6d0c78c4ef3';
const output = resolve(root, 'docs/metrics/display-protocol-stress');
await mkdir(output, { recursive: true });
const quantile = (values, q) => [...values].sort((a, b) => a - b)[Math.ceil(q * values.length) - 1];
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
async function digestTree(directory) {
  const hash = createHash('sha256');
  async function visit(path) {
    for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = resolve(path, entry.name);
      if (entry.isDirectory()) await visit(file);
      else hash.update(relative(directory, file).replaceAll('\\', '/')).update(await readFile(file));
    }
  }
  await visit(directory); return hash.digest('hex');
}
const signature = state => ({ displays: state.displays, acConnected: state.acConnected, powerPlan: state.powerPlan, noExternalMonitor: state.noExternalMonitor });
function validateState(state) {
  assert.equal(state.acConnected, true, 'AC required');
  assert.match(state.powerPlan, /performance/i);
  assert.equal(state.displays.length, condition === 'laptop' ? 1 : 2);
  assert.equal(state.noExternalMonitor, condition === 'laptop');
}
const report = { protocol: 'stress-p95-v2', stressAssets: 500, sourceCommit, artifactSha256: await digestTree(staticRoot), condition, viewport: config.viewport, camera: config.cameras[0], flags: metricsFlags, warmupSeconds: 3, orbitSeconds: 10, results: [] };
for (const look of ['engineering', 'photoreal']) {
  const displayState = readMeasurementState(); validateState(displayState);
  const run = await openRun({ metrics: true, staticRoot });
  try {
    await run.page.goto(`${run.url}&look=${look}&stress=500`, { waitUntil: 'networkidle' });
    await run.page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}' });
    await run.page.evaluate(() => document.fonts.ready);
    await run.page.waitForFunction(look => window.__refineryVisual?.ready && window.__refineryVisual.look === look, look);
    if (look === 'photoreal') await run.page.waitForFunction(() => document.querySelector('canvas')?.dataset.environmentReady === 'true');
    const renderer = await run.page.evaluate(() => window.__refineryVisual.renderer);
    assert.match(renderer, /NVIDIA.*3050/i);
    assert.doesNotMatch(renderer, /swiftshader|llvmpipe|software|basic render/i);
    await camera(run.page, config.cameras[0]);
    const samples = await run.page.evaluate(spec => window.__refineryVisual.orbit(spec), config.cameras[0]);
    assert.ok(samples.length > 1 && samples.every(sample => sample.ms > 0 && Number.isFinite(sample.ms)));
    const after = readMeasurementState(); validateState(after);
    assert.deepEqual(signature(after), signature(displayState), 'Conditions changed during run');
    const result = { look, displayCount: displayState.displays.length, displayState, displayStateAfter: after, browser: run.browser.version(), renderer, flags: run.flags, frameTimeMedianMs: quantile(samples.map(s => s.ms), .5), fpsDerivedFromMedian: 1000 / quantile(samples.map(s => s.ms), .5), frameTimeP95Ms: quantile(samples.map(s => s.ms), .95), drawCallsMean: mean(samples.map(s => s.calls)), trianglesMean: mean(samples.map(s => s.triangles)), samples };
    report.results.push(result);
    await writeFile(resolve(output, `${condition}.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ ...result, samples: `${samples.length} frames saved` }));
    assert.deepEqual(run.errors, []);
    // This run proves protocol agreement under stress; it is not a normal-scene budget test.
    if (look === 'engineering') assert.ok(result.frameTimeMedianMs <= 25, 'HARD STOP: engineering 500-asset budget missed');
  } finally { await run.close(); }
}
const other = resolve(output, `${condition === 'laptop' ? 'external' : 'laptop'}.json`);
let paired;
try { paired = JSON.parse(await readFile(other, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (paired) {
  assert.equal(paired.artifactSha256, report.artifactSha256);
  for (const field of ['protocol', 'stressAssets', 'sourceCommit', 'viewport', 'camera', 'flags', 'warmupSeconds', 'orbitSeconds']) assert.deepEqual(paired[field], report[field]);
  const laptop = condition === 'laptop' ? report : paired, external = condition === 'external' ? report : paired;
  const comparisons = laptop.results.map(a => {
    const b = external.results.find(r => r.look === a.look);
    assert.ok(b); assert.equal(a.browser, b.browser); assert.equal(a.renderer, b.renderer);
    assert.equal(a.displayState.powerPlan, b.displayState.powerPlan);
    const differenceMs = Math.abs(b.frameTimeP95Ms - a.frameTimeP95Ms);
    const toleranceMs = Math.max(1, a.frameTimeP95Ms * .1);
    return { look: a.look, laptopP95Ms: a.frameTimeP95Ms, externalP95Ms: b.frameTimeP95Ms, differenceMs, toleranceMs, pass: differenceMs <= toleranceMs };
  });
  const confirmed = comparisons.length === 2 && comparisons.every(r => r.pass);
  await writeFile(resolve(output, 'comparison.json'), JSON.stringify({ confirmed, comparisons }, null, 2) + '\n');
  console.log(JSON.stringify({ confirmed, comparisons }, null, 2));
  if (!confirmed) process.exitCode = 1;
} else console.log('One condition recorded; confirmation waits for the other condition.');
