import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
type Category = 'equipment' | 'pipes' | 'lamps' | 'ground' | 'helpers';
type Counts = Record<Category, number>;
const empty = (): Counts => ({ equipment: 0, pipes: 0, lamps: 0, ground: 0, helpers: 0 });
function category(object: THREE.Object3D): Category {
  if (object.userData.category) return object.userData.category;
  let ancestor: THREE.Object3D | null = object;
  while (ancestor) { if (ancestor.name.startsWith('conn_')) return 'pipes'; ancestor = ancestor.parent; }
  if (object.userData.asset_id || object.userData.assetRanges) return 'equipment';
  if (object instanceof THREE.Sprite || object instanceof THREE.Line) return 'helpers';
  if (object instanceof THREE.Mesh) {
    const parameters = (object.geometry as THREE.BufferGeometry & { parameters?: { height?: number; width?: number; radiusTop?: number } }).parameters;
    if ((parameters?.height === 6 && parameters.radiusTop === .08) || (parameters?.width === 1.4 && parameters.height === .16)) return 'lamps';
    return 'ground';
  }
  return 'helpers';
}
/** Counts actual per-object color/shadow submissions; composer calls are the measured remainder. */
export function BudgetProfiler() {
  const { scene, gl } = useThree();
  const enabled = new URLSearchParams(location.search).get('measure') === '1';
  const state = useMemo(() => ({ color: empty(), shadow: empty(), snapshot: {}, installed: new Map<THREE.Object3D, { render: THREE.Object3D['onBeforeRender']; shadow: THREE.Object3D['onBeforeShadow'] }>() }), []);
  useFrame(() => {
    if (!enabled) return;
    state.color = empty(); state.shadow = empty();
    scene.traverse(object => {
      if (state.installed.has(object)) return;
      const original = { render: object.onBeforeRender, shadow: object.onBeforeShadow }; state.installed.set(object, original);
      object.onBeforeRender = function (...args) { state.color[category(this)]++; original.render.apply(this, args); };
      object.onBeforeShadow = function (...args) { state.shadow[category(this)]++; original.shadow.apply(this, args); };
    });
  }, -100);
  useFrame(() => {
    if (!enabled) return;
    const total = gl.info.render.calls;
    const categorized = Object.values(state.color).reduce((a, b) => a + b, 0) + Object.values(state.shadow).reduce((a, b) => a + b, 0);
    state.snapshot = { color: { ...state.color }, shadow: { ...state.shadow }, post: total - categorized, total };
  }, 2);
  useEffect(() => {
    if (!enabled) return;
    const host = window as unknown as { __refineryBudgetSnapshot?: () => object };
    host.__refineryBudgetSnapshot = () => state.snapshot;
    return () => { delete host.__refineryBudgetSnapshot; state.installed.forEach((original, object) => { object.onBeforeRender = original.render; object.onBeforeShadow = original.shadow; }); state.installed.clear(); };
  }, [enabled, state]);
  return null;
}
