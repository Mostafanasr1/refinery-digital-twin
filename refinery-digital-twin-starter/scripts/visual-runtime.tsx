// Opt-in measurement bridge. No camera, timing or renderer changes in normal use.
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

export const visualMode = new URLSearchParams(location.search).get('measure') === '1';
type CameraSpec = { position: [number, number, number]; target: [number, number, number] };
type Sample = { ms: number; calls: number; triangles: number; geometries: number; textures: number };
type Bridge = { ready: boolean; look: string; renderer: string; interactiveAt: number; setCamera: (spec: CameraSpec) => void; orbit: (spec: CameraSpec) => Promise<Sample[]> };
declare global { interface Window { __refineryVisual?: Bridge } }

export function VisualRuntime({ look }: { look: string }) {
  const { camera, gl, scene, clock, invalidate, setDpr } = useThree();
  const job = useRef<{ start: number; last: number; spec: CameraSpec; samples: Sample[]; done: (samples: Sample[]) => void } | null>(null);
  useEffect(() => {
    if (!visualMode) return;
    setDpr(1);
    const previousAutoReset = gl.info.autoReset;
    gl.info.autoReset = false;
    const context = gl.getContext();
    const extension = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = extension ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : 'unavailable';
    const place = (spec: CameraSpec) => {
      camera.position.fromArray(spec.position); camera.lookAt(new Vector3(...spec.target)); camera.updateMatrixWorld(); invalidate();
    };
    const bridge: Bridge = { ready: false, look, renderer, interactiveAt: 0, setCamera: place,
      orbit: spec => new Promise(done => { job.current = { start: performance.now(), last: 0, spec, samples: [], done }; invalidate(); }) };
    window.__refineryVisual = bridge;
    return () => { gl.info.autoReset = previousAutoReset; if (window.__refineryVisual === bridge) delete window.__refineryVisual; };
  }, [camera, gl, invalidate, look, setDpr]);
  useFrame(() => {
    if (!visualMode) return;
    gl.info.reset();
    // Freeze the simulation clock while performance.now remains real for timings.
    clock.elapsedTime = 0; clock.running = false; clock.autoStart = false;
    const bridge = window.__refineryVisual;
    const current = job.current;
    if (current) {
      const seconds = (performance.now() - current.start) / 1000;
      const angle = seconds * Math.PI / 20;
      const [x, y, z] = current.spec.position; const [tx, ty, tz] = current.spec.target;
      camera.position.set(tx + (x - tx) * Math.cos(angle) - (z - tz) * Math.sin(angle), y, tz + (x - tx) * Math.sin(angle) + (z - tz) * Math.cos(angle));
      camera.lookAt(tx, ty, tz); camera.updateMatrixWorld(); invalidate();
    }
    queueMicrotask(() => {
      if (!bridge) return;
      // Runs after R3F's render/composer callback, so counters cover the whole frame.
      if (!bridge.ready && scene.getObjectByProperty('type', 'Mesh')) { bridge.ready = true; bridge.interactiveAt = performance.now(); }
      if (!current) return;
      const now = performance.now(); const elapsed = now - current.start;
      if (elapsed >= 3000 && current.last) current.samples.push({ ms: now - current.last, calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures });
      current.last = now;
      if (elapsed >= 13000) { job.current = null; current.done(current.samples); }
    });
  }, -100);
  return null;
}
