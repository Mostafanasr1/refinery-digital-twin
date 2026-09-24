import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export function readMeasurementState() {
  return JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', fileURLToPath(new URL('./display-state.ps1', import.meta.url))], { encoding: 'utf8' }));
}
export function measurementValidity({ fpsMedian, previousFps, refreshHz, state, uncapped = false }) {
  const reasons = [];
  if (!state.acConnected) reasons.push('AC power is required');
  if (!/performance/i.test(state.powerPlan ?? '')) reasons.push('Performance power plan is required');
  if (!uncapped && !state.noExternalMonitor) reasons.push('Laptop display only is required');
  if (uncapped && (!Array.isArray(state.displays) || !state.displays.length || !state.displays.some(display => display.primary) || state.displays.some(display => !(display.width > 0 && display.height > 0 && display.refreshHz > 1)))) reasons.push('Complete display configuration is required');
  if (!(refreshHz > 1)) reasons.push('Display refresh rate unavailable');
  if (!uncapped && previousFps > refreshHz * 1.1 && Math.abs(fpsMedian - refreshHz) / refreshHz <= .02) reasons.push('Refresh-capped run: median within 2% of refresh, previous comparable run over 10% above it');
  return { valid: reasons.length === 0, reasons };
}
