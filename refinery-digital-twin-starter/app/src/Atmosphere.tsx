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
  const { gl, scene, camera, size, invalidate } = useThree();
  const composer = useMemo(() => {
    const result = new EffectComposer(gl);
    result.addPass(new RenderPass(scene, camera));
    result.addPass(new UnrealBloomPass(new THREE.Vector2(1,1), 0.35, 0.6, 1.1));
    result.addPass(new OutputPass());
    return result;
  }, [gl, scene, camera]);
  useEffect(() => { composer.setSize(size.width, size.height); invalidate(); }, [composer, size, invalidate]);
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture; scene.environmentIntensity = 0.3;
    invalidate();
    return () => { scene.environment = null; target.dispose(); room.dispose(); generator.dispose(); };
  }, [gl, scene, invalidate]);
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
  const bounds = useMemo(() => {
    const xs=assets.map(a=>a.position.x), zs=assets.map(a=>-a.position.y);
    return { x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs)+52,d:Math.max(...zs)-Math.min(...zs)+52 };
  }, [assets]);
  const {x,z,w,d}=bounds;
  return <group>
    <mesh receiveShadow position={[x,-1.5,z]}><boxGeometry args={[w,2,d]} /><meshStandardMaterial color="#162a35" roughness={0.8} /></mesh>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[x,-0.45,z]}><planeGeometry args={[w-2,d-2]} /><meshStandardMaterial color="#0b1a24" roughness={0.85} metalness={0.1} /></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[x,-0.35,z+side*(d/2-9)]}><planeGeometry args={[w-10,8]} /><meshStandardMaterial color="#0c1720" /></mesh>
      {Array.from({length:22},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x-w/2+12+i*(w-24)/21,-0.3,z+side*(d/2-9)]}><planeGeometry args={[3,0.2]} /><meshBasicMaterial color="#6e8591" /></mesh>)}
      <mesh position={[x,-0.2,z+side*(d/2-1)]}><boxGeometry args={[w,0.1,0.13]} /><meshBasicMaterial color="#35cddd" toneMapped={false} /></mesh>
      {Array.from({length:10},(_,i)=><group key={i} position={[x-w/2+10+i*(w-20)/9,0,z+side*(d/2-4)]}>
        <mesh position={[0,3,0]}><cylinderGeometry args={[0.08,0.12,6,6]} /><meshStandardMaterial color="#4b626f" /></mesh>
        <mesh position={[0,6,0]}><boxGeometry args={[1.4,0.16,0.7]} /><meshBasicMaterial color={[2.6,1.9,0.8]} toneMapped={false} /></mesh>
      </group>)}
    </group>)}
    {assets.filter(a=>!selfFoundation.has(a.type)).map(a=><mesh key={a.asset_id} receiveShadow position={[a.position.x,-0.25,-a.position.y]}><boxGeometry args={[Math.max(a.dimensions.length,a.dimensions.diameter)+3,0.35,Math.max(a.dimensions.width,a.dimensions.diameter)+3]} /><meshStandardMaterial color="#24333b" roughness={0.95} /></mesh>)}
  </group>;
}
