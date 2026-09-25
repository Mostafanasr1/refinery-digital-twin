import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook } from './look-common.mjs';
const output = resolve(root, 'tests/visual/output/stageC-task-01');
await mkdir(output, { recursive: true });
const run = await openRun();
try {
  run.url += '&animate=1&captureCycle=1';
  const hardware = await openLook(run, 'photoreal');
  await camera(run.page, config.cameras[5]);
  const download = run.page.waitForEvent('download', { timeout: 360000 });
  await run.page.evaluate(() => {
    const canvas = document.querySelector('canvas'), stream = canvas.captureStream(60);
    const mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('VP9 recording unavailable');
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 24000000 });
    const chunks = [], start = performance.now();
    window.__refineryMotion.setHour(12); window.__refineryMotion.setCycle(true);
    const initial = window.__refineryMotion.read().time;
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      window.__cycleRecording = { elapsedSeconds: (performance.now() - start) / 1000, motionSeconds: window.__refineryMotion.read().time - initial, requestedFps: 60, requestedBitsPerSecond: 24000000, mimeType, final: window.__refineryMotion.read() };
      const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      const a = document.createElement('a'); a.href = url; a.download = 'CAM-6-full-cycle-60fps.webm'; a.click();
      stream.getTracks().forEach(track => track.stop()); setTimeout(() => URL.revokeObjectURL(url), 10000);
    };
    recorder.start(1000);
    const tick = () => { if (window.__refineryMotion.read().time - initial >= 240) { window.__refineryMotion.setCycle(false); recorder.stop(); } else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  console.log('Recording CAM-6: 240 seconds, canvas 60 fps, VP9 24 Mbps.');
  await (await download).saveAs(resolve(output, 'CAM-6-full-cycle-60fps.webm'));
  const recording = await run.page.evaluate(() => window.__cycleRecording);
  const reviewFile = resolve(root, 'docs/handbacks/evidence/stageC-task-01/CAM-6-full-cycle-review.mp4');
  execFileSync('ffmpeg', ['-hide_banner', '-y', '-i', resolve(output, 'CAM-6-full-cycle-60fps.webm'), '-r', '60', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', reviewFile], { stdio: 'inherit' });
  const encoded = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames', '-show_entries', 'format=duration,size,bit_rate', '-of', 'json', reviewFile], { encoding: 'utf8' }));
  assert.ok(recording.motionSeconds >= 240);
  assert.deepEqual(run.errors, []);
  await writeFile(resolve(root, 'docs/handbacks/evidence/stageC-task-01/video-recording.json'), JSON.stringify({ hardware, recording, encoded, reviewFile, localFile: resolve(output, 'CAM-6-full-cycle-60fps.webm') }, null, 2));
  console.log(JSON.stringify(recording));
} finally { await run.close(); }
