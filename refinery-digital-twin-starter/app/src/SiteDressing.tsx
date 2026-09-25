import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLook } from './looks/LookProvider';
import type { Asset } from './data/loader';

/** Non-canonical stored pipe bundles: site dressing only, with no IDs or interaction. */
export function SiteDressing({assets}:{assets:Asset[]}) {
 const {look}=useLook();
 const group=useMemo(()=>{
  const result=new THREE.Group();result.name='non-canonical-site-dressing';result.userData.category='ground';
  const xs=assets.map(a=>a.position.x),zs=assets.map(a=>-a.position.y);
  const centers:THREE.Vector3[]=[];
  for(let x=Math.min(...xs)+6;x<Math.max(...xs)-6 && centers.length<8;x+=18) {
   for(let z=Math.min(...zs)+6;z<Math.max(...zs)-6 && centers.length<8;z+=16) {
    const clear=assets.every(a=>Math.abs(x-a.position.x)>Math.max(a.dimensions.length,a.dimensions.diameter)/2+8 || Math.abs(z+a.position.y)>Math.max(a.dimensions.width,a.dimensions.diameter)/2+5);
    if(clear)centers.push(new THREE.Vector3(x,0,z));
   }
  }
  const pipes:THREE.Matrix4[]=[],sleepers:THREE.Matrix4[]=[];
  for(const center of centers) {
   for(let row=0;row<2;row++)for(let i=0;i<6-row;i++) pipes.push(new THREE.Matrix4().compose(center.clone().add(new THREE.Vector3(0,.35+row*.3,(i-2.5)*.36+row*.18)),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2),new THREE.Vector3(1,1,1)));
   for(const x of [-3,3])sleepers.push(new THREE.Matrix4().makeTranslation(center.x+x,.04,center.z));
  }
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,matrices:THREE.Matrix4[])=>{
   const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((matrix,index)=>mesh.setMatrixAt(index,matrix));mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.raycast=()=>undefined;mesh.userData.category='ground';result.add(mesh);
  };
  add(new THREE.CylinderGeometry(.15,.15,9,10,1,true),new THREE.MeshStandardMaterial({color:'#555b5b',roughness:.75,metalness:.45,side:THREE.DoubleSide}),pipes);
  add(new THREE.BoxGeometry(.3,.25,2.6),new THREE.MeshStandardMaterial({color:'#78684e',roughness:.95}),sleepers);
  result.userData.bundleCount=centers.length;return result;
 },[assets]);
 useEffect(()=>()=>group.children.forEach(node=>{const mesh=node as THREE.InstancedMesh;mesh.geometry.dispose();(mesh.material as THREE.Material).dispose();mesh.dispose();}),[group]);
 return <primitive object={group} visible={look.id!=='engineering'} />;
}
