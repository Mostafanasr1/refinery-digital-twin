import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export function readMeasurementState() {
  return JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', fileURLToPath(new URL('./display-state.ps1', import.meta.url))], { encoding: 'utf8' }));
}
export function measurementValidity({ fpsMedian, previousFps, refreshHz, state }) {
  const reasons = [];
  if (!state.acConnected) reasons.push('AC power is required');
  if (!/performance/i.test(state.powerPlan ?? '')) reasons.push('Performance power plan is required');
  if (!state.noExternalMonitor) reasons.push('Laptop display only is required');
  if (!(refreshHz > 1)) reasons.push('Display refresh rate unavailable');
  if (previousFps > refreshHz * 1.1 && Math.abs(fpsMedian - refreshHz) / refreshHz <= .02) reasons.push('Refresh-capped run: median within 2% of refresh, previous comparable run over 10% above it');
  return { valid: reasons.length === 0, reasons };
}
