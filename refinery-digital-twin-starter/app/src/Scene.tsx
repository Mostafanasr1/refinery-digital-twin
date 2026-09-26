import { SourcedDressing } from './SourcedDressing';
import { MotionActors } from './MotionActors';
import { MotionClock } from './TimeControls';
import { SceneLoadingBoundary } from './LoadingIndicator';
import { LoadingDrawGate } from './LoadingDrawGate';
import { interpolatePose, type CameraMove } from './presentation';
import { SiteDressing } from './SiteDressing';
import { PlantAtmosphere } from './PlantAtmosphere';
import { PhotorealEnvironment } from './PhotorealEnvironment';
import { MaterialPackProvider, useMaterialPack, materialUVs } from './looks/MaterialPack';
import materialConfig from '../../data/presentation/materials.json';
import { MaterialSwatches } from './looks/MaterialSwatches';
import { BudgetProfiler } from './BudgetProfiler';
import { LookSnapshot } from './looks/LookSnapshot';
import { useLook } from './looks/LookProvider';
import { effects } from './looks/looks';
import { buildEquipmentBatches, applyBatchStyle, disposeBatches, assetAtFace, type AssetStyle } from './equipmentBatches';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { VisualRuntime, visualMode } from '../../scripts/visual-runtime';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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

