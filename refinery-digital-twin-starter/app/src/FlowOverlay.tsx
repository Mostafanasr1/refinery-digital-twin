import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motionSnapshot } from './motionState';
import { useFlowStyle } from './flowStyle';
import type { Asset, ProcessPath } from './data/loader';
import { arcSegments, flowSegments, segmentMatrix, type PipeRoute } from './flowGeometry';
import config from '../../data/presentation/flow.json';
/** One instanced coaxial shell; its gradient travels in physical distance across bends. */
export default function FlowOverlay({ routes, assets, path, running }: { routes:PipeRoute[]; assets:Map<string,Asset>; path:ProcessPath; running:boolean }) {
  const phase=useRef(0), style=useFlowStyle();
  const resources=useMemo(()=>{
    const segments=style==='arcs'?arcSegments(path,assets):flowSegments(routes,path);
    const geometry=new THREE.CylinderGeometry(1,1,1,config.radialSegments,1,true);
    geometry.setAttribute('flowRange',new THREE.InstancedBufferAttribute(new Float32Array(segments.flatMap(s=>[s.offset,s.length])),2));
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{baseOpacity:{value:style==='arcs'?config.arcBaseOpacity:0},viewportHeight:{value:900},minimumWidth:{value:config.minimumScreenWidthPixels},phase:{value:0},spacing:{value:config.spacingMetres},pulseLength:{value:config.pulseLengthMetres},pulseColor:{value:new THREE.Vector3(...config.pulseColor)}},
      vertexShader:`attribute vec2 flowRange; varying float distanceAlong;
        uniform float viewportHeight; uniform float minimumWidth;
        void main(){
          distanceAlong=flowRange.x+(position.y+.5)*flowRange.y;
          vec4 centre=modelViewMatrix*instanceMatrix*vec4(0.0,position.y,0.0,1.0);
          vec4 vertex=modelViewMatrix*instanceMatrix*vec4(position,1.0);
          float radius=length((modelViewMatrix*instanceMatrix*vec4(1.0,0.0,0.0,0.0)).xyz);
          float minimumRadius=minimumWidth*max(-centre.z,0.0)/(viewportHeight*projectionMatrix[1][1]);
          vertex.xyz=centre.xyz+(vertex.xyz-centre.xyz)*max(1.0,minimumRadius/max(radius,.0001));
          gl_Position=projectionMatrix*vertex;
        }`,
      fragmentShader:'uniform float baseOpacity; uniform float phase; uniform float spacing; uniform float pulseLength; uniform vec3 pulseColor; varying float distanceAlong; void main(){float tail=mod(phase-distanceAlong,spacing);float alpha=(1.0-smoothstep(0.0,pulseLength,tail))*smoothstep(0.0,.35,tail);alpha=baseOpacity+(1.0-baseOpacity)*alpha*.92;if(alpha<.01)discard;gl_FragColor=vec4(pulseColor,alpha);}' });
    const mesh=new THREE.InstancedMesh(geometry,material,segments.length);mesh.name='process-flow-tubes';mesh.userData.category='pipes';mesh.raycast=()=>undefined;
    segments.forEach((s,i)=>mesh.setMatrixAt(i,segmentMatrix(s.start,s.end,s.radius+config.shellOffsetMetres)));mesh.computeBoundingSphere();mesh.frustumCulled=false;mesh.renderOrder=1;
    return {segments,geometry,material,mesh};
  },[routes,assets,path,style]);
  useEffect(()=>{phase.current=0;},[path]);
  useFrame((state,delta)=>{resources.material.uniforms.viewportHeight.value=state.size.height;if(running&&motionSnapshot().enabled)phase.current=(phase.current+Math.min(delta,.1)*config.speedMetresPerSecond)%config.spacingMetres;resources.material.uniforms.phase.value=phase.current;});
  useEffect(()=>{
    if(new URLSearchParams(location.search).get('measure')!=='1')return;
    const host=window as unknown as Record<string,unknown>;const snapshot=()=>({style,minimumScreenWidthPixels:config.minimumScreenWidthPixels,phase:phase.current,pathId:path.process_path_id,connections:path.connection_ids,segments:resources.segments.map(s=>({...s,start:s.start.toArray(),end:s.end.toArray()})),instances:resources.mesh.count,drawBatches:1,depthTest:resources.material.depthTest});host.__refineryFlow=snapshot;
    return()=>{if(host.__refineryFlow===snapshot)delete host.__refineryFlow;};
  },[resources,path,style]);
  useEffect(()=>()=>{resources.mesh.dispose();resources.geometry.dispose();resources.material.dispose();},[resources]);
  return <primitive object={resources.mesh} dispose={null}/>;
}
