import { LookSnapshot } from './looks/LookSnapshot';
import { useLook } from './looks/LookProvider';
import { effects } from './looks/looks';
import { MaterialCache } from './looks/materials';
import { VisualRuntime, visualMode } from '../../scripts/visual-runtime';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import FlowOverlay from './FlowOverlay';
import { Atmosphere, PlantLabel, Site } from './Atmosphere';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { layerStyle, type Layer, type ScenarioState, type traceAt } from './data/operations';
import type { Asset, NormalizedData } from './data/loader';
import { AssetRegistry, worldPosition } from './data/registry';
import { proxyFamily } from './data/silhouettes';

function Controls({ selected, reset }: { selected?: Asset; reset: number }) {
  const { camera, gl, invalidate } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  const moving = useRef(false);
  const destination = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  useEffect(() => {
    controls.disconnect(); controls.connect(gl.domElement);
    controls.maxPolarAngle = Math.PI / 2.08; controls.minDistance = 10; controls.maxDistance = 450;
    controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.7;
    const redraw = () => invalidate();
    const stop = () => { moving.current = false; };
    controls.addEventListener('change', redraw); controls.addEventListener('start', stop);
    controls.update();
    return () => { controls.removeEventListener('change', redraw); controls.removeEventListener('start', stop); controls.dispose(); };
  }, [controls, invalidate, gl]);
  useEffect(() => {
    if (selected) {
      const [x, y, z] = worldPosition(selected);
      const size = Math.max(selected.dimensions.height, selected.dimensions.diameter, selected.dimensions.length, 12);
      lookAt.current.set(x, y + selected.dimensions.height * 0.6, z);
      destination.current.set(x + size * 2.1, y + size * 1.35, z + size * 2.3);
    } else { lookAt.current.set(85, 9, -24); destination.current.set(250, 140, 200); }
    moving.current = true; invalidate();
  }, [selected, reset, invalidate]);
  useFrame((_state, delta) => {
    if (visualMode || !moving.current) return;
    const amount = 1 - Math.exp(-3 * Math.min(delta, 0.1));
    camera.position.lerp(destination.current, amount); controls.target.lerp(lookAt.current, amount);
    controls.update(); invalidate();
    if (camera.position.distanceTo(destination.current) < 0.03 && controls.target.distanceTo(lookAt.current) < 0.03) moving.current = false;
  });
  return null;
}
function Proxy({ asset, active, tint, dim }: { asset: Asset; active: boolean; tint?: string; dim?: boolean }) {
  const { look } = useLook();
  const { height: h, diameter: d, length: l, width: w } = asset.dimensions;
  const family = proxyFamily[asset.type] ?? 'vertical';
  const color = dim ? effects.proxyDim : active ? effects.selected : tint ? tint : asset.type === 'pipe_rack' ? effects.proxyRack : asset.type === 'fired_heater' ? effects.proxyHeater : effects.proxyDefault;
  const material = <meshStandardMaterial color={color} metalness={look.materials.proxy.metalness} roughness={look.materials.proxy.roughness} emissive={active ? effects.proxyEmissive : effects.off} emissiveIntensity={0.3} />;
  const box = (key: string, pos: [number, number, number], scale: [number, number, number]) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={pos}><boxGeometry args={scale} />{material}</mesh>;
  const cylinder = (key: string, y: number, radius: number, height: number) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={[0, y, 0]}><cylinderGeometry args={[radius, radius, height, 24]} />{material}</mesh>;
  if (family === 'rack') return <>
    {[-l / 2, 0, l / 2].flatMap((x, i) => [-w / 2, w / 2].map((z, j) => box(`post_${i}_${j}`, [x, h / 2, z], [0.6, h, 0.6])))}
    {[h * 0.6, h].flatMap((y, i) => [box(`beam_${i}`, [0, y, 0], [l + 1, 0.6, w + 1]), ...[-2, 0, 2].map((z, j) => box(`pipe_${i}_${j}`, [0, y + 0.6, z], [l + 1, 0.25, 0.25]))])}
  </>;
  if (family === 'pump') return <>{box('base', [0, 0.3, 0], [l + 1, 0.6, w + 1])}<mesh name={`${asset.model_ref}_motor`} position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.85, 0.85, l, 16]} />{material}</mesh>{box('discharge', [l / 2, 2, 0], [0.5, 2, 0.5])}</>;
  if (family === 'horizontal') return <><mesh name={`${asset.model_ref}_shell`} position={[0, d / 2 + 1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[d / 2, d / 2, l, 24]} />{material}</mesh>{[-l / 3, l / 3].map((x,i) => box(`saddle_${i}`, [x, 0.7, 0], [1, 1.4, d]))}</>;
  if (family === 'box') return <>{box('body', [0, h / 2, 0], [l, h, w])}{asset.type === 'fired_heater' ? cylinder('stack', h + 6, 1.1, 12) : box('roof', [0, h + 0.3, 0], [l + 1, 0.6, w + 1])}</>;
  if (family === 'sphere') return <><mesh name={`${asset.model_ref}_shell`} position={[0, h - d / 2, 0]}><sphereGeometry args={[d / 2, 24, 16]} />{material}</mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} name={`${asset.model_ref}_leg_${i}`} position={[Math.cos(i * Math.PI / 2) * d * 0.4, (h - d / 2) / 2, Math.sin(i * Math.PI / 2) * d * 0.4]}><cylinderGeometry args={[0.3, 0.3, h - d / 2, 8]} />{material}</mesh>)}</>;
  if (family === 'stack') return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 1.5, 0.6)}</>;
  return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 0.7, 0.6)}
    {asset.type === 'storage_tank' || asset.type === 'floating_roof_tank' ? <mesh name={`${asset.model_ref}_roof`} position={[0, h + 0.6, 0]}><coneGeometry args={[d / 2, 1.2, 32]} />{material}</mesh> : [0.25, 0.5, 0.75, 1].map((fraction, i) => cylinder(`platform_${i}`, h * fraction, d / 2 + 0.7, 0.3))}
    {asset.type === 'column' ? box('ladder', [d / 2 + 0.5, h / 2, 0], [0.4, h, 0.7]) : null}
  </>;
}
function BlenderAsset({ asset, active, tint, dim }: { asset: Asset; active: boolean; tint?: string; dim?: boolean }) {
  const { look } = useLook();
  const invalidate = useThree(state => state.invalidate);
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/refinery.glb`);
  const object = useMemo(() => {
    const source = gltf.scene.getObjectByName(asset.model_ref);
    if (!source) throw new Error(`GLB missing model binding ${asset.model_ref}`);
    const clone = source.clone(true); clone.position.set(0, 0, 0); clone.rotation.set(0, 0, 0);
    clone.traverse(node => { node.userData = { asset_id: asset.asset_id, tag: asset.tag, type: asset.type, unit_id: asset.unit_id, model_ref: asset.model_ref };
      if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = true; node.material = Array.isArray(node.material) ? node.material.map(m => m.clone()) : node.material.clone(); }
    });
    return clone;
  }, [gltf, asset.asset_id, asset.model_ref, asset.tag, asset.type, asset.unit_id]);
  const materials = useMemo(() => new MaterialCache(object), [object]);
  useEffect(() => { materials.apply(look, { active, tint, dim }); invalidate(); }, [materials, look, active, tint, dim, invalidate]);
  useEffect(() => () => materials.dispose(), [materials]);
  return <primitive object={object} />;
}
function Equipment({ asset, registry, active, onHover, onSelect, geometry, tint, dim }: { asset: Asset; registry: AssetRegistry; active: boolean; geometry: 'blender' | 'proxy'; tint?: string; dim?: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  return <group name={asset.model_ref} ref={object => registry.bind(asset.asset_id, object)} position={worldPosition(asset)} rotation={[-asset.rotation.x, asset.rotation.z, -asset.rotation.y]}
    onPointerOver={event => { event.stopPropagation(); onHover(asset.asset_id); }}
    onPointerOut={() => onHover(null)} onClick={event => { event.stopPropagation(); onSelect(asset.asset_id); }}>
    {geometry === 'blender' ? <BlenderAsset asset={asset} active={active} tint={tint} dim={dim} /> : <Proxy asset={asset} active={active} tint={tint} dim={dim} />}
  </group>;
}
function Pipe({ from, to, name, active, running, route, diameter = 0.6 }: { from: Asset; to: Asset; name: string; active: boolean; running: boolean; route?: { x: number; y: number; z: number }[]; diameter?: number }) {
  const { look } = useLook();
  const points = useMemo(() => {
    if (route) return route.map(p => new THREE.Vector3(p.x,p.z,-p.y));
    const a = worldPosition(from), b = worldPosition(to);
    return [new THREE.Vector3(a[0], 3, a[2]), new THREE.Vector3(a[0], 3, b[2]), new THREE.Vector3(b[0], 3, b[2])];
  }, [from, to, route]);
  const marker = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  useFrame((_state, delta) => {
    if (marker.current && running) {
      phase.current = (phase.current + delta * 0.4) % 1;
      const segment = phase.current < 0.5 ? 0 : 1;
      marker.current.position.lerpVectors(points[segment], points[segment + 1], phase.current * 2 - segment);
    }
  });
  return <group name={name} userData={{ asset_id: from.asset_id, tag: from.tag, type: from.type, unit_id: from.unit_id, model_ref: from.model_ref }}>
    {active ? <FlowOverlay from={from} to={to} running={running} name={name} /> : null}
    {points.slice(1).map((end, i) => {
      const start = points[i], delta = end.clone().sub(start), length = delta.length();
      if (length < 0.01) return null;
      const center = start.clone().add(end).multiplyScalar(0.5);
      const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
      return <mesh key={i} name={`${name}_${i}`} position={center} quaternion={rotation} userData={{ asset_id: from.asset_id, tag: from.tag, type: from.type, unit_id: from.unit_id, model_ref: from.model_ref }}><cylinderGeometry args={[diameter / 2, diameter / 2, length, 10]} /><meshStandardMaterial color={active ? effects.pipeActive : look.materials.pipe.color} metalness={look.materials.pipe.metalness} roughness={look.materials.pipe.roughness} /></mesh>;
    })}
  </group>;
}
export default function Scene({ data, registry, selected, hovered, reset, onHover, onSelect, geometry, layer, trace, running, scenarioState }: { geometry: 'blender' | 'proxy'; layer: Layer; trace: ReturnType<typeof traceAt>; running: boolean; scenarioState: ScenarioState; data: NormalizedData; registry: AssetRegistry; selected: string | null; hovered: string | null; reset: number; onHover: (id: string | null) => void; onSelect: (id: string | null) => void }) {
  const { look } = useLook();
  const light = look.lighting;
  return <Canvas shadows gl={{ antialias: true, toneMapping: { aces: THREE.ACESFilmicToneMapping }[look.post.toneMapping], toneMappingExposure: look.post.exposure }} frameloop={running ? 'always' : 'demand'} dpr={[1, 1.5]} camera={{ position: [232, 126, 169], fov: 42, near: 0.1, far: 1500 }} onPointerMissed={() => onSelect(null)} fallback={<p className="webgl-error">WebGL is unavailable. Use a browser with hardware acceleration enabled.</p>}>
    <color attach="background" args={[look.environment.background]} />
    <ambientLight intensity={light.ambient} /><hemisphereLight args={light.hemisphere} />
    <directionalLight castShadow={light.shadows} position={light.sun.position} intensity={light.sun.intensity} color={light.sun.color} shadow-mapSize={light.shadow.size} shadow-camera-left={light.shadow.left} shadow-camera-right={light.shadow.right} shadow-camera-top={light.shadow.top} shadow-camera-bottom={light.shadow.bottom} shadow-camera-far={light.shadow.far} shadow-normalBias={light.shadow.normalBias} shadow-bias={light.shadow.bias} />
    <directionalLight position={light.fill.position} color={light.fill.color} intensity={light.fill.intensity} />
    <Atmosphere />
    <Controls selected={scenarioState.cameraId ? registry.assets.get(scenarioState.cameraId) : selected ? registry.assets.get(selected) : undefined} reset={reset} />
    <gridHelper visible={look.environment.grid} args={[500, 50, ...look.environment.gridColors]} position={[85, -3, -25]} />
    <Site assets={data.assets} />
    {data.connections.map(connection => {
      const from = registry.assets.get(connection.from_asset_id), to = registry.assets.get(connection.to_asset_id);
      return from && to ? <Pipe key={connection.connection_id} from={from} to={to} name={connection.connection_id} route={connection.route_points} diameter={connection.diameter} active={trace.path?.connection_ids.includes(connection.connection_id) ?? false} running={running && !(trace.path?.ordered_asset_ids.some(id => scenarioState.statuses[id] === 'trip') ?? false)} /> : null;
    })}
    {data.assets.filter(asset => asset.asset_id === selected || asset.asset_id === trace.assetId || asset.status === 'trip').map(asset => <PlantLabel key={asset.asset_id} asset={asset} alert={asset.status === 'trip'} />)}
    <Suspense fallback={null}><VisualRuntime look={look.id} /><LookSnapshot />{data.assets.map(asset => <Equipment key={asset.asset_id} asset={asset} registry={registry} geometry={geometry} tint={asset.status === 'trip' ? '#ff653c' : layerStyle(asset, data, layer)?.color} dim={!!trace.path && !trace.path.ordered_asset_ids.includes(asset.asset_id)} active={asset.asset_id === selected || asset.asset_id === hovered || asset.asset_id === trace.assetId || scenarioState.highlights.includes(asset.asset_id)} onHover={onHover} onSelect={onSelect} />)}</Suspense>
  </Canvas>;
}
