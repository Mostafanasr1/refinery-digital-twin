import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLook } from './looks/LookProvider';
import { useMaterialPack } from './looks/MaterialPack';
import materialConfig from '../../data/presentation/materials.json';
import config from '../../data/presentation/flow.json';
import type { NormalizedData } from './data/loader';
import type { AssetRegistry } from './data/registry';
import type { ScenarioState, traceAt } from './data/operations';
import { pipeRoutes, segmentMatrix } from './flowGeometry';
import FlowOverlay from './FlowOverlay';

export function Pipes({data,registry,trace,running,scenarioState}:{data:NormalizedData;registry:AssetRegistry;trace:ReturnType<typeof traceAt>;running:boolean;scenarioState:ScenarioState}) {
  const {look}=useLook(),pack=useMaterialPack();
  const routes=useMemo(()=>pipeRoutes(data.connections,registry.assets),[data.connections,registry]);
  const batches=useMemo(()=>(['painted-steel','insulation'] as const).map(role=>{
    const segments=routes.filter(r=>(['hot_crude','preheated_crude'].includes(r.service)?'insulation':'painted-steel')===role).flatMap(r=>r.points.slice(1).map((end,i)=>({id:r.id,start:r.points[i],end,radius:r.radius})));
    const geometry=new THREE.CylinderGeometry(1,1,1,10);
    const active=new THREE.InstancedBufferAttribute(new Float32Array(segments.length),1);geometry.setAttribute('pipeActive',active);
    const material=new THREE.MeshStandardMaterial();
    material.onBeforeCompile=shader=>{
      shader.uniforms.activeTint={value:new THREE.Color(config.activeTint)};shader.uniforms.tintStrength={value:config.tintStrength};shader.uniforms.activeEmission={value:config.emissiveIntensity};shader.uniforms.tileMetres={value:materialConfig.materials[role].tileMetres};
      shader.vertexShader='attribute float pipeActive; varying float activePipe; uniform float tileMetres;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
        activePipe=pipeActive;
        vec3 p=(instanceMatrix*vec4(position,1.0)).xyz;
        vec3 n=abs(normalize(mat3(instanceMatrix)*normal));
        vec2 metreUv=vec2(n.x>n.y&&n.x>n.z?p.z:p.x,n.y>n.x&&n.y>n.z?p.z:p.y)/tileMetres;
        #ifdef USE_MAP
          vMapUv=(mapTransform*vec3(metreUv,1.0)).xy;
        #endif
        #ifdef USE_NORMALMAP
          vNormalMapUv=(normalMapTransform*vec3(metreUv,1.0)).xy;
        #endif
        #ifdef USE_ROUGHNESSMAP
          vRoughnessMapUv=(roughnessMapTransform*vec3(metreUv,1.0)).xy;
        #endif`);
      shader.fragmentShader='varying float activePipe; uniform vec3 activeTint; uniform float tintStrength; uniform float activeEmission;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,activeTint,activePipe*tintStrength);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=activeTint*activePipe*activeEmission;');
    };
    material.customProgramCacheKey=()=>`instanced-pipe-metres-${role}-v1`;
    const mesh=new THREE.InstancedMesh(geometry,material,segments.length);mesh.name=`physical-pipes-${role}`;mesh.userData.category='pipes';mesh.raycast=()=>undefined;
    segments.forEach((s,i)=>mesh.setMatrixAt(i,segmentMatrix(s.start,s.end,s.radius)));mesh.computeBoundingSphere();
    return {role,segments,geometry,material,mesh,active};
  }),[routes]);
  useEffect(()=>{
    for(const batch of batches){const surface=look.id==='engineering'?undefined:pack?.[batch.role],m=batch.material;
      const programChanged=Boolean(m.map)!==Boolean(surface?.map)||Boolean(m.normalMap)!==Boolean(surface?.normalMap)||Boolean(m.roughnessMap)!==Boolean(surface?.roughnessMap);
      m.color.set(surface?.color??look.materials.pipe.color);m.map=surface?.map??null;m.normalMap=surface?.normalMap??null;m.roughnessMap=surface?.roughnessMap??null;m.metalness=surface?.metalness??look.materials.pipe.metalness;m.roughness=surface?.roughness??look.materials.pipe.roughness;if(programChanged)m.needsUpdate=true;batch.mesh.castShadow=batch.mesh.receiveShadow=look.id!=='engineering';
    }
  },[batches,look,pack]);
  useEffect(()=>{for(const b of batches){b.segments.forEach((s,i)=>b.active.setX(i,trace.path?.connection_ids.includes(s.id)?1:0));b.active.needsUpdate=true;}},[batches,trace.path]);
  useEffect(()=>{
    if(new URLSearchParams(location.search).get('measure')!=='1')return;
    const host=window as unknown as Record<string,unknown>;const snapshot=()=>batches.flatMap(b=>b.segments.map((s,i)=>({id:s.id,active:b.active.getX(i)})));host.__refineryPipeTint=snapshot;
    return()=>{if(host.__refineryPipeTint===snapshot)delete host.__refineryPipeTint;};
  },[batches]);
  useEffect(()=>()=>{for(const b of batches){b.mesh.dispose();b.geometry.dispose();b.material.dispose();}},[batches]);
  return <group name="pipes">{batches.map(b=><primitive key={b.role} object={b.mesh} dispose={null}/>)}{trace.path&&<FlowOverlay assets={registry.assets} routes={routes} path={trace.path} running={running&&!trace.path.ordered_asset_ids.some(id=>scenarioState.statuses[id]==='trip')}/>}</group>;
}
