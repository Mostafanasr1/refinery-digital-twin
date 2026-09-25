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

test('historical five-camera protocol leaves CAM-6 capture-only', () => {
  const baseline = { ...config, cameras: config.cameras.slice(0, 5) };
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

test('Task 8 approved baseline compares all six cameras and rejects drift', async () => {
  const { config: baseline, status } = JSON.parse(await readFile(new URL('./baseline/engineering/capture.json', import.meta.url), 'utf8'));
  assert.equal(status, 'approved');
  const protocol = validateBaselineProtocol(config, baseline);
  assert.equal(protocol.regressionCameras.length, 6);
  assert.deepEqual(protocol.captureOnlyCameras, []);
  for (const change of [value => { value.cameras[5].position[0] += 1; }, value => { value.selectedTag = 'T-202'; }]) {
    const changed = structuredClone(config); change(changed);
    assert.throws(() => validateBaselineProtocol(changed, baseline), /Approved fixed camera protocol changed/);
  }
});
