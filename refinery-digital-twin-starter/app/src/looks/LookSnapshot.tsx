import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Mesh } from 'three';
import { useLook } from './LookProvider';
type Snapshot = { look: string; camera: { position: number[]; quaternion: number[] }; geometries: number; textures: number; meshes: { uuid: string; geometry: string; material: string[]; assetId: string | null }[] };
declare global { interface Window { __refineryLookSnapshot?: () => Snapshot } }
export function LookSnapshot() {
  const { scene, camera, gl } = useThree();
  const { look } = useLook();
  useEffect(() => {
    if (new URLSearchParams(location.search).get('measure') !== '1') return;
    const snapshot = (): Snapshot => {
      const meshes: Snapshot['meshes'] = [];
      scene.traverse(node => { if (node instanceof Mesh) meshes.push({ uuid: node.uuid, geometry: node.geometry.uuid, assetId: node.userData.asset_id ?? null, material: (Array.isArray(node.material) ? node.material : [node.material]).map(material => material.uuid) }); });
      return { look: look.id, camera: { position: camera.position.toArray(), quaternion: camera.quaternion.toArray() }, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, meshes };
    };
    window.__refineryLookSnapshot = snapshot;
    return () => { if (window.__refineryLookSnapshot === snapshot) delete window.__refineryLookSnapshot; };
  }, [scene, camera, gl, look.id]);
  return null;
}
