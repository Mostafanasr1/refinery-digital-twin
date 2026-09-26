import { describe,it,expect } from 'vitest';
import * as THREE from 'three';
import assets from '../../data/normalized/assets.json';
import connections from '../../data/normalized/connections.json';
import paths from '../../data/normalized/process_paths.json';
import type { Asset, ProcessPath } from './data/loader';
import { pipeRoutes,flowSegments,segmentMatrix,type PipeRoute } from './flowGeometry';
const registry=new Map(assets.map(a=>[a.asset_id,a as Asset]));
const routes=pipeRoutes(connections,registry);
describe('shared physical pipe flow routes',()=>{
 it('uses actual centreline segments, continuous metres and zero gap arcs on all real paths',()=>{
  for(const path of paths){const segments=flowSegments(routes,path);expect(segments.length).toBeGreaterThan(0);let distance=0;
   for(const s of segments){expect(s.kind).toBe('pipe');expect(s.offset).toBeCloseTo(distance);distance+=s.length;
    const route=routes.find(r=>r.id===s.connectionId)!;expect(route.points.some((p,i)=>i>0&&route.points[i-1].equals(s.start)&&p.equals(s.end))).toBe(true);
    const m=segmentMatrix(s.start,s.end,s.radius);expect(new THREE.Vector3(0,-.5,0).applyMatrix4(m).distanceTo(s.start)).toBeLessThan(1e-8);expect(new THREE.Vector3(0,.5,0).applyMatrix4(m).distanceTo(s.end)).toBeLessThan(1e-8);
   }
  }
 });
 it('retains fallback physical pipes when route_points is absent; this is not an airborne gap',()=>{
  const c={...connections[0],route_points:undefined};const fallback=pipeRoutes([c],registry);expect(fallback[0].points.length).toBeGreaterThan(1);
  const path={process_path_id:'test',name:'test',connection_ids:[c.connection_id],ordered_asset_ids:[c.from_asset_id,c.to_asset_id]};expect(flowSegments(fallback,path).every(s=>s.kind==='pipe')).toBe(true);
 });
 it('removes zero lengths and reverses both direction and accumulated distance for a reverse traversal',()=>{
  const route:PipeRoute={id:'a',from:'one',to:'two',service:'test',radius:.3,points:[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(3,0,0),new THREE.Vector3(3,0,4)]};
  const path:ProcessPath={process_path_id:'reverse',name:'reverse',connection_ids:['a'],ordered_asset_ids:['two','one']};const s=flowSegments([route],path);expect(s.length).toBe(2);expect(s[0].start.toArray()).toEqual([3,0,4]);expect(s[1].end.toArray()).toEqual([0,0,0]);expect(s[1].offset).toBe(4);
 });
 it('arcs only the uncovered interval between two physical runs and joins exact endpoints',()=>{
  const route=(id:string,from:string,to:string,a:number,b:number):PipeRoute=>({id,from,to,service:'test',radius:.2,points:[new THREE.Vector3(a,0,0),new THREE.Vector3(b,0,0)]});
  const s=flowSegments([route('a','one','two',0,3),route('b','two','three',5,8)],{process_path_id:'gap',name:'gap',connection_ids:['a','b'],ordered_asset_ids:['one','two','three']});const gaps=s.filter(s=>s.kind==='gap');expect(gaps.length).toBeGreaterThan(1);expect(gaps[0].start.toArray()).toEqual([3,0,0]);expect(gaps.at(-1)!.end.toArray()).toEqual([5,0,0]);expect(gaps.some(g=>g.end.y>0)).toBe(true);expect(s.filter(s=>s.kind==='pipe').length).toBe(2);
 });
});
