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
test('confirmed uncapped protocol permits external displays but still requires power and display records', () => {
  const external = { ...state, noExternalMonitor: false, displays: [{ width: 1920, height: 1080, refreshHz: 144, primary: false }, { width: 2560, height: 1440, refreshHz: 144, primary: true }] };
  const input = { fpsMedian: 144, previousFps: 500, refreshHz: 144, state: external, uncapped: true };
  assert.equal(measurementValidity(input).valid, true);
  assert.equal(measurementValidity({ ...input, state: { ...external, acConnected: false } }).valid, false);
  assert.equal(measurementValidity({ ...input, state: { ...external, displays: [] } }).valid, false);
});
