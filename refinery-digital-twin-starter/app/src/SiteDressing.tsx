import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useLook } from './looks/LookProvider';
import type { Asset, NormalizedData } from './data/loader';
import { buildSliceDressing } from './sliceDressing';
import { useDressing } from './sliceState';

/** Presentation only: no registry binding, canonical ID or raycast target. */
export function SiteDressing({ assets, connections }: { assets: Asset[]; connections: NormalizedData['connections'] }) {
  const { look } = useLook();
  const enabled = useDressing();
  const invalidate = useThree(state => state.invalidate);
  const group = useMemo(() => buildSliceDressing(assets, connections), [assets, connections]);
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: '#757d80', metalness: 0, roughness: 1 }), []);
  const original = useMemo(() => group.children.map(node => (node as THREE.Mesh).material), [group]);
  useEffect(() => { group.children.forEach((node, i) => { (node as THREE.Mesh).material = look.id === 'engineering' ? grey : original[i]; }); invalidate(); }, [group, original, grey, look.id, enabled, invalidate]);
  useEffect(() => () => grey.dispose(), [grey]);
  useEffect(() => () => group.children.forEach(node => {
    const mesh = node as THREE.Mesh;
    mesh.geometry.dispose();
  }), [group]);
  useEffect(() => () => original.forEach(material => (material as THREE.Material).dispose()), [original]);
  return <primitive object={group} visible={enabled} />;
}
