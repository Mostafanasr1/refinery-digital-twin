import * as THREE from 'three';
import type { Asset, NormalizedData, ProcessPath } from './data/loader';
import { worldPosition } from './data/registry';
import config from '../../data/presentation/flow.json';
export type PipeRoute = { id: string; from: string; to: string; service: string; radius: number; points: THREE.Vector3[] };
export type FlowSegment = { start: THREE.Vector3; end: THREE.Vector3; radius: number; offset: number; length: number; kind: 'pipe' | 'gap' | 'arc'; connectionId: string };
/** This descriptor is shared by the physical pipes and the flow overlay. */
export function pipeRoutes(connections: NormalizedData['connections'], assets: Map<string, Asset>): PipeRoute[] {
  return connections.flatMap(c => {
    const from=assets.get(c.from_asset_id),to=assets.get(c.to_asset_id);if(!from||!to)return [];
    const a=worldPosition(from),b=worldPosition(to);
    const points=c.route_points?.length ? c.route_points.map(p=>new THREE.Vector3(p.x,p.z,-p.y)) : [new THREE.Vector3(a[0],3,a[2]),new THREE.Vector3(a[0],3,b[2]),new THREE.Vector3(b[0],3,b[2])];
    return [{id:c.connection_id,from:c.from_asset_id,to:c.to_asset_id,service:c.service,radius:(c.diameter??.6)/2,points:points.filter((p,i)=>i===0||p.distanceTo(points[i-1])>=.01)}];
  });
}
export function flowSegments(routes: PipeRoute[], path: ProcessPath): FlowSegment[] {
  const segments: FlowSegment[]=[];let offset=0;let previous:THREE.Vector3|undefined;
  const append=(start:THREE.Vector3,end:THREE.Vector3,radius:number,kind:FlowSegment['kind'],connectionId:string)=>{const length=start.distanceTo(end);if(length<.01)return;segments.push({start,end,radius,offset,length,kind,connectionId});offset+=length;};
  path.connection_ids.forEach((id,index)=>{
    const route=routes.find(r=>r.id===id);if(!route)return;
    const reverse=path.ordered_asset_ids[index]===route.to;
    const points=reverse?[...route.points].reverse():route.points;
    if(!points.length)return;
    if(previous&&previous.distanceTo(points[0])>=.01){
      const distance=previous.distanceTo(points[0]),rise=Math.min(config.gapMaxRiseMetres,distance*config.gapRiseRatio);
      const mid=previous.clone().lerp(points[0],.5);mid.y+=rise;
      const gap=new THREE.QuadraticBezierCurve3(previous,mid,points[0]);const n=Math.max(2,Math.ceil(distance/config.gapStepMetres));
      for(let i=0;i<n;i++)append(gap.getPoint(i/n),gap.getPoint((i+1)/n),route.radius,'gap',id);
    }
    for(let i=1;i<points.length;i++)append(points[i-1],points[i],route.radius,'pipe',id);
    previous=points.at(-1);
  });return segments;
}
export function segmentMatrix(start:THREE.Vector3,end:THREE.Vector3,radius:number){
  const delta=end.clone().sub(start);return new THREE.Matrix4().compose(start.clone().add(end).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()),new THREE.Vector3(radius,delta.length(),radius));
}

/** Same raised Catmull-Rom shape as the previous airborne style, now sampled for one instanced tube batch. */
export function arcSegments(path: ProcessPath, assets: Map<string, Asset>): FlowSegment[] {
  const result: FlowSegment[] = []; let offset = 0;
  path.connection_ids.forEach((connectionId, index) => {
    const from = assets.get(path.ordered_asset_ids[index]), to = assets.get(path.ordered_asset_ids[index + 1]);
    if (!from || !to) return;
    const a = new THREE.Vector3(...worldPosition(from)), b = new THREE.Vector3(...worldPosition(to));
    a.y += from.dimensions.height + config.arcEndpointClearanceMetres;
    b.y += to.dimensions.height + config.arcEndpointClearanceMetres;
    const mid = a.clone().lerp(b, .5); mid.y = Math.max(a.y, b.y) + config.arcRiseMetres;
    const points = new THREE.CatmullRomCurve3([a, mid, b]).getPoints(config.arcSegments);
    points.slice(1).forEach((end, i) => {
      const start = points[i], length = start.distanceTo(end);
      if (length < .001) return;
      result.push({start,end,length,offset,radius:config.arcRadiusMetres,kind:'arc',connectionId});offset += length;
    });
  });
  return result;
}
