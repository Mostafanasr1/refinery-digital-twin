export function validateCaptureConfig(config) {
  if (config.viewport?.width !== 1600 || config.viewport?.height !== 900 || config.deviceScaleFactor !== 1) throw new Error('Capture requires 1600 x 900 at DPR 1.');
  if (config.cameras?.length !== 6 || new Set(config.cameras.map(camera => camera.id)).size !== 6 || !['CAM-1', 'CAM-2', 'CAM-3', 'CAM-4', 'CAM-5', 'CAM-6'].every(id => config.cameras.some(camera => camera.id === id))) throw new Error('All six fixed cameras are required exactly once.');
  for (const camera of [...config.cameras, config.studyCamera]) for (const key of ['position', 'target']) {
    if (!Array.isArray(camera?.[key]) || camera[key].length !== 3 || !camera[key].every(Number.isFinite)) throw new Error(`Invalid camera ${camera?.id ?? 'study'} ${key}.`);
  }
  if (!Number.isFinite(Date.parse(config.frozenTime)) || !config.selectedTag) throw new Error('Frozen time and fixed selected asset are required.');
  return config;
}

// CAM-6 was approved after the original five-camera engineering baseline.
// Validate the entire original protocol without manufacturing a CAM-6 baseline.
export function validateBaselineProtocol(config, baselineConfig) {
  validateCaptureConfig(config);
  const originalIds = ['CAM-1', 'CAM-2', 'CAM-3', 'CAM-4', 'CAM-5'];
  const originalProtocol = { ...config, cameras: config.cameras.filter(camera => originalIds.includes(camera.id)) };
  if (baselineConfig.cameras?.length !== originalIds.length || JSON.stringify(originalProtocol) !== JSON.stringify(baselineConfig)) throw new Error('Original fixed camera protocol changed; review is required before replacing the baseline.');
  return { regressionCameras: originalProtocol.cameras, captureOnlyCameras: config.cameras.filter(camera => !originalIds.includes(camera.id)) };
}
