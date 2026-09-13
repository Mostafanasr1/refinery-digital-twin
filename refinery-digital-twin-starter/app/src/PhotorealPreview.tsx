import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { NormalizedData } from './data/loader';
type Manifest = { title: string; subtitle: string; asset_ids: string[]; model_url: string; render_url: string };
function Rig({ reset }: { reset: number }) {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement); controlsRef.current=controls;
    controls.target.set(0,1.9,0); controls.update();
    controls.enableDamping=true; controls.minDistance=4; controls.maxDistance=38; controls.maxPolarAngle=Math.PI*.49;
    const room=new RoomEnvironment(), generator=new THREE.PMREMGenerator(gl), target=generator.fromScene(room,.04);
    scene.environment=target.texture; scene.environmentIntensity=.8;
    return () => { controls.dispose(); scene.environment=null; target.dispose(); room.dispose(); generator.dispose(); };
  }, [camera,gl,scene]);
  useEffect(() => { camera.position.set(13,10,16); controlsRef.current?.target.set(0,1.9,0); controlsRef.current?.update(); }, [reset,camera]);
  useFrame(() => controlsRef.current?.update());
  return null;
}
function Model({ model, onSelect }: { model: THREE.Group; onSelect: (id: string) => void }) {
  const pick = (e: ThreeEvent<MouseEvent>) => { let object: THREE.Object3D | null=e.object; while (object) { if (typeof object.userData.asset_id === 'string') { e.stopPropagation(); onSelect(object.userData.asset_id); break; } object=object.parent; } };
  return <primitive object={model} onClick={pick} />;
}
export default function PhotorealPreview({ data }: { data: NormalizedData }) {
  const [manifest,setManifest]=useState<Manifest | null>(null);
  const [model,setModel]=useState<THREE.Group | null>(null);
  const [error,setError]=useState('');
  const [view,setView]=useState<'3d' | 'render'>('3d');
  const [reset,setReset]=useState(0);
  const [selected,select]=useState<string | null>(null);
  useEffect(() => {
    let disposed=false; let loaded: THREE.Group | undefined;
    const controller=new AbortController();
    const release=(group: THREE.Group) => { group.traverse(o=> { if(o instanceof THREE.Mesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material)=>m.dispose()); } }); };
    async function load() {
      const response=await fetch(`${import.meta.env.BASE_URL}preview/manifest.json`,{signal:controller.signal});
      if(!response.ok) throw new Error('Preview is unavailable. Build the Blender preview first.');
      const config: Manifest=await response.json();
      if(disposed) return;
      setManifest(config);
      const gltf=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}${config.model_url}`);
      if(disposed) { release(gltf.scene); return; }
      loaded=gltf.scene; loaded.traverse(o=>{ if(o instanceof THREE.Mesh) { o.castShadow=true; o.receiveShadow=true; } }); setModel(loaded);
    }
    load().catch(e=>{ if(!disposed) setError(String(e)); });
    return () => { disposed=true; controller.abort(); if(loaded) release(loaded); };
  }, []);
  const asset=data.assets.find(a=>a.asset_id === selected);
  return <main className="photoreal-page">
    <div className="preview-heading"><span className="eyebrow">MERIDIAN / VISUAL DEVELOPMENT</span><h1>{manifest?.title ?? 'Photoreal preview'}<span className="dot">.</span></h1><p>{manifest?.subtitle}</p></div>
    <div className="preview-switch" role="group" aria-label="Preview mode"><button aria-pressed={view==='3d'} onClick={()=>setView('3d')}>Interactive 3D</button><button aria-pressed={view==='render'} onClick={()=>setView('render')}>Cinematic render</button></div>
    <div className="preview-stage">
      {view==='3d' && model ? <Canvas fallback={<div className="preview-loading" role="status"><p>Interactive 3D is unavailable in this browser. Enable hardware acceleration or use the cinematic view.</p><button onClick={()=>setView('render')}>Show cinematic render</button></div>} shadows dpr={[1,2]} camera={{position:[13,10,16],fov:43,near:.1,far:250}} gl={{antialias:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=.75;}}>
        <color attach="background" args={['#17222a']} /><fog attach="fog" args={['#17222a',45,110]} />
        <Rig reset={reset} /><Model model={model} onSelect={select} />
        <directionalLight position={[-8,12,6]} intensity={2} color="#ffe0b4" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.035} />
        <directionalLight position={[8,6,-4]} intensity={1} color="#c3e7ff" />
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.44,0]} receiveShadow><planeGeometry args={[250,250]} /><meshStandardMaterial color="#273137" roughness={.92} /></mesh>
      </Canvas> : view==='render' && manifest ? <img className="preview-render" src={`${import.meta.env.BASE_URL}${manifest.render_url}`} alt="Blender rendered preheat module with stainless exchanger, blue pumps, detailed pipework and access platform" onError={()=>setError('The rendered image is unavailable.')} /> : <div className="preview-loading" role="status">{error || 'Loading detailed Blender geometry…'}</div>}
      <div className="preview-mode-note">{view==='3d' ? 'LIVE 3D / DRAG TO ORBIT' : 'BLENDER CYCLES / PRE-RENDERED STILL'}</div>
      {error && model ? <div className="preview-loading" role="alert">{error}</div> : null}
    </div>
    <aside className="preview-detail"><span className="eyebrow">{asset ? 'SELECTED EQUIPMENT' : 'A CLOSER LOOK'}</span><h2>{asset?.tag ?? 'Built for inspection.'}</h2><p>{asset?.name ?? 'Explore the flange bolts, valve wheels, motor fins and access steelwork.'}</p><div className="preview-assets">{manifest?.asset_ids.map(id=>{const item=data.assets.find(a=>a.asset_id===id);return item ? <button key={id} aria-pressed={selected===id} onClick={()=>select(id)}>{item.tag}</button> : null;})}</div><small>Synthetic design study · Visual target<br />{view==='3d' ? 'Real geometry with real-time lighting.' : 'Offline lighting and surface detail. Fixed viewpoint.'}</small></aside>
    <div className="preview-bottom"><span>ONE MODULE. A DIRECTION FOR THE WHOLE PLANT.</span><button onClick={()=>{setView('3d');setReset(n=>n+1);select(null);}}>Reset 3D view</button><span>{view==='3d' ? 'Drag to orbit · Right-drag to pan · Scroll to inspect' : 'Same Blender model · Cinematic lighting study'}</span></div>
  </main>;
}
