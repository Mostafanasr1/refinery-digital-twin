import { expect, it } from 'vitest';
import * as THREE from 'three';
import { buildEquipmentBatches, assetAtFace, applyBatchStyle, disposeBatches } from './equipmentBatches';
import { looks } from './looks/looks';
import type { Asset } from './data/loader';
const asset = (id: string, x: number): Asset => ({ asset_id: id, tag: id, name: id, type: 'pump', unit_id: 'unit', facility_id: 'facility', area_id: 'area', model_ref: id, position: { x, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, dimensions: { length: 2, width: 2, height: 2, diameter: 2 }, status: 'normal', service: '', interactive: true, synthetic: true });
it('preserves transformed triangles, canonical picks and cached look materials', () => {
  const scene = new THREE.Group(), material = new THREE.MeshStandardMaterial({ color: '#789abc' });
  const assets = [asset('a', 0), asset('b', 10)];
  for (const item of assets) { const root = new THREE.Group(); root.name = item.model_ref; root.position.x = item.position.x; const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material); mesh.position.y = 1; root.add(mesh); scene.add(root); }
  const batches = buildEquipmentBatches(scene, assets); expect(batches).toHaveLength(1);
  const batch = batches[0], mesh = new THREE.Mesh(batch.geometry, batch.engineering);
  for (const item of assets) {
    const ray = new THREE.Raycaster(new THREE.Vector3(item.position.x, 1, 10), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(mesh)[0]; expect(hit).toBeTruthy(); expect(assetAtFace(batch.ranges, hit.faceIndex)?.asset_id).toBe(item.asset_id);
  }
  expect(assetAtFace(batch.ranges, undefined)).toBeUndefined(); expect(assetAtFace(batch.ranges, 500)).toBeUndefined();
  const geometry = batch.geometry, engineering = batch.engineering, photoreal = batch.photoreal;
  applyBatchStyle(batch, looks.engineering, item => ({ active: item.asset_id === 'b' }));
  const emissive = geometry.getAttribute('assetEmissive'); expect(emissive.getX(batch.ranges[0].start)).toBe(0); expect(emissive.getX(batch.ranges[1].start)).toBeGreaterThan(0);
  expect(applyBatchStyle(batch, looks.photoreal, () => ({ active: false }))).toBe(photoreal);
  expect(applyBatchStyle(batch, looks.engineering, () => ({ active: false }))).toBe(engineering);
  expect(batch.geometry).toBe(geometry); expect(emissive.getX(batch.ranges[1].start)).toBe(0);
  const version = (geometry.getAttribute('color') as THREE.BufferAttribute).version;
  applyBatchStyle(batch, looks.engineering, () => ({ active: false }));
  expect((geometry.getAttribute('color') as THREE.BufferAttribute).version).toBe(version);
  disposeBatches(batches);
});
