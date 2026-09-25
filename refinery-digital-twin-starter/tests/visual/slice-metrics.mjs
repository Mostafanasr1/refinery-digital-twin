import assert from 'node:assert/strict';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
import { readMeasurementState, measurementValidity } from '../../scripts/measurement-validity.mjs';
const before = process.argv.includes('--before');
const results = [];
const quantile = (values, q) => values.toSorted((a,b) => a-b)[Math.ceil(values.length*q)-1];
for (const dressing of before ? [true] : [false, true]) {
  for (let repeat = 1; repeat <= 3; repeat++) {
    const displayState = readMeasurementState();
    const refreshHz = displayState.displays.find(d => d.primary)?.refreshHz;
    assert.equal(measurementValidity({ fpsMedian: 0, previousFps: 0, refreshHz, state: displayState, uncapped: true }).valid, true, 'Valid display and power conditions required');
    const run = await openRun({ metrics: true });
    run.page.on('console', message => { if (message.type() === 'error' && !message.location().url?.endsWith('/favicon.ico')) run.errors.push(message.text()); });
    try {
      run.url += `&animate=1&dressing=${dressing ? 1 : 0}`;
      const hardware = await openLook(run, 'photoreal');
      await camera(run.page, config.cameras[5]);
      const samples = await run.page.evaluate(() => new Promise(resolve => {
        const samples=[], start=performance.now(); let last=start;
        const tick = now => {
          if(now-start>3000) samples.push({ms:now-last, calls:window.__refineryBudgetSnapshot().total});
          last=now;
          if(now-start>=13000) resolve(samples); else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }));
      const medianMs = quantile(samples.map(s=>s.ms),.5), p95Ms = quantile(samples.map(s=>s.ms),.95);
      results.push({ dressing, repeat, camera:'CAM-6 fixed', hardware, displayState, medianMs, p95Ms, derivedFps:1000/medianMs, callsMean:samples.reduce((n,s)=>n+s.calls,0)/samples.length, samples, pass:p95Ms<=25 });
      assert.deepEqual(run.errors,[]);
    } finally { await run.close(); }
  }
}
async function bytes(path) { let total=0; for(const entry of await readdir(path,{withFileTypes:true})) { const file=resolve(path,entry.name); total+=entry.isDirectory()?await bytes(file):(await stat(file)).size; } return total; }
const lazyBytes = await bytes(resolve(root,'app/dist/assets/env')) + await bytes(resolve(root,'app/dist/assets/materials')) + await bytes(resolve(root,'app/dist/assets/detail'));
const output=resolve(root,'docs/metrics'); await mkdir(output,{recursive:true});
await writeFile(resolve(output,`stageC-task-02-${before?'before':'after'}.json`),JSON.stringify({method:'Uncapped requestAnimationFrame intervals, fixed CAM-6, active motion, 3s warmup and 10s sample; three repeats',lazyBytes,lazyPass:lazyBytes<=60000000,results},null,2));
console.log(JSON.stringify({lazyBytes,results:results.map(({samples,...rest})=>rest)},null,2));
assert.ok(lazyBytes<=60000000 && results.every(r=>r.pass),'HARD STOP: slice budget missed');
