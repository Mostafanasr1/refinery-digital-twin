import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useMaterialPack, materialUVs } from './MaterialPack';
import { useThree } from '@react-three/fiber';

/** Opt-in evidence view only; never changes the ordinary demonstration. */
export function MaterialSwatches() {
  const pack = useMaterialPack();
  const { scene, camera, invalidate } = useThree();
  const enabled = new URLSearchParams(location.search).get('materialSwatches') === '1';
  const group = useMemo(() => {
    const result = new THREE.Group(); result.name = 'material-swatches';
    if (!enabled || !pack) return result;
    Object.entries(pack).sort(([a], [b]) => a.localeCompare(b)).forEach(([role, surface], index) => {
      const x = 80 + index % 4 * 1.8, z = -30 + Math.floor(index / 4) * 2.5;
      const material = new THREE.MeshStandardMaterial({ color: surface.color, metalness: surface.metalness, roughness: surface.roughness, map: surface.map, normalMap: surface.normalMap, roughnessMap: surface.roughnessMap });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(.5, 48, 24), material); materialUVs(sphere.geometry, surface.tileMetres); sphere.position.set(x, 1, z); result.add(sphere);
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 80;
      const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#10232f'; ctx.fillRect(0, 0, 512, 80); ctx.fillStyle = '#ffffff'; ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.fillText(role, 256, 49);
      const texture = new THREE.CanvasTexture(canvas); const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false })); label.position.set(x, .35, z + .65); label.scale.set(1.6, .25, 1); result.add(label);
    });
    return result;
  }, [enabled, pack]);
  useEffect(() => {
    if (!enabled || !pack) return;
    const hidden: THREE.Object3D[] = [];
    scene.traverse(node => { if (['equipment', 'pipes'].includes(node.name) && node.visible) { node.visible = false; hidden.push(node); } });
    camera.position.set(82.7, 5, -22); camera.lookAt(82.7, .7, -28.75); camera.updateMatrixWorld(); invalidate();
    return () => { hidden.forEach(node => { node.visible = true; }); };
  }, [enabled, pack, scene, camera, invalidate]);
  useEffect(() => () => { group.children.forEach(node => {
    if (node instanceof THREE.Mesh) { node.geometry.dispose(); (node.material as THREE.Material).dispose(); }
    else if (node instanceof THREE.Sprite) { node.material.map?.dispose(); node.material.dispose(); }
  }); }, [group]);
  return enabled ? <primitive object={group} /> : null;
}