function Controls({ selected, reset, cameraMove }: { selected?: Asset; reset: number; cameraMove: CameraMove | null }) {
  const { camera, gl, invalidate, size: viewport } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    // Preserve horizontal coverage on portrait phones without changing desktop cameras.
    camera.fov = viewport.width <= 760 ? Math.min(82, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(21)) / Math.min(1, viewport.width / viewport.height)))) : 42;
    camera.updateProjectionMatrix(); invalidate();
  }, [camera, viewport.width, viewport.height, invalidate]);
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
  useEffect(() => { if (cameraMove) { moving.current = false; invalidate(); } }, [cameraMove, invalidate]);
  useFrame((_state, delta) => {
    if (cameraMove) {
      const pose = interpolatePose(cameraMove, performance.now());
      camera.position.fromArray(pose.position); controls.target.fromArray(pose.target); controls.update(); invalidate(); return;
    }
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
  const pack = useMaterialPack();
  const role = (materialConfig.types as Record<string, Record<string, string>>)[asset.type]?.['Equipment shell'];
  const surface = look.id !== 'engineering' ? pack?.[role] : undefined;
  const { height: h, diameter: d, length: l, width: w } = asset.dimensions;
  const family = proxyFamily[asset.type] ?? 'vertical';
  const color = dim ? effects.proxyDim : active && look.id === 'engineering' ? effects.selected : tint ? tint : surface?.color ?? (asset.type === 'pipe_rack' ? effects.proxyRack : asset.type === 'fired_heater' ? effects.proxyHeater : effects.proxyDefault);
  const material = <meshStandardMaterial onBeforeCompile={shader => { shader.fragmentShader = shader.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * .05;').replace('#include <opaque_fragment>', 'outgoingLight += emissive * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * 3.0;\n#include <opaque_fragment>'); }} color={color} map={surface?.map ?? null} normalMap={surface?.normalMap ?? null} roughnessMap={surface?.roughnessMap ?? null} metalness={surface?.metalness ?? look.materials.proxy.metalness} roughness={surface?.roughness ?? look.materials.proxy.roughness} emissive={active ? effects.proxyEmissive : effects.off} emissiveIntensity={0.3} />;
  const mapGeometry = (geometry: THREE.BufferGeometry) => materialUVs(geometry, materialConfig.materials[role as keyof typeof materialConfig.materials]?.tileMetres ?? 1);
  const box = (key: string, pos: [number, number, number], scale: [number, number, number]) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={pos}><boxGeometry onUpdate={mapGeometry} args={scale} />{material}</mesh>;
  const cylinder = (key: string, y: number, radius: number, height: number) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={[0, y, 0]}><cylinderGeometry onUpdate={mapGeometry} args={[radius, radius, height, 24]} />{material}</mesh>;
  if (family === 'rack') return <>
    {[-l / 2, 0, l / 2].flatMap((x, i) => [-w / 2, w / 2].map((z, j) => box(`post_${i}_${j}`, [x, h / 2, z], [0.6, h, 0.6])))}
    {[h * 0.6, h].flatMap((y, i) => [box(`beam_${i}`, [0, y, 0], [l + 1, 0.6, w + 1]), ...[-2, 0, 2].map((z, j) => box(`pipe_${i}_${j}`, [0, y + 0.6, z], [l + 1, 0.25, 0.25]))])}
  </>;
  if (family === 'pump') return <>{box('base', [0, 0.3, 0], [l + 1, 0.6, w + 1])}<mesh name={`${asset.model_ref}_motor`} position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry onUpdate={mapGeometry} args={[0.85, 0.85, l, 16]} />{material}</mesh>{box('discharge', [l / 2, 2, 0], [0.5, 2, 0.5])}</>;
  if (family === 'horizontal') return <><mesh name={`${asset.model_ref}_shell`} position={[0, d / 2 + 1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry onUpdate={mapGeometry} args={[d / 2, d / 2, l, 24]} />{material}</mesh>{[-l / 3, l / 3].map((x,i) => box(`saddle_${i}`, [x, 0.7, 0], [1, 1.4, d]))}</>;
  if (family === 'box') return <>{box('body', [0, h / 2, 0], [l, h, w])}{asset.type === 'fired_heater' ? cylinder('stack', h + 6, 1.1, 12) : box('roof', [0, h + 0.3, 0], [l + 1, 0.6, w + 1])}</>;
  if (family === 'sphere') return <><mesh name={`${asset.model_ref}_shell`} position={[0, h - d / 2, 0]}><sphereGeometry onUpdate={mapGeometry} args={[d / 2, 24, 16]} />{material}</mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} name={`${asset.model_ref}_leg_${i}`} position={[Math.cos(i * Math.PI / 2) * d * 0.4, (h - d / 2) / 2, Math.sin(i * Math.PI / 2) * d * 0.4]}><cylinderGeometry onUpdate={mapGeometry} args={[0.3, 0.3, h - d / 2, 8]} />{material}</mesh>)}</>;
  if (family === 'stack') return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 1.5, 0.6)}</>;
  return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 0.7, 0.6)}
    {asset.type === 'storage_tank' || asset.type === 'floating_roof_tank' ? <mesh name={`${asset.model_ref}_roof`} position={[0, h + 0.6, 0]}><coneGeometry onUpdate={mapGeometry} args={[d / 2, 1.2, 32]} />{material}</mesh> : [0.25, 0.5, 0.75, 1].map((fraction, i) => cylinder(`platform_${i}`, h * fraction, d / 2 + 0.7, 0.3))}
    {asset.type === 'column' ? box('ladder', [d / 2 + 0.5, h / 2, 0], [0.4, h, 0.7]) : null}
  </>;
}
function BlenderPlant({ assets, registry, style, onHover, onSelect, detail = false, visible = true }: { detail?: boolean; visible?: boolean; assets: Asset[]; registry: AssetRegistry; style: (asset: Asset) => AssetStyle; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const { look } = useLook(); const { invalidate, gl } = useThree();
  const materialPack = useMaterialPack();
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}${detail ? 'assets/detail/hero.glb' : 'models/refinery.glb'}`, loader => loader.setMeshoptDecoder(MeshoptDecoder));
  const batchAssets = useMemo(() => detail ? assets.filter(asset => gltf.scene.getObjectByName(asset.model_ref)) : assets, [assets, detail, gltf]);
  useEffect(() => { if (detail) { gl.domElement.dataset.detailReady = 'true'; invalidate(); } }, [detail, gl, invalidate, gltf]);
  // Keep canonical object bindings available to generic consumers without submitting
  // these lightweight hierarchy clones to the renderer; geometry is shared with GLTF.
  useEffect(() => {
    if (detail) return;
    const owned = new Map<string, THREE.Object3D>();
    for (const asset of assets) {
      const object = gltf.scene.getObjectByName(asset.model_ref)!.clone(true);
      object.position.set(...worldPosition(asset)); object.rotation.set(-asset.rotation.x, asset.rotation.z, -asset.rotation.y);
      object.updateMatrixWorld(true); registry.bind(asset.asset_id, object); owned.set(asset.asset_id, object);
    }
    return () => { owned.forEach((object, id) => { if (registry.objects.get(id) === object) registry.bind(id, null); }); };
  }, [assets, gltf, registry, detail]);
  const stress = Number(new URLSearchParams(location.search).get('stress')) === 500;
  const copies = stress ? Math.floor(500 / assets.length) : 1;
  const batches = useMemo(() => buildEquipmentBatches(gltf.scene, batchAssets), [gltf, batchAssets]);
  const remainder = useMemo(() => stress ? buildEquipmentBatches(gltf.scene, batchAssets.filter(asset => assets.slice(0, 500 % assets.length).includes(asset))) : [], [gltf, assets, batchAssets, stress]);
  const objects = useMemo(() => [...batches, ...remainder].map((batch, index) => {
    const partial = index >= batches.length;
    const mesh = new THREE.InstancedMesh(batch.geometry, batch.engineering, partial ? 1 : copies);
    mesh.name = `equipment-batch-${index}`; mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.category = 'equipment'; mesh.userData.optionalDetail = detail; mesh.userData.assetRanges = batch.ranges;
    mesh.userData.stressInstances = Array.from({ length: mesh.count }, (_, instance) => batch.ranges.map(range => ({ asset_id: range.asset.asset_id, instance_id: `${range.asset.asset_id}::${partial ? copies : instance}` })));
    for (let instance = 0; instance < mesh.count; instance++) {
      const copy = partial ? copies : instance;
      mesh.setMatrixAt(instance, new THREE.Matrix4().makeTranslation((copy % 3) * 280, 0, -Math.floor(copy / 3) * 210));
    }
    mesh.computeBoundingSphere(); return mesh;
  }), [batches, remainder, copies, detail]);
  useEffect(() => {
    [...batches, ...remainder].forEach((batch, index) => { objects[index].material = applyBatchStyle(batch, look, style, materialPack); }); invalidate();
  }, [batches, remainder, objects, look, style, materialPack, invalidate]);
  useEffect(() => () => { disposeBatches(batches); disposeBatches(remainder); objects.forEach(object => object.dispose()); }, [batches, remainder, objects]);
  return <group name={detail ? "hero-detail" : "equipment"} visible={visible} userData={{ detailLevel: detail ? 1 : 0, renderedAssetCount: detail ? 0 : stress ? 500 : assets.length }}>
      {objects.map((object, index) => <primitive key={object.uuid} object={object}
        raycast={visible ? THREE.InstancedMesh.prototype.raycast : () => undefined}
      onPointerOver={(event: import('@react-three/fiber').ThreeEvent<PointerEvent>) => { const asset = assetAtFace([...batches, ...remainder][index].ranges, event.faceIndex); if (asset) { event.stopPropagation(); onHover(asset.asset_id); } }}
      onPointerMove={(event: import('@react-three/fiber').ThreeEvent<PointerEvent>) => { const asset = assetAtFace([...batches, ...remainder][index].ranges, event.faceIndex); if (asset) { event.stopPropagation(); onHover(asset.asset_id); } }}
      onPointerOut={() => onHover(null)}
      onClick={(event: import('@react-three/fiber').ThreeEvent<MouseEvent>) => { const asset = assetAtFace([...batches, ...remainder][index].ranges, event.faceIndex); if (asset) { event.stopPropagation(); onSelect(asset.asset_id); } }} />)}
  </group>;
}
function Equipment({ asset, registry, active, onHover, onSelect, tint, dim }: { asset: Asset; registry: AssetRegistry; active: boolean; geometry: 'blender' | 'proxy'; tint?: string; dim?: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  return <group name={asset.model_ref} ref={object => registry.bind(asset.asset_id, object)} position={worldPosition(asset)} rotation={[-asset.rotation.x, asset.rotation.z, -asset.rotation.y]}
    onPointerOver={event => { event.stopPropagation(); onHover(asset.asset_id); }}
    onPointerOut={() => onHover(null)} onClick={event => { event.stopPropagation(); onSelect(asset.asset_id); }}>
    <Proxy asset={asset} active={active} tint={tint} dim={dim} />
  </group>;
}
function Pipes({ data, registry, trace, running, scenarioState }: { data: NormalizedData; registry: AssetRegistry; trace: ReturnType<typeof traceAt>; running: boolean; scenarioState: ScenarioState }) {
  const { look } = useLook();
  const pack = useMaterialPack();
  const lines = useMemo(() => data.connections.flatMap(connection => {
    const from = registry.assets.get(connection.from_asset_id), to = registry.assets.get(connection.to_asset_id);
    if (!from || !to) return [];
    const a = worldPosition(from), b = worldPosition(to);
    const points = connection.route_points ? connection.route_points.map(point => new THREE.Vector3(point.x, point.z, -point.y)) : [new THREE.Vector3(a[0], 3, a[2]), new THREE.Vector3(a[0], 3, b[2]), new THREE.Vector3(b[0], 3, b[2])];
    const parts = points.slice(1).flatMap((end, index) => {
      const start = points[index], delta = end.clone().sub(start), length = delta.length();
      if (length < .01) return [];
      const radius = (connection.diameter ?? .6) / 2;
      const geometry = new THREE.CylinderGeometry(radius, radius, length, 10);
      geometry.applyMatrix4(new THREE.Matrix4().compose(start.clone().add(end).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()), new THREE.Vector3(1, 1, 1)));
      return [geometry];
    });
    return [{ connection, from, to, parts }];
  }), [data.connections, registry]);
  const geometries = useMemo(() => ['painted-steel', 'insulation', 'active'].map(role => {
    const parts = lines.filter(line => {
      const actual = trace.path?.connection_ids.includes(line.connection.connection_id) ? 'active' : ['hot_crude', 'preheated_crude'].includes(line.connection.service) ? 'insulation' : 'painted-steel';
      return actual === role;
    }).flatMap(line => line.parts);
    const merged = parts.length ? mergeGeometries(parts) : null;
    if (merged) materialUVs(merged, role === 'active' ? 1 : materialConfig.materials[role as 'painted-steel' | 'insulation'].tileMetres);
    return merged;
  }), [lines, trace.path]);
  useEffect(() => () => { lines.forEach(line => line.parts.forEach(part => part.dispose())); }, [lines]);
  useEffect(() => () => { geometries.forEach(geometry => geometry?.dispose()); }, [geometries]);
  return <group name="pipes">
    {geometries.map((geometry, index) => {
      const surface = look.id !== 'engineering' && index < 2 ? pack?.[index === 1 ? 'insulation' : 'painted-steel'] : undefined;
      return geometry ? <mesh key={index} geometry={geometry} castShadow={look.id !== 'engineering'} receiveShadow={look.id !== 'engineering'} userData={{ category: 'pipes' }}><meshStandardMaterial color={index === 2 ? effects.pipeActive : surface?.color ?? look.materials.pipe.color} map={surface?.map ?? null} normalMap={surface?.normalMap ?? null} roughnessMap={surface?.roughnessMap ?? null} metalness={surface?.metalness ?? look.materials.pipe.metalness} roughness={surface?.roughness ?? look.materials.pipe.roughness} /></mesh> : null;
    })}
    {lines.filter(line => trace.path?.connection_ids.includes(line.connection.connection_id)).map(line => <FlowOverlay key={line.connection.connection_id} from={line.from} to={line.to} running={running && !(trace.path?.ordered_asset_ids.some(id => scenarioState.statuses[id] === 'trip') ?? false)} name={line.connection.connection_id} />)}
  </group>;
}
export default function Scene({ cameraMove, data, registry, selected, hovered, reset, onHover, onSelect, geometry, layer, trace, running, scenarioState }: { cameraMove: CameraMove | null; geometry: 'blender' | 'proxy'; layer: Layer; trace: ReturnType<typeof traceAt>; running: boolean; scenarioState: ScenarioState; data: NormalizedData; registry: AssetRegistry; selected: string | null; hovered: string | null; reset: number; onHover: (id: string | null) => void; onSelect: (id: string | null) => void }) {
  const { look } = useLook();
  const [detailSeen, setDetailSeen] = useState(look.detailLevel === 1);
  useEffect(() => { if (look.detailLevel === 1) setDetailSeen(true); }, [look.detailLevel]);
  const light = look.lighting;
  const sourceAssets = useMemo(() => [...registry.assets.values()], [registry]);
  const sunTarget = useMemo(() => {
    const target = new THREE.Object3D();
    if (look.id !== 'engineering') {
      const xs = sourceAssets.map(asset => asset.position.x), zs = sourceAssets.map(asset => -asset.position.y);
      target.position.set((Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2);
      target.updateMatrixWorld(true);
    }
    return target;
  }, [look.id, sourceAssets]);
  const sunPosition = new THREE.Vector3(...light.sun.position).add(sunTarget.position);
  const effectiveAssets = useMemo(() => new Map(data.assets.map(asset => [asset.asset_id, asset])), [data.assets]);
  const style = (source: Asset): AssetStyle => {
    const asset = effectiveAssets.get(source.asset_id) ?? source;
    return { tint: asset.status === 'trip' ? '#ff653c' : layerStyle(asset, data, layer)?.color, dim: !!trace.path && !trace.path.ordered_asset_ids.includes(asset.asset_id), active: asset.asset_id === selected || asset.asset_id === hovered || asset.asset_id === trace.assetId || scenarioState.highlights.includes(asset.asset_id) };
  };
  return <SceneLoadingBoundary><Canvas shadows gl={{ antialias: true, toneMapping: { aces: THREE.ACESFilmicToneMapping, agx: THREE.AgXToneMapping }[look.post.toneMapping], toneMappingExposure: look.post.exposure }} frameloop={running ? 'always' : 'demand'} dpr={[1, 1.5]} camera={{ position: [232, 126, 169], fov: 42, near: 0.1, far: 1500 }} onPointerMissed={() => onSelect(null)} fallback={<p className="webgl-error">WebGL is unavailable. Use hardware acceleration.</p>}>
    <MaterialPackProvider>
    <LoadingDrawGate /><MotionClock />
    <color attach="background" args={[look.environment.background]} />
    <ambientLight intensity={light.ambient} /><hemisphereLight args={light.hemisphere} />
    <directionalLight castShadow={light.shadows} position={sunPosition} target={sunTarget} intensity={light.sun.intensity} color={light.sun.color} shadow-mapSize={light.shadow.size} shadow-camera-left={light.shadow.left} shadow-camera-right={light.shadow.right} shadow-camera-top={light.shadow.top} shadow-camera-bottom={light.shadow.bottom} shadow-camera-far={light.shadow.far} shadow-normalBias={light.shadow.normalBias} shadow-bias={light.shadow.bias} />
    <directionalLight position={light.fill.position} color={light.fill.color} intensity={light.fill.intensity} />
    <Atmosphere /><PlantAtmosphere assets={sourceAssets} /><MotionActors assets={sourceAssets} /><BudgetProfiler />
    <Controls cameraMove={cameraMove} selected={scenarioState.cameraId ? registry.assets.get(scenarioState.cameraId) : selected ? registry.assets.get(selected) : undefined} reset={reset} />
    <gridHelper visible={look.environment.grid} args={[500, 50, ...look.environment.gridColors]} position={[85, -3, -25]} />
    <Suspense fallback={null}><SourcedDressing assets={sourceAssets} /></Suspense><Site assets={sourceAssets} /><SiteDressing assets={sourceAssets} connections={data.connections} /><PhotorealEnvironment assets={sourceAssets} />
    <MaterialSwatches />
    {detailSeen && <Suspense fallback={null}><BlenderPlant detail visible={look.detailLevel === 1 && geometry === 'blender' && new URLSearchParams(location.search).get('materialSwatches') !== '1'} assets={sourceAssets} registry={registry} style={style} onHover={onHover} onSelect={onSelect} /></Suspense>}
    <Pipes data={data} registry={registry} trace={trace} running={running} scenarioState={scenarioState} />
    {data.assets.filter(asset => asset.asset_id === selected || asset.asset_id === trace.assetId || asset.status === 'trip').map(asset => <PlantLabel key={asset.asset_id} asset={asset} alert={asset.status === 'trip'} />)}
    <Suspense fallback={null}><VisualRuntime look={look.id} /><LookSnapshot registry={registry} />{geometry === 'blender' ? <BlenderPlant assets={sourceAssets} registry={registry} style={style} onHover={onHover} onSelect={onSelect} /> : <group name="equipment">{data.assets.map(asset => <Equipment key={asset.asset_id} asset={asset} registry={registry} geometry={geometry} {...style(asset)} onHover={onHover} onSelect={onSelect} />)}</group>}</Suspense>
    </MaterialPackProvider>
  </Canvas></SceneLoadingBoundary>;
}
