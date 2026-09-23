import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCaptureConfig } from '../../scripts/visual-config.mjs';
const config = JSON.parse(await readFile(new URL('./cameras.json', import.meta.url), 'utf8'));
test('capture rejects missing cameras, changed dimensions and non-finite positions', () => {
  assert.equal(validateCaptureConfig(config), config);
  assert.throws(() => validateCaptureConfig({ ...config, cameras: config.cameras.slice(1) }), /five fixed cameras/);
  assert.throws(() => validateCaptureConfig({ ...config, viewport: { width: 800, height: 900 } }), /1600 x 900/);
  const invalid = structuredClone(config); invalid.cameras[0].position[0] = Infinity;
  assert.throws(() => validateCaptureConfig(invalid), /Invalid camera/);
});
