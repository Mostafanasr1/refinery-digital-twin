import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Asset } from './data/loader';
import { worldPosition } from './data/registry';
import { effects, type Look } from './looks/looks';
import { materialUVs, type MaterialPack } from './looks/MaterialPack';

export type AssetStyle = { active: boolean; tint?: string; dim?: boolean };
export type PickRange = { start: number; count: number; asset: Asset };
export type EquipmentBatch = { geometry: THREE.BufferGeometry; engineering: THREE.MeshStandardMaterial; photoreal: THREE.MeshStandardMaterial; originalColor: THREE.Color; ranges: PickRange[]; styleKeys: WeakMap<PickRange, string> };
export function assetAtFace(ranges: PickRange[], faceIndex: number | null | undefined) {
  if (faceIndex == null) return undefined;
  const vertex = faceIndex * 3;
  return ranges.find(range => vertex >= range.start && vertex < range.start + range.count)?.asset;
}
function materialWithAssetState(source: THREE.MeshStandardMaterial) {
  const material = source.clone();
  material.color.set(0xffffff); material.vertexColors = true;
  material.onBeforeCompile = shader => {
    shader.vertexShader = `attribute vec3 assetEmissive; varying vec3 vAssetEmissive;\n${shader.vertexShader}`.replace('#include <color_vertex>', '#include <color_vertex>\nvAssetEmissive = assetEmissive;');
    shader.fragmentShader = `varying vec3 vAssetEmissive;\n${shader.fragmentShader}`.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = vAssetEmissive;');
  };
  material.customProgramCacheKey = () => 'asset-state-v1';
  return material;
}
/** World-space static batches retain a triangle-to-canonical-asset lookup. */
export function buildEquipmentBatches(scene: THREE.Object3D, assets: Asset[]): EquipmentBatch[] {
  const groups = new Map<string, { material: THREE.MeshStandardMaterial; geometries: THREE.BufferGeometry[]; ranges: PickRange[]; count: number }>();
  for (const asset of assets) {
    const source = scene.getObjectByName(asset.model_ref);
    if (!source) throw new Error(`GLB missing model binding ${asset.model_ref}`);
    const root = source.clone(true); root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.updateMatrixWorld(true);
    const transform = new THREE.Matrix4().compose(new THREE.Vector3(...worldPosition(asset)), new THREE.Quaternion().setFromEuler(new THREE.Euler(-asset.rotation.x, asset.rotation.z, -asset.rotation.y)), new THREE.Vector3(1, 1, 1));
    root.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      const nonindexed = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
      const segments = Array.isArray(node.material) ? node.geometry.groups : [{ start: 0, count: nonindexed.getAttribute('position').count, materialIndex: 0 }];
      for (const segment of segments) {
        const material = materials[segment.materialIndex ?? 0] as THREE.MeshStandardMaterial;
        const geometry = new THREE.BufferGeometry();
        for (const name of ['position', 'normal', 'uv']) {
          const attribute = nonindexed.getAttribute(name);
          if (attribute) geometry.setAttribute(name, new THREE.BufferAttribute(new Float32Array(attribute.array.slice(segment.start * attribute.itemSize, (segment.start + segment.count) * attribute.itemSize)), attribute.itemSize));
        }
        geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(transform, node.matrixWorld));
        const group = groups.get(material.uuid) ?? { material, geometries: [], ranges: [], count: 0 };
        group.geometries.push(geometry); group.ranges.push({ start: group.count, count: segment.count, asset }); group.count += segment.count; groups.set(material.uuid, group);
      }
      nonindexed.dispose();
    });
  }
  return [...groups.values()].map(group => {
    const geometry = mergeGeometries(group.geometries)!; group.geometries.forEach(part => part.dispose());
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(group.count * 3), 3));
    geometry.setAttribute('assetEmissive', new THREE.BufferAttribute(new Float32Array(group.count * 3), 3));
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    return { geometry, ranges: group.ranges, styleKeys: new WeakMap<PickRange, string>(), originalColor: group.material.color.clone(), engineering: materialWithAssetState(group.material), photoreal: materialWithAssetState(group.material) };
  });
}
export function applyBatchStyle(batch: EquipmentBatch, look: Look, style: (asset: Asset) => AssetStyle, pack?: MaterialPack | null) {
  const material = look.id === 'engineering' ? batch.engineering : batch.photoreal;
  const role = material.name.split('::')[1];
  const surface = look.id === 'photoreal' ? pack?.[role] : undefined;
  if (surface && material.map !== surface.map) {
    material.map = surface.map; material.normalMap = surface.normalMap; material.roughnessMap = surface.roughnessMap;
    materialUVs(batch.geometry, surface.tileMetres); material.needsUpdate = true;
  }
  material.roughness = surface?.roughness ?? (material.name.includes('Concrete') ? look.materials.roughness.concrete : material.name.includes('Safety') ? look.materials.roughness.safety : look.materials.roughness.metal);
  if (surface) material.metalness = surface.metalness;
  const colors = batch.geometry.getAttribute('color') as THREE.BufferAttribute;
  const emissions = batch.geometry.getAttribute('assetEmissive') as THREE.BufferAttribute;
  let changed = false;
  for (const range of batch.ranges) {
    const state = style(range.asset), key = `${look.id}/${surface?.color ?? ''}/${!!state.dim}/${state.active}/${state.tint ?? ''}`;
    if (batch.styleKeys.get(range) === key) continue;
    batch.styleKeys.set(range, key); changed = true;
    const color = surface ? new THREE.Color(surface.color) : batch.originalColor.clone();
    if (state.dim) color.multiplyScalar(effects.dim); else if (state.active) color.set(effects.selected); else if (state.tint) color.set(state.tint);
    const emission = new THREE.Color(state.active ? effects.emissive : effects.off).multiplyScalar(state.active ? .7 : 0);
    for (let i = range.start; i < range.start + range.count; i++) { colors.setXYZ(i, color.r, color.g, color.b); emissions.setXYZ(i, emission.r, emission.g, emission.b); }
  }
  if (changed) { colors.needsUpdate = true; emissions.needsUpdate = true; }
  return material;
}
export function disposeBatches(batches: EquipmentBatch[]) { batches.forEach(batch => { batch.geometry.dispose(); batch.engineering.dispose(); batch.photoreal.dispose(); }); }
