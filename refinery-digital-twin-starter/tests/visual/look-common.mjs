import assert from 'node:assert/strict';
import { config } from '../../scripts/visual-common.mjs';

export async function openLook(run, look = 'engineering') {
  await run.page.goto(`${run.url}&look=${look}`, { waitUntil: 'networkidle' });
  await run.page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}' });
  await run.page.evaluate(() => document.fonts.ready);
  await run.page.waitForFunction(look => window.__refineryVisual?.ready && window.__refineryVisual.look === look && window.__refineryLookSnapshot, look);
  if (look !== 'engineering') await run.page.waitForFunction(() => document.querySelector('canvas')?.dataset.environmentReady === 'true' && document.querySelector('canvas')?.dataset.materialsReady === 'true' && document.querySelector('canvas')?.dataset.detailReady === 'true');
  const info = await run.page.evaluate(() => ({ renderer: window.__refineryVisual.renderer, look: window.__refineryVisual.look, interactiveAt: window.__refineryVisual.interactiveAt, dpr: devicePixelRatio }));
  assert.match(info.renderer, /NVIDIA.*3050/i, 'reference RTX 3050 required');
  assert.doesNotMatch(info.renderer, /swiftshader|llvmpipe|software|basic render/i);
  assert.equal(info.dpr, 1);
  return { ...info, browser: run.browser.version(), flags: run.flags, viewport: config.viewport };
}

export async function switchLook(page, look) {
  if (look === 'photoreal-night') {
    if ((await snapshot(page)).look === 'engineering') await switchLook(page, 'photoreal');
    await page.getByRole('button', {name:'Night lighting', exact:true}).click();
  } else await page.getByRole('link', { name: look === 'engineering' ? 'Engineering' : 'Photoreal', exact: true }).click();
  await page.waitForFunction(look => window.__refineryVisual?.look === look && window.__refineryLookSnapshot?.().look === look, look);
  if (look !== 'engineering') await page.waitForFunction(() => document.querySelector('canvas')?.dataset.environmentReady === 'true' && document.querySelector('canvas')?.dataset.materialsReady === 'true' && document.querySelector('canvas')?.dataset.detailReady === 'true');
  await page.waitForTimeout(400); // allow the specified 300 ms overlay to finish
  assert.equal(new URL(page.url()).searchParams.get('look'), look);
}

export async function snapshot(page) {
  return page.evaluate(() => window.__refineryLookSnapshot());
}

export function plantIdentity(state) {
  return state.meshes.flatMap(mesh => (mesh.assetIds ?? (mesh.assetId ? [mesh.assetId] : [])).map(id => `${id}:${mesh.uuid}:${mesh.geometry}`)).sort();
}
