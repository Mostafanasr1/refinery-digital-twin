import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './serve.mjs';
import { validateCaptureConfig } from './visual-config.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
export const config = validateCaptureConfig(JSON.parse(await readFile(resolve(root, 'tests/visual/cameras.json'), 'utf8')));
export const flags = ['--enable-gpu', '--force_high_performance_gpu', '--use-angle=d3d11', '--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'];
export const metricsFlags = [...flags, '--disable-gpu-vsync', '--disable-frame-rate-limit'];
export async function openRun({ metrics = false, staticRoot, videoDir } = {}) {
  const runFlags = metrics ? metricsFlags : flags;
  const server = createStaticServer(staticRoot);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/?measure=1`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: runFlags, ...(process.env.VISUAL_BROWSER_PATH ? { executablePath: process.env.VISUAL_BROWSER_PATH } : {}) });
  } catch (error) { server.close(); throw error; }
  try {
    const context = await browser.newContext({ viewport: config.viewport, deviceScaleFactor: config.deviceScaleFactor, reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC', ...(videoDir ? { recordVideo: { dir: videoDir, size: config.viewport } } : {}) });
    const page = await context.newPage();
    // Freeze wall-clock dates only. Playwright's clock also replaces Performance,
    // which would hide Resource Timing and invalidate download/frame measurements.
    await page.addInitScript(frozen => {
      const NativeDate = Date;
      window.Date = new Proxy(NativeDate, {
        construct: (target, args) => Reflect.construct(target, args.length ? args : [frozen]),
        apply: () => new NativeDate(frozen).toString(),
        get: (target, key) => key === 'now' ? () => frozen : Reflect.get(target, key),
      });
    }, Date.parse(config.frozenTime));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    return { browser, page, url, errors, flags: runFlags, close: async () => { try { await browser.close(); } finally { await new Promise(resolve => server.close(resolve)); } } };
  } catch (error) {
    try { await browser.close(); } finally { server.close(); }
    throw error;
  }
}
export async function navigate(run, view = 'demo') {
  await run.page.goto(`${run.url}#${view}`, { waitUntil: 'networkidle' });
  await run.page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}' });
  await run.page.evaluate(() => document.fonts.ready);
  await run.page.waitForFunction(() => window.__refineryVisual?.ready);
  const info = await run.page.evaluate(() => ({ renderer: window.__refineryVisual.renderer, look: window.__refineryVisual.look, interactiveAt: window.__refineryVisual.interactiveAt, dpr: devicePixelRatio }));
  if (!/NVIDIA.*3050/i.test(info.renderer) || /swiftshader|llvmpipe|software|basic render/i.test(info.renderer)) throw new Error(`Reference hardware not confirmed: ${info.renderer}`);
  return { ...info, browser: run.browser.version(), flags: run.flags, viewport: config.viewport };
}
export async function camera(page, spec) {
  await page.evaluate(spec => window.__refineryVisual.setCamera(spec), spec);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(350);
}
export async function captureEngineering(run, output) {
  await mkdir(output, { recursive: true });
  const hardware = await navigate(run);
  const assets = JSON.parse(await readFile(resolve(root, 'data/normalized/assets.json'), 'utf8'));
  const selected = assets.find(asset => asset.tag === config.selectedTag);
  for (const variant of ['default', 'selected']) {
    if (variant === 'selected') await run.page.getByRole('button', { name: `${selected.tag} ${selected.name}`, exact: true }).click();
    await run.page.mouse.move(1590, 890);
    for (const spec of config.cameras) {
      await camera(run.page, spec);
      await run.page.screenshot({ path: resolve(output, `${spec.id}-${variant}.png`), animations: 'disabled' });
    }
  }
  if (run.errors.length) throw new Error(run.errors.join('\n'));
  return hardware;
}
