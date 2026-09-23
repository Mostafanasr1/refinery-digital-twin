import * as THREE from 'three';
import { effects, type Look } from './looks';
type Entry = { mesh: THREE.Mesh; original: THREE.Material | THREE.Material[]; photoreal: THREE.Material | THREE.Material[]; colors: THREE.Color[] };
/** One cache per loaded asset, keyed by mesh UUID; geometries are never replaced. */
export class MaterialCache {
  readonly meshes = new Map<string, Entry>();
  constructor(object: THREE.Object3D) {
    object.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      const original = node.material;
      const materials = Array.isArray(original) ? original : [original];
      this.meshes.set(node.uuid, { mesh: node, original, photoreal: Array.isArray(original) ? materials.map(m => m.clone()) : original.clone(), colors: materials.map(m => (m as THREE.MeshStandardMaterial).color.clone()) });
    });
  }
  apply(look: Look, state: { active: boolean; tint?: string; dim?: boolean }) {
    for (const entry of this.meshes.values()) {
      entry.mesh.material = look.id === 'engineering' ? entry.original : entry.photoreal;
      const materials = Array.isArray(entry.mesh.material) ? entry.mesh.material : [entry.mesh.material];
      materials.forEach((material, index) => {
        const mat = material as THREE.MeshStandardMaterial;
        mat.color.copy(entry.colors[index]);
        mat.roughness = mat.name.includes('Concrete') ? look.materials.roughness.concrete : mat.name.includes('Safety') ? look.materials.roughness.safety : look.materials.roughness.metal;
        if (state.dim) mat.color.multiplyScalar(effects.dim); else if (state.active) mat.color.set(effects.selected); else if (state.tint) mat.color.set(state.tint);
        mat.emissive.set(state.active ? effects.emissive : effects.off); mat.emissiveIntensity = state.active ? .7 : 0;
      });
    }
  }
  dispose() { for (const entry of this.meshes.values()) for (const set of [entry.original, entry.photoreal]) (Array.isArray(set) ? set : [set]).forEach(m => m.dispose()); }
}
