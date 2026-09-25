import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import assets from '../../data/normalized/assets.json';
import type { Asset } from './data/loader';
import { buildSliceDressing, dressingSites } from './sliceDressing';
import { roadPose, circuitLength } from './motionMath';
import config from '../../data/presentation/slice.json';
import motion from '../../data/presentation/motion.json';

describe('non-canonical slice context', () => {
  it('leaves the complete moving vehicle circuit and cabin strip clear', () => {
    const sites = dressingSites(assets as Asset[]);
    expect(sites.length).toBeGreaterThan(10);
    const [w, d] = config.dressing.moduleSize;
    for (let distance = 0; distance < circuitLength; distance += .5) {
      const p = roadPose(distance);
      for (const vehicle of motion.vehicles) {
        const hx = Math.abs(p.tx) * vehicle.length / 2 + Math.abs(p.tz) * vehicle.width / 2;
        const hz = Math.abs(p.tz) * vehicle.length / 2 + Math.abs(p.tx) * vehicle.width / 2;
        for (const site of sites) expect(Math.abs(p.x - site.x) > hx + w / 2 || Math.abs(p.z - site.z) > hz + d / 2).toBe(true);
      }
    }
    // Context cabins occupy z=24 +/-2.25; reserve that entire strip.
    expect(sites.every(site => site.z + d / 2 < 21.75)).toBe(true);
  });
  it('is batched, non-selectable and has no canonical IDs', () => {
    const group = buildSliceDressing(assets as Asset[]);
    expect(group.children.length).toBeLessThanOrEqual(6);
    group.traverse(node => {
      expect(node.userData.asset_id).toBeUndefined();
      if (node instanceof THREE.Mesh) {
        const hits: THREE.Intersection[] = [];
        node.raycast(new THREE.Raycaster(), hits);
        expect(hits).toEqual([]);
        node.geometry.dispose(); (node.material as THREE.Material).dispose();
      }
    });
  });
});
