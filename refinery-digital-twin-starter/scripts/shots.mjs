import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, captureEngineering, navigate, camera, config, root } from './visual-common.mjs';
const baseline = process.argv.includes('--baseline');
const output = resolve(root, baseline ? 'tests/visual/baseline/engineering' : 'tests/visual/output/engineering');
const run = await openRun();
try {
  const hardware = await captureEngineering(run, output);
  await writeFile(resolve(output, 'capture.json'), JSON.stringify({ ...hardware, config }, null, 2) + '\n');
  if (process.argv.includes('--reference')) {
    const reference = resolve(root, 'tests/visual/reference');
    await mkdir(reference, { recursive: true });
    await navigate(run);
    await camera(run.page, config.cameras[0]);
    await run.page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption('proxy');
    await camera(run.page, config.cameras[0]);
    await run.page.screenshot({ path: resolve(reference, 'geometry-proxy.png'), animations: 'disabled' });
    await run.page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption('blender');
    await camera(run.page, config.cameras[0]);
    await run.page.screenshot({ path: resolve(reference, 'geometry-blender.png'), animations: 'disabled' });
    await navigate(run, 'preview');
    await camera(run.page, config.studyCamera);
    await run.page.screenshot({ path: resolve(reference, 'photoreal-study-interactive.png'), animations: 'disabled' });
    await run.page.getByRole('button', { name: 'Cinematic render', exact: true }).click();
    await run.page.locator('.preview-render').evaluate(image => image.decode());
    await run.page.screenshot({ path: resolve(reference, 'photoreal-study-still.png'), animations: 'disabled' });
  }
  if (run.errors.length) throw new Error(run.errors.join('\n'));
  console.log(`Captured 10 engineering frames${process.argv.includes('--reference') ? ' and 4 existing-mode reference frames' : ''}. ${hardware.renderer}`);
} finally { await run.close(); }
