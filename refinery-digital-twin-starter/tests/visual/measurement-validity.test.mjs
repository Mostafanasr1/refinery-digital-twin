import test from 'node:test';
import assert from 'node:assert/strict';
import { measurementValidity } from '../../scripts/measurement-validity.mjs';
const state = { acConnected: true, powerPlan: 'Performance', noExternalMonitor: true };
test('refresh-capped results are invalid rather than budget failures', () => {
  assert.equal(measurementValidity({ fpsMedian: 59.9, previousFps: 144.9, refreshHz: 60, state }).valid, false);
  assert.equal(measurementValidity({ fpsMedian: 144.9, previousFps: 144.9, refreshHz: 144, state }).valid, true);
  assert.equal(measurementValidity({ fpsMedian: 45, previousFps: 144.9, refreshHz: 60, state }).valid, true);
  assert.equal(measurementValidity({ fpsMedian: 60, previousFps: 61, refreshHz: 60, state }).valid, true);
});
test('invalid power/display setup cannot pass a budget', () => {
  assert.equal(measurementValidity({ fpsMedian: 145, previousFps: 145, refreshHz: 144, state: {...state, noExternalMonitor: false} }).valid, false);
});
