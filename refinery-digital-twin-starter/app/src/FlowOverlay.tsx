import { motionSnapshot } from './motionState';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Asset } from './data/loader';
import { worldPosition } from './data/registry';

/** Raised explanatory flow geometry, independent of the physical pipe routing. */
export function flowCurve(from: Asset, to: Asset) {
  const a = new THREE.Vector3(...worldPosition(from));
  const b = new THREE.Vector3(...worldPosition(to));
  a.y += from.dimensions.height + 4; b.y += to.dimensions.height + 4;
  const midpoint = a.clone().lerp(b, 0.5); midpoint.y = Math.max(a.y, b.y) + 6;
  return new THREE.CatmullRomCurve3([a, midpoint, b]);
}
export default function FlowOverlay({ from, to, running, name }: { from: Asset; to: Asset; running: boolean; name: string }) {
  const curve = useMemo(() => flowCurve(from, to), [from, to]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.3, 8, false), [curve]);
  useEffect(() => () => tube.dispose(), [tube]);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const pulsePose = useMemo(() => new THREE.Object3D(), []);
  const arrows = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame((_state, delta) => {
    if (running && motionSnapshot().enabled) phase.current = (phase.current + Math.min(delta, .1) * 0.2) % 1;
    if (pulses.current) {
      for (let i = 0; i < 3; i++) { pulsePose.position.copy(curve.getPointAt((phase.current + i / 3) % 1)); pulsePose.updateMatrix(); pulses.current.setMatrixAt(i, pulsePose.matrix); }
      pulses.current.instanceMatrix.needsUpdate = true;
    }
    arrows.current?.children.forEach((arrow, index) => {
      const t = (phase.current + index / 5) % 1;
      arrow.position.copy(curve.getPointAt(t));
      arrow.quaternion.setFromUnitVectors(up, curve.getTangentAt(t).normalize());
    });
  });
  return <group name={`${name}_flow`} userData={{ asset_id: from.asset_id, model_ref: from.model_ref }}>
    <mesh geometry={tube}><meshBasicMaterial color="#ffb73c" toneMapped={false} transparent opacity={0.5} /></mesh>
    <instancedMesh ref={pulses} args={[undefined, undefined, 3]} frustumCulled={false} name="travelling-flow-pulses" raycast={() => undefined}><sphereGeometry args={[.85, 10, 6]} /><meshBasicMaterial color={[4, 1.7, .2]} toneMapped={false} /></instancedMesh>
    <group ref={arrows}>{Array.from({ length: 5 }, (_, i) => <mesh key={i} position={curve.getPointAt(i / 5)}><coneGeometry args={[1.05, 3.1, 10]} /><meshBasicMaterial color={[3, 1.5, 0.15]} toneMapped={false} /></mesh>)}</group>
  </group>;
}
