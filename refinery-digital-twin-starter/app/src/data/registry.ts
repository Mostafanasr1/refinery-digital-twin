import type { Object3D } from 'three';
import type { Asset, NormalizedData } from './loader';
export class AssetRegistry {
  readonly assets = new Map<string, Asset>();
  readonly modelRefs = new Map<string, string>();
  readonly objects = new Map<string, Object3D>();
  constructor(data: NormalizedData) {
    for (const asset of data.assets) {
      if (this.assets.has(asset.asset_id)) throw new Error(`Duplicate asset ${asset.asset_id}`);
      this.assets.set(asset.asset_id, asset);
    }
    for (const binding of data.model_bindings) {
      const asset = this.assets.get(binding.asset_id);
      if (!asset || asset.model_ref !== binding.model_ref || this.modelRefs.has(binding.model_ref)) throw new Error('Invalid model binding');
      this.modelRefs.set(binding.model_ref, binding.asset_id);
    }
    for (const asset of data.assets) if (!this.modelRefs.has(asset.model_ref)) throw new Error(`Missing binding ${asset.asset_id}`);
  }
  bind(assetId: string, object: Object3D | null) {
    if (!object) { this.objects.delete(assetId); return; }
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error(`Unknown asset ${assetId}`);
    object.traverse(node => { node.userData = { ...node.userData, asset_id: assetId, tag: asset.tag, type: asset.type, unit_id: asset.unit_id, model_ref: asset.model_ref }; });
    this.objects.set(assetId, object);
  }
}
export const worldPosition = (asset: Asset): [number, number, number] => [asset.position.x, asset.position.z, -asset.position.y];
