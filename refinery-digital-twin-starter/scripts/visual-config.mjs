export function validateCaptureConfig(config) {
  if (config.viewport?.width !== 1600 || config.viewport?.height !== 900 || config.deviceScaleFactor !== 1) throw new Error('Capture requires 1600 x 900 at DPR 1.');
  if (config.cameras?.length !== 5 || new Set(config.cameras.map(camera => camera.id)).size !== 5 || !['CAM-1', 'CAM-2', 'CAM-3', 'CAM-4', 'CAM-5'].every(id => config.cameras.some(camera => camera.id === id))) throw new Error('All five fixed cameras are required exactly once.');
  for (const camera of [...config.cameras, config.studyCamera]) for (const key of ['position', 'target']) {
    if (!Array.isArray(camera?.[key]) || camera[key].length !== 3 || !camera[key].every(Number.isFinite)) throw new Error(`Invalid camera ${camera?.id ?? 'study'} ${key}.`);
  }
  if (!Number.isFinite(Date.parse(config.frozenTime)) || !config.selectedTag) throw new Error('Frozen time and fixed selected asset are required.');
  return config;
}
