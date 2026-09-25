import { expect, it } from 'vitest';
import { interpolatePose, type CameraMove } from './presentation';
it('camera actions clamp endpoints and interpolate position and target with easing', () => {
 const move: CameraMove = {from:{position:[0,0,0],target:[1,2,3]},to:{position:[10,20,30],target:[3,4,5]},startedAt:1000,duration:2,easing:'smoothstep'};
 expect(interpolatePose(move,0)).toEqual(move.from);
 expect(interpolatePose(move,4000)).toEqual(move.to);
 expect(interpolatePose(move,2000)).toEqual({position:[5,10,15],target:[2,3,4]});
 expect(interpolatePose(move,1500).position[0]).toBeLessThan(2.5);
});
import config from '../../data/presentation/tours.json';
import assets from '../../data/normalized/assets.json';
import paths from '../../data/normalized/process_paths.json';
it('presentation actions stay within their timeline and reference the canonical path without editing it', () => {
 const tour = config.tours[0];
 const moves = tour.actions.filter(action => action.type === 'camera_move');
 expect(moves.map(move => move.assetId)).toEqual(paths.find(path => path.process_path_id === tour.processPathId)?.ordered_asset_ids);
 for (const action of tour.actions) {
  expect(action.at).toBeGreaterThanOrEqual(0);
  expect(action.duration).toBeGreaterThan(0);
  expect(action.at + action.duration).toBeLessThanOrEqual(tour.duration);
 }
 for (const move of moves) expect(assets.some(asset => asset.asset_id === move.assetId)).toBe(true);
 expect(config.attractCameras).toHaveLength(5);
 expect(config.idleSeconds).toBe(60);
});
