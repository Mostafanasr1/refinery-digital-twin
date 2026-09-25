import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, navigate, camera, config, root } from './visual-common.mjs';
const quantile = (values, q) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.ceil(q * sorted.length) - 1]; };
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const results = [];
// Cold browser/context per view: transferSize is not diluted by memory cache hits.
for (const view of ['demo', 'preview']) {
  const run = await openRun();
  try {
    const hardware = await navigate(run, view);
    const spec = view === 'demo' ? config.cameras[0] : config.studyCamera;
    await camera(run.page, spec);
    const initialDownloadBytes = await run.page.evaluate(() => {
      const boundary = window.__refineryVisual.interactiveAt;
      return [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].filter(entry => entry.responseEnd <= boundary).reduce((sum, entry) => sum + entry.transferSize, 0);
    });
    if (initialDownloadBytes <= 0) throw new Error('Cold-load Resource Timing returned zero bytes; initial download measurement is invalid.');
    const samples = await run.page.evaluate(spec => window.__refineryVisual.orbit(spec), spec);
    if (samples.length < 2 || samples.some(sample => !Number.isFinite(sample.ms) || sample.ms <= 0)) throw new Error('Invalid active-workload samples');
    results.push({ look: hardware.look, hardware, warmupSeconds: 3, orbitSeconds: 10, frames: samples.length, drawCallsMean: mean(samples.map(s => s.calls)), trianglesMean: mean(samples.map(s => s.triangles)), fpsMedian: quantile(samples.map(s => 1000 / s.ms), 0.5), frameTimeP95Ms: quantile(samples.map(s => s.ms), 0.95), geometries: Math.max(...samples.map(s => s.geometries)), textures: Math.max(...samples.map(s => s.textures)), initialDownloadBytes, samples });
    if (run.errors.length) throw new Error(run.errors.join('\n'));
  } finally { await run.close(); }
}
const manifest = JSON.parse(await readFile(resolve(root, 'data/normalized/preview/manifest.json'), 'utf8'));
const studyAssets = ['preview/manifest.json', manifest.model_url, manifest.render_url];
const totalStudyLoadableAssetBytes = (await Promise.all(studyAssets.map(async path => (await stat(resolve(root, 'data/normalized', path))).size))).reduce((sum, value) => sum + value, 0);
const output = resolve(root, 'docs/metrics');
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'baseline.json'), JSON.stringify({ note: 'Photoreal-study is the existing separate module, not a whole-plant photoreal look. Counts are resources, not GPU memory. Date frozen; performance clock real. Initial download uses Resource Timing transferSize through the first loaded interactive frame.', totalStudyLoadableAssetBytes, studyAssets, results }, null, 2) + '\n');
const markdown = `# Stage B Task 0 baseline\n\nActive workload: 3 s warm-up followed by 10 s orbit, 1600 × 900, DPR 1. Renderer and browser recorded in JSON.\n\n| View | Draw calls mean | Triangles mean | FPS median | Frame p95 ms | Geometries | Textures | Initial download bytes |\n|---|---:|---:|---:|---:|---:|---:|---:|\n${results.map(r => `| ${r.look} | ${r.drawCallsMean.toFixed(1)} | ${r.trianglesMean.toFixed(0)} | ${r.fpsMedian.toFixed(1)} | ${r.frameTimeP95Ms.toFixed(2)} | ${r.geometries} | ${r.textures} | ${r.initialDownloadBytes} |`).join('\n')}\n\nExisting separate study loadable assets: ${totalStudyLoadableAssetBytes} bytes. This is not yet a whole-plant photoreal look; future photoreal budgets remain proposals for review. Resource counts do not measure GPU memory.\n`;
await writeFile(resolve(output, 'baseline.md'), markdown);
console.log(markdown);
