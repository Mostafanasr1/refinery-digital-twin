import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDressing } from './sliceState';
import { motionTime, useMotion } from './motionState';
import { roadPose, circuitLength, daylight } from './motionMath';
import { dressingSites } from './sliceDressing';
import type { Asset } from './data/loader';
import config from '../../data/presentation/motion.json';
import placement from '../../data/presentation/real-assets.json';

/** Copy geometry/material ownership; cached source objects remain immutable. */
export function sourceMesh(source: THREE.Group) {
  source.updateMatrixWorld(true);
  let found: THREE.Mesh | undefined;
  let meshCount = 0;
  source.traverse(node => { if (node instanceof THREE.Mesh) { found = node; meshCount++; } });
  if (meshCount !== 1 || !found || Array.isArray(found.material)) throw new Error('Expected prepared single-material source');
  return { geometry: found.geometry.clone().applyMatrix4(found.matrixWorld), material: found.material.clone() as THREE.MeshStandardMaterial };
}
export function SourcedDressing({ sources, assets, enabled }: { sources: THREE.Group[]; assets: Asset[]; enabled: boolean }) {
  const dressing = useDressing(), { hour } = useMotion();
  const resources = useMemo(() => {
    const group = new THREE.Group(); group.name = 'sourced-site-dressing'; group.userData.presentationOnly = true;
    const pose = new THREE.Object3D();
    const make = (index: number, name: string, positions: number[][], length?: number, width?: number) => {
      const { geometry, material } = sourceMesh(sources[index]);
      geometry.computeBoundingBox(); const box = geometry.boundingBox!, size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      geometry.translate(-center.x, -box.min.y, -center.z);
      const scale = Math.min(length ? length / size.x : 1, width ? width / size.z : 1);
      geometry.scale(scale, scale, scale);
      const mesh = new THREE.InstancedMesh(geometry, material, positions.length); mesh.name = name; mesh.receiveShadow = true; mesh.castShadow = true;
      positions.forEach(([x,y,z,yaw=0],i) => { pose.position.set(x,y,z); pose.rotation.set(0,yaw,0); pose.scale.setScalar(1); pose.updateMatrix(); mesh.setMatrixAt(i,pose.matrix); });
      mesh.computeBoundingSphere(); group.add(mesh); return mesh;
    };
    const xs=assets.map(a=>a.position.x), zs=assets.map(a=>-a.position.y);
    const minX=Math.min(...xs)-placement.boundsMargin, maxZ=Math.max(...zs)+placement.boundsMargin;
    const cabins=placement.cabins, containers=placement.containers, parked=placement.parkedPickup, panes=placement.windows;
    make(0,'sourced-cabins',Array.from({length:cabins.count},(_,i)=>[minX+cabins.offsetX+i*cabins.spacing,cabins.y,maxZ+cabins.offsetZ]),cabins.length,cabins.width);
    make(1,'sourced-containers',containers.offsetsX.map(x=>[minX+x,containers.y,maxZ+containers.offsetZ]),undefined,containers.width);
    const sites=dressingSites(assets).filter(s=>s.kind===5);
    const pickup=make(2,'moving-pickup',[[0,0,0]],config.vehicles[0].length,config.vehicles[0].width);
    make(2,'parked-pickups',sites.map(s=>[s.x,parked.y,s.z]),parked.length,parked.width);
    const tanker=make(3,'moving-tanker',[[0,0,0]],config.vehicles[1].length,config.vehicles[1].width);
    pickup.frustumCulled=tanker.frustumCulled=false;
    // Small warm window panes retain the approved night readability of the cabins.
    const windows=new THREE.InstancedMesh(new THREE.PlaneGeometry(panes.width,panes.height),new THREE.MeshStandardMaterial({color:'#acb6a6',emissive:'#ffcf83',emissiveIntensity:0}),cabins.count*panes.offsetsX.length);
    windows.name='sourced-cabin-windows';
    for(let i=0;i<windows.count;i++){pose.position.set(minX+cabins.offsetX+Math.floor(i/panes.offsetsX.length)*cabins.spacing+panes.offsetsX[i%panes.offsetsX.length],panes.y,maxZ+panes.offsetZ);pose.rotation.set(0,0,0);pose.scale.setScalar(1);pose.updateMatrix();windows.setMatrixAt(i,pose.matrix);}
    windows.computeBoundingSphere();group.add(windows);
    group.traverse(node=>{node.raycast=()=>undefined;node.userData.category='ground';});
    return {group,vehicles:[pickup,tanker],windows,pose};
  },[assets,sources]);
  useFrame(()=>{
    if(!enabled||!dressing)return;
    resources.vehicles.forEach((mesh,i)=>{const p=roadPose(motionTime()*config.road.speedMetresPerSecond+circuitLength*config.vehicles[i].phase);resources.pose.position.set(p.x,-.349,p.z);resources.pose.rotation.set(0,p.heading,0);resources.pose.scale.setScalar(1);resources.pose.updateMatrix();mesh.setMatrixAt(0,resources.pose.matrix);mesh.instanceMatrix.needsUpdate=true;});
  });
  useEffect(()=>{resources.windows.material.emissiveIntensity=(1-daylight(hour).day)*placement.windows.intensity;},[resources,hour]);
  useEffect(()=>()=>resources.group.traverse(node=>{if(node instanceof THREE.InstancedMesh){node.dispose();node.geometry.dispose();(node.material as THREE.Material).dispose();}}),[resources]);
  return <primitive object={resources.group} visible={enabled&&dressing} dispose={null}/>;
}
