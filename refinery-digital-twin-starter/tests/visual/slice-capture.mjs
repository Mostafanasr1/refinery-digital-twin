import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
const before = process.argv.includes('--before');
const folder = resolve(root, 'docs/handbacks/evidence/stageC-task-02', before ? 'before' : 'after');
await mkdir(folder, { recursive: true });
const run = await openRun();
run.page.on('console', message => { if (message.type() === 'error' && !message.location().url?.endsWith('/favicon.ico')) run.errors.push(message.text()); });
try {
  const hardware = [];
  for (const look of ['engineering', 'photoreal']) {
    hardware.push(await openLook(run, look));
    for (const spec of config.cameras) {
      await camera(run.page, spec);
      await run.page.screenshot({ path: resolve(folder, `${spec.id}-${look}.png`) });
    }
  }
  assert.deepEqual(run.errors, []);
  await writeFile(resolve(folder, 'capture.json'), JSON.stringify({ hardware, errors: run.errors }, null, 2));
} finally { await run.close(); }
