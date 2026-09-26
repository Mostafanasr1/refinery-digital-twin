import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motionSnapshot } from './motionState';
import type { ProcessPath } from './data/loader';
import { flowSegments, segmentMatrix, type PipeRoute } from './flowGeometry';
import config from '../../data/presentation/flow.json';
/** One instanced coaxial shell; its gradient travels in physical distance across bends. */
export default function FlowOverlay({ routes, path, running }: { routes:PipeRoute[]; path:ProcessPath; running:boolean }) {
  const phase=useRef(0);
  const resources=useMemo(()=>{
    const segments=flowSegments(routes,path);
    const geometry=new THREE.CylinderGeometry(1,1,1,config.radialSegments,1,true);
    geometry.setAttribute('flowRange',new THREE.InstancedBufferAttribute(new Float32Array(segments.flatMap(s=>[s.offset,s.length])),2));
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{phase:{value:0},spacing:{value:config.spacingMetres},pulseLength:{value:config.pulseLengthMetres},pulseColor:{value:new THREE.Vector3(...config.pulseColor)}},
      vertexShader:'attribute vec2 flowRange; varying float distanceAlong; void main(){distanceAlong=flowRange.x+(position.y+.5)*flowRange.y;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform float phase; uniform float spacing; uniform float pulseLength; uniform vec3 pulseColor; varying float distanceAlong; void main(){float tail=mod(phase-distanceAlong,spacing);float alpha=(1.0-smoothstep(0.0,pulseLength,tail))*smoothstep(0.0,.35,tail);if(alpha<.01)discard;gl_FragColor=vec4(pulseColor,alpha*.92);}' });
    const mesh=new THREE.InstancedMesh(geometry,material,segments.length);mesh.name='process-flow-tubes';mesh.userData.category='pipes';mesh.raycast=()=>undefined;
    segments.forEach((s,i)=>mesh.setMatrixAt(i,segmentMatrix(s.start,s.end,s.radius+config.shellOffsetMetres)));mesh.computeBoundingSphere();mesh.renderOrder=1;
    return {segments,geometry,material,mesh};
  },[routes,path]);
  useEffect(()=>{phase.current=0;},[path]);
  useFrame((_,delta)=>{if(running&&motionSnapshot().enabled)phase.current=(phase.current+Math.min(delta,.1)*config.speedMetresPerSecond)%config.spacingMetres;resources.material.uniforms.phase.value=phase.current;});
  useEffect(()=>{
    if(new URLSearchParams(location.search).get('measure')!=='1')return;
    const host=window as unknown as Record<string,unknown>;const snapshot=()=>({phase:phase.current,pathId:path.process_path_id,connections:path.connection_ids,segments:resources.segments.map(s=>({...s,start:s.start.toArray(),end:s.end.toArray()})),instances:resources.mesh.count,drawBatches:1,depthTest:resources.material.depthTest});host.__refineryFlow=snapshot;
    return()=>{if(host.__refineryFlow===snapshot)delete host.__refineryFlow;};
  },[resources,path]);
  useEffect(()=>()=>{resources.mesh.dispose();resources.geometry.dispose();resources.material.dispose();},[resources]);
  return <primitive object={resources.mesh} dispose={null}/>;
}
