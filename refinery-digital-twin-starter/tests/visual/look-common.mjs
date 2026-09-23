import assert from 'node:assert/strict';
import { flags, config } from '../../scripts/visual-common.mjs';

export async function openLook(run, look = 'engineering') {
  await run.page.goto(`${run.url}&look=${look}`, { waitUntil: 'networkidle' });
  await run.page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}' });
  await run.page.evaluate(() => document.fonts.ready);
  await run.page.waitForFunction(look => window.__refineryVisual?.ready && window.__refineryVisual.look === look && window.__refineryLookSnapshot, look);
  const info = await run.page.evaluate(() => ({ renderer: window.__refineryVisual.renderer, look: window.__refineryVisual.look, interactiveAt: window.__refineryVisual.interactiveAt, dpr: devicePixelRatio }));
  assert.match(info.renderer, /NVIDIA.*3050/i, 'reference RTX 3050 required');
  assert.doesNotMatch(info.renderer, /swiftshader|llvmpipe|software|basic render/i);
  assert.equal(info.dpr, 1);
  return { ...info, browser: run.browser.version(), flags, viewport: config.viewport };
}

export async function switchLook(page, look) {
  await page.getByRole('link', { name: look === 'engineering' ? 'Engineering' : 'Photoreal', exact: true }).click();
  await page.waitForFunction(look => window.__refineryVisual?.look === look && window.__refineryLookSnapshot?.().look === look, look);
  await page.waitForTimeout(400); // allow the specified 300 ms overlay to finish
  assert.equal(new URL(page.url()).searchParams.get('look'), look);
}

export async function snapshot(page) {
  return page.evaluate(() => window.__refineryLookSnapshot());
}

export function plantIdentity(state) {
  return state.meshes.filter(mesh => mesh.assetId).map(mesh => `${mesh.assetId}:${mesh.uuid}:${mesh.geometry}`).sort();
}
