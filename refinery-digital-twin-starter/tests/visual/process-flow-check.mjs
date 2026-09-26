import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,root,camera,config,captureEngineering} from '../../scripts/visual-common.mjs';
import {openLook,snapshot} from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageC-task-04');await mkdir(output,{recursive:true});
const paths=JSON.parse(await readFile(resolve(root,'data/normalized/process_paths.json'),'utf8'));
const run=await openRun(),states=[],flows=[];
run.page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))run.errors.push(m.text());});
const flow=()=>run.page.evaluate(()=>window.__refineryFlow?.());
try{
 const hardware=await captureEngineering(run,resolve(output,'engineering-candidate'));
 run.url+='&animate=1&captureCycle=1';
 for(const look of ['engineering','photoreal','photoreal-night']){
  await openLook(run,look);
  for(const geometry of ['blender','proxy']){
   await run.page.getByLabel('Geometry',{exact:true}).selectOption(geometry);
   const s=await snapshot(run.page);assert.equal(Object.keys(s.canonicalVisibility).length,57);assert.ok(Object.values(s.canonicalVisibility).every(Boolean));states.push({look,geometry,visibility:s.canonicalVisibility});
  }
  await run.page.getByLabel('Geometry',{exact:true}).selectOption('blender');
  for(const path of paths){
   await run.page.getByLabel('Process path',{exact:true}).selectOption(path.process_path_id);
   await run.page.waitForFunction(id=>window.__refineryFlow?.().pathId===id,path.process_path_id);
   const s=await flow();assert.equal(s.drawBatches,1);assert.equal(s.depthTest,true);assert.ok(s.instances>0);assert.ok(s.segments.every(s=>s.kind==='pipe'));assert.deepEqual(s.connections,path.connection_ids);flows.push({look,...s});
  }
  await run.page.getByLabel('Process path',{exact:true}).selectOption(paths[0].process_path_id);
  for(const index of [1,5]){await camera(run.page,config.cameras[index]);await run.page.screenshot({path:resolve(output,`${config.cameras[index].id}-${look}-flow-live.png`)});}
  const a=await flow();await run.page.waitForTimeout(350);assert.notEqual((await flow()).phase,a.phase);
  await run.page.getByRole('checkbox',{name:'Motion',exact:true}).uncheck();await run.page.waitForTimeout(120);const frozen=await flow();await run.page.waitForTimeout(250);assert.equal((await flow()).phase,frozen.phase);
  await run.page.getByRole('checkbox',{name:'Motion',exact:true}).check();
  await run.page.getByLabel('Process path',{exact:true}).selectOption('');await run.page.waitForFunction(()=>!window.__refineryFlow);
 }
 assert.deepEqual(run.errors,[]);
 await writeFile(resolve(output,'process-flow-check.json'),JSON.stringify({hardware,states,flows,errors:run.errors},null,2));
 console.log('PASS: 57 canonical assets x 6 modes; all paths use physical pipes; 1 flow batch; motion freeze/resume; separate candidate captures.');
}finally{await run.close();}
