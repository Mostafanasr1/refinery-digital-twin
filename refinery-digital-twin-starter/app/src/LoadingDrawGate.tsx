import { useEffect, useRef } from 'react';
import { addAfterEffect, useFrame, useThree } from '@react-three/fiber';
import { finishLoading, loadingSnapshot } from './loading';
import { useLook } from './looks/LookProvider';

/** The callback runs after R3F (and the post stack) draws, then waits one RAF. */
export function LoadingDrawGate() {
  const { scene, gl, invalidate } = useThree();
  const { look, environmentLoading } = useLook();
  const rendered = useRef(false);
  const frame = useRef(0);
  useFrame(() => { rendered.current = true; });
  useEffect(() => {
    const remove = addAfterEffect(() => {
      if (!rendered.current) return;
      rendered.current = false;
      const progress = loadingSnapshot();
      if (progress.phase !== 'draw' || frame.current) return;
      const photo = look.id !== 'engineering';
      if ((progress.pack === 'photoreal') !== photo || (!scene.getObjectByName('equipment') || !scene.getObjectByName('sourced-site-dressing'))) return;
      if (scene.getObjectByName('sourced-site-dressing')?.userData.presentationLook !== (photo ? 'photoreal' : 'engineering')) { invalidate(); return; }
      if (photo && (environmentLoading || !scene.getObjectByName('photoreal-environment') || !scene.getObjectByName('hero-detail') || gl.domElement.dataset.materialsReady !== 'true')) { invalidate(); return; }
      const drawn = performance.now();
      frame.current = requestAnimationFrame(() => { frame.current = 0; if (loadingSnapshot().started === progress.started && loadingSnapshot().pack === progress.pack) finishLoading(drawn); });
    });
    invalidate();
    return () => { remove(); cancelAnimationFrame(frame.current); frame.current = 0; };
  }, [scene, gl, look.id, environmentLoading, invalidate]);
  return null;
}
