import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCaptureConfig, validateBaselineProtocol } from '../../scripts/visual-config.mjs';
const config = JSON.parse(await readFile(new URL('./cameras.json', import.meta.url), 'utf8'));
test('capture rejects missing cameras, changed dimensions and non-finite positions', () => {
  assert.equal(validateCaptureConfig(config), config);
  assert.throws(() => validateCaptureConfig({ ...config, cameras: config.cameras.slice(1) }), /six fixed cameras/);
  assert.throws(() => validateCaptureConfig({ ...config, viewport: { width: 800, height: 900 } }), /1600 x 900/);
  const invalid = structuredClone(config); invalid.cameras[0].position[0] = Infinity;
  assert.throws(() => validateCaptureConfig(invalid), /Invalid camera/);
});

test('approved CAM-6 is capture-only while the original engineering protocol stays frozen', async () => {
  const { config: baseline } = JSON.parse(await readFile(new URL('./baseline/engineering/capture.json', import.meta.url), 'utf8'));
  const protocol = validateBaselineProtocol(config, baseline);
  assert.deepEqual(protocol.regressionCameras, baseline.cameras);
  assert.deepEqual(protocol.captureOnlyCameras.map(camera => camera.id), ['CAM-6']);
  for (const alter of [
    changed => { changed.cameras[0].position[0] += 1; },
    changed => { changed.cameras[4].target[1] += 1; },
    changed => { changed.selectedTag = 'T-202'; },
    changed => { changed.frozenTime = '2026-09-25T12:00:00.000Z'; },
  ]) {
    const changed = structuredClone(config); alter(changed);
    assert.throws(() => validateBaselineProtocol(changed, baseline), /Original fixed camera protocol changed/);
  }
});
