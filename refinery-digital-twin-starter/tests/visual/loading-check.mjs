import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export async function checkLoadingAndMobile(run, output, checks) {
  const { page } = run;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 1200000, uploadThroughput: 1200000 });
  const requested = [];
  page.on('request', request => requested.push(request.url()));
  await page.goto(run.url, { waitUntil: 'domcontentloaded' });
  async function captureLoading(pack, prefix) {
    await page.waitForFunction(pack => { const s = window.__refineryLoading?.snapshot(); return s?.pack === pack && s.received > s.total * .1 && s.received < s.total * .9; }, pack, { timeout: 60000 });
    await page.waitForFunction(() => document.querySelector('.load-numbers strong')?.textContent === `${Math.floor(window.__refineryLoading.snapshot().received / window.__refineryLoading.snapshot().total * 100)}%`);
    assert.ok(await page.locator('.load-overlay').isVisible());
    await page.screenshot({ path: resolve(output, `${prefix}-${pack}-loading.png`) });
    await page.locator('.load-overlay').waitFor({ state: 'detached', timeout: 90000 });
    const done = await page.evaluate(() => window.__refineryLoading.snapshot());
    assert.equal(done.phase, 'done'); assert.equal(done.received, done.total);
    assert.ok(done.finished > done.drawn, 'Completion must follow the drawn frame');
    assert.ok(await page.locator('canvas').isVisible());
    assert.equal(await page.locator('main').evaluate(element => element.parentElement.inert), false);
    checks.push(`${prefix} ${pack}: measured byte progress, HUD capture, completion after drawn frame`);
    return done;
  }
  const engineering = await captureLoading('engineering', 'desktop');
  assert.ok(!requested.some(url => /\/assets\/(env|materials|detail)\//.test(url)), 'Initial engineering remains lazy');
  await page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  const photoreal = await captureLoading('photoreal', 'desktop');
  assert.equal(await page.locator('canvas').getAttribute('data-materials-ready'), 'true');
  assert.equal(await page.locator('canvas').getAttribute('data-environment-ready'), 'true');
  assert.equal(await page.locator('canvas').getAttribute('data-detail-ready'), 'true');
  const downloads = requested.filter(url => /\/assets\/(env|materials|detail)\//.test(url));
  assert.equal(downloads.length, new Set(downloads).size, 'No duplicate pack downloads');
  const warmCount = requested.length;
  await page.getByRole('link', { name: 'Engineering', exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.load-overlay').count(), 0);
  assert.equal(requested.length, warmCount);
  checks.push('Warm look switch does not repeat the download indicator or requests');

  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto(run.url, { waitUntil: 'domcontentloaded' });
  await captureLoading('engineering', 'mobile-viewport');
  await page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  await captureLoading('photoreal', 'mobile-viewport');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  for (const viewport of [{ width: 412, height: 915 }, { width: 915, height: 412 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    assert.equal(await page.locator('.directory').isVisible(), false);
    assert.equal(await page.locator('.operations').isVisible(), false);
    await page.getByRole('button', { name: 'Equipment', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search equipment' }).fill('T-201');
    await page.getByRole('button', { name: 'T-201 Atmospheric Distillation Column', exact: true }).click();
    assert.equal(await page.locator('.directory').isVisible(), false);
    assert.ok(await page.locator('.card').isVisible());
    await page.screenshot({ path: resolve(output, `mobile-${viewport.width}x${viewport.height}-selected.png`) });
    await page.getByRole('button', { name: 'Controls', exact: true }).click();
    await page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption('proxy');
    await page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption('blender');
    await page.screenshot({ path: resolve(output, `mobile-${viewport.width}x${viewport.height}-controls.png`) });
    await page.getByRole('button', { name: 'Controls', exact: true }).click();
    const bounds = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewport: [innerWidth, innerHeight] }));
    assert.ok(bounds.width <= viewport.width && bounds.height <= viewport.height, 'No document overflow');
    checks.push(`${viewport.width}x${viewport.height}: collapsed panels, search/select, geometry controls and no page overflow PASS (desktop viewport emulation, not a physical phone)`);
  }
  // Cold first photoreal in proxy geometry, with a canceled history transition.
  await page.goto(run.url, { waitUntil: 'networkidle' });
  await page.locator('.load-overlay').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Controls', exact: true }).click();
  await page.getByRole('combobox', { name: 'Geometry', exact: true }).selectOption('proxy');
  await page.getByRole('button', { name: 'Controls', exact: true }).click();
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 1200000, uploadThroughput: 1200000 });
  await page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  await page.waitForFunction(() => window.__refineryLoading.snapshot().pack === 'photoreal');
  await page.evaluate(() => { history.replaceState(null, '', '?measure=1&look=engineering'); dispatchEvent(new PopStateEvent('popstate')); });
  await page.locator('.load-overlay').waitFor({ state: 'detached' });
  await page.waitForTimeout(400);
  await page.getByRole('link', { name: 'Photoreal', exact: true }).click();
  await page.locator('.load-overlay').waitFor({ state: 'detached', timeout: 90000 });
  assert.equal(await page.locator('main').getAttribute('data-look'), 'photoreal');
  assert.equal(await page.getByRole('combobox', { name: 'Geometry', exact: true, includeHidden: true }).inputValue(), 'proxy');
  checks.push('Canceled history switch recovers; first Photoreal draw in proxy mode completes');
  await writeFile(resolve(output, 'timings.json'), JSON.stringify({ engineering, photoreal, conditions: 'Desktop reference machine; deliberately throttled 1,200,000 bytes/s, 40 ms latency for visible progress evidence. Not phone timings.', phone: 'Original Samsung A35 Chrome pass reported by Mostafa; corrected mobile timing review deferred by ruling to next gate.' }, null, 2));
}
