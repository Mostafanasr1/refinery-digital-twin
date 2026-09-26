import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, root, camera, config, captureEngineering } from '../../scripts/visual-common.mjs';
import { openLook, snapshot } from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageC-task-03/correction');await mkdir(output,{recursive:true});
const run=await openRun();const states=[];
run.page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))run.errors.push(m.text());});
try {
 const hardware=await captureEngineering(run,resolve(output,'engineering-candidate'));
 for(const look of ['engineering','photoreal','photoreal-night']) {
  await openLook(run,look);
  for(const geometry of ['blender','proxy']) {
   await run.page.getByRole('combobox',{name:'Geometry',exact:true}).selectOption(geometry);
   const state=await snapshot(run.page);assert.equal(Object.keys(state.canonicalVisibility).length,57);assert.ok(Object.values(state.canonicalVisibility).every(Boolean));
   assert.equal(state.dressing.visible,true);assert.equal(state.sourced.visible.length,6);
   states.push({look,geometry,visibility:state.canonicalVisibility});
  }
  await run.page.getByRole('combobox',{name:'Geometry',exact:true}).selectOption('blender');
  await camera(run.page,config.cameras[5]);await run.page.screenshot({path:resolve(output,`CAM-6-${look}.png`)});
  await run.page.getByLabel('Dressing',{exact:true}).uncheck();const hidden=await snapshot(run.page);assert.equal(hidden.dressing.visible,false);assert.deepEqual(hidden.sourced.visible,[]);
  await run.page.getByLabel('Dressing',{exact:true}).check();
 }
 const diff=states.flatMap(s=>Object.keys(s.visibility).filter(id=>s.visibility[id]!==states[0].visibility[id]).map(id=>({look:s.look,geometry:s.geometry,id})));
 assert.deepEqual(diff,[]);
 await openLook(run,'photoreal');
 const actors=await run.page.evaluate(()=>window.__refineryMotionActors());
 assert.ok(-actors.vehicles[0][0]>.999,'Pickup source -X nose must face +X along first road');
 assert.ok(-actors.vehicles[1][0]<-.999,'Tanker source -X nose must face -X along opposite road');
 await camera(run.page,{position:[-1,8,52],target:[-9,1,37]});await run.page.screenshot({path:resolve(output,'pickup-forward.png')});
 await camera(run.page,{position:[255,8,-121],target:[245,1,-136.8]});await run.page.screenshot({path:resolve(output,'tanker-forward.png')});
 assert.deepEqual(run.errors,[]);
 await writeFile(resolve(output,'visibility-diff.json'),JSON.stringify({hardware,meaning:'Enabled base canonical geometry in the scene graph, not pixel occlusion. Optional hero detail is excluded.',states,differences:diff,vehicleForwardMatrices:actors.vehicles,errors:run.errors},null,2));
}finally{await run.close();}
