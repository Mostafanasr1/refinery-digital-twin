import { useLook } from './looks/LookProvider';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type { Asset } from './data/loader';
import { selfFoundation } from './data/silhouettes';
export function Atmosphere() {
  const { look } = useLook();
  const { gl, scene, camera, size, invalidate } = useThree();
  const composer = useMemo(() => {
    const result = new EffectComposer(gl);
    result.addPass(new RenderPass(scene, camera));
    result.addPass(new UnrealBloomPass(new THREE.Vector2(1,1), 0, 0, 0));
    result.addPass(new OutputPass());
    return result;
  }, [gl, scene, camera]);
  useEffect(() => {
    const bloom = composer.passes[1] as UnrealBloomPass;
    bloom.strength = look.post.bloom.intensity; bloom.radius = look.post.bloom.radius; bloom.threshold = look.post.bloom.threshold;
    gl.toneMapping = { aces: THREE.ACESFilmicToneMapping }[look.post.toneMapping]; gl.toneMappingExposure = look.post.exposure;
    invalidate();
  }, [composer, gl, look, invalidate]);
  useEffect(() => () => { composer.passes.forEach(pass => pass.dispose()); composer.dispose(); }, [composer]);
  useEffect(() => { composer.setSize(size.width, size.height); invalidate(); }, [composer, size, invalidate]);
  useEffect(() => {
    if (!look.environment.room) { scene.environment = null; invalidate(); return; }
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture; scene.environmentIntensity = look.environment.intensity;
    invalidate();
    return () => { scene.environment = null; target.dispose(); room.dispose(); generator.dispose(); };
  }, [gl, scene, invalidate, look.environment.room, look.environment.intensity]);
  const timing = useRef({ start: 0, frames: 0 });
  useFrame(() => {
    const now=performance.now();
    if (!timing.current.start) timing.current.start=now;
    gl.info.autoReset=false; gl.info.reset(); composer.render(); timing.current.frames++;
    if (now-timing.current.start > 2000) {
      gl.domElement.dataset.performance=JSON.stringify({ fps: Math.round(timing.current.frames*1000/(now-timing.current.start)), calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures });
      timing.current={ start:now,frames:0 };
    }
  }, 1);
  return null;
}
export function PlantLabel({ asset, alert = false }: { asset: Asset; alert?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=112;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle='#071c29'; ctx.fillRect(0,0,512,112);
    ctx.strokeStyle=alert ? '#ff835e' : '#52dff0'; ctx.lineWidth=4; ctx.strokeRect(2,2,508,108);
    ctx.fillStyle='#e3f5ff'; ctx.font='bold 32px sans-serif'; ctx.fillText(asset.tag,18,43);
    ctx.fillStyle='#91b8cb'; ctx.font='20px sans-serif'; ctx.fillText(asset.name.slice(0,37),18,83);
    return new THREE.CanvasTexture(canvas);
  }, [asset.tag, asset.name, alert]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <sprite position={[asset.position.x, asset.position.z + asset.dimensions.height + 3, -asset.position.y]} scale={[28,6.1,1]}><spriteMaterial map={texture} depthTest={false} toneMapped={false} /></sprite>;
}
export function Site({ assets }: { assets: Asset[] }) {
  const { look } = useLook();
  const site = look.environment.site;
  const bounds = useMemo(() => {
    const xs=assets.map(a=>a.position.x), zs=assets.map(a=>-a.position.y);
    return { x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs)+52,d:Math.max(...zs)-Math.min(...zs)+52 };
  }, [assets]);
  const object = useMemo(() => {
    const { x, z, w, d } = bounds;
    const group = new THREE.Group(); group.name = 'site';
    const matrix = (position: number[], scale = [1, 1, 1], rotate = false) => new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(rotate ? -Math.PI / 2 : 0, 0, 0)), new THREE.Vector3(...scale));
    const add = (name: string, geometry: THREE.BufferGeometry, transforms: THREE.Matrix4[], basic = false, shadow = false) => {
      const material = basic ? new THREE.MeshBasicMaterial() : new THREE.MeshStandardMaterial();
      const mesh = new THREE.InstancedMesh(geometry, material, transforms.length); mesh.name = name;
      mesh.receiveShadow = shadow; mesh.userData.category = name === 'pole' || name === 'lamp' ? 'lamps' : 'ground';
      transforms.forEach((transform, index) => mesh.setMatrixAt(index, transform)); mesh.computeBoundingSphere(); group.add(mesh);
    };
    add('base', new THREE.BoxGeometry(w, 2, d), [matrix([x, -1.5, z])], false, true);
    add('surface', new THREE.PlaneGeometry(w - 2, d - 2), [matrix([x, -.45, z], undefined, true)], false, true);
    add('road', new THREE.PlaneGeometry(w - 10, 8), [-1, 1].map(side => matrix([x, -.35, z + side * (d / 2 - 9)], undefined, true)));
    add('marking', new THREE.PlaneGeometry(3, .2), [-1, 1].flatMap(side => Array.from({ length: 22 }, (_, i) => matrix([x - w / 2 + 12 + i * (w - 24) / 21, -.3, z + side * (d / 2 - 9)], undefined, true))), true);
    add('edge', new THREE.BoxGeometry(w, .1, .13), [-1, 1].map(side => matrix([x, -.2, z + side * (d / 2 - 1)])), true);
    for (const [name, height, geometry] of [['pole', 3, new THREE.CylinderGeometry(.08, .12, 6, 6)], ['lamp', 6, new THREE.BoxGeometry(1.4, .16, .7)]] as const) {
      add(name, geometry, [-1, 1].flatMap(side => Array.from({ length: 10 }, (_, i) => matrix([x - w / 2 + 10 + i * (w - 20) / 9, height, z + side * (d / 2 - 4)]))), name === 'lamp');
    }
    add('foundation', new THREE.BoxGeometry(1, .35, 1), assets.filter(asset => !selfFoundation.has(asset.type)).map(asset => matrix([asset.position.x, -.25, -asset.position.y], [Math.max(asset.dimensions.length, asset.dimensions.diameter) + 3, 1, Math.max(asset.dimensions.width, asset.dimensions.diameter) + 3])), false, true);
    return group;
  }, [assets, bounds]);
  useEffect(() => {
    object.children.forEach(child => {
      const mesh = child as THREE.InstancedMesh, material = mesh.material as THREE.MeshStandardMaterial;
      mesh.visible = look.id !== 'photoreal' || !['base', 'surface', 'road', 'marking', 'edge'].includes(mesh.name);
      mesh.castShadow = look.id === 'photoreal' && mesh.name === 'pole';
      const key = mesh.name as 'base' | 'surface' | 'road' | 'marking' | 'edge' | 'pole' | 'lamp' | 'foundation';
      const color = site[key]; if (Array.isArray(color)) material.color.setRGB(...color); else material.color.set(color); material.toneMapped = key !== 'edge' && key !== 'lamp';
      if (key === 'base') material.roughness = site.baseRoughness;
      if (key === 'surface') { material.roughness = site.surfaceRoughness; material.metalness = site.surfaceMetalness; }
      if (key === 'foundation') material.roughness = site.foundationRoughness;
    });
  }, [object, site, look.id]);
  useEffect(() => () => { object.children.forEach(child => { const mesh = child as THREE.InstancedMesh; mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); mesh.dispose(); }); }, [object]);
  return <primitive object={object} />;
}
