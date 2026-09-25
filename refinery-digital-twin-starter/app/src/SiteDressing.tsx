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
  useEffect(() => { invalidate(); }, [enabled, invalidate]);
  useEffect(() => () => group.children.forEach(node => {
    const mesh = node as THREE.Mesh;
    mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose();
  }), [group]);
  return <primitive object={group} visible={look.id !== 'engineering' && enabled} />;
}
