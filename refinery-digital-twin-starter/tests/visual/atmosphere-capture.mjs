import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook,switchLook,snapshot,plantIdentity} from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageB-task-06',process.argv.includes('--correction')?'correction':'.');await mkdir(output,{recursive:true});
const preview=process.argv.includes('--preview');
const run=await openRun();
const knownWarnings=[];
run.page.on('console',message=>{if(message.type()==='error'){
 const detail=message.text()+" "+JSON.stringify(message.location());
 if(message.location().url?.endsWith('/favicon.ico') && message.text().includes('404')) knownWarnings.push(detail);
 else run.errors.push(detail);
}});
const captures=[];
try {
 const originalUrl=run.url;
 for(const tone of preview?['aces']:['aces','agx']) {
  run.url=originalUrl+'&tone='+tone;
  for(const look of ['photoreal','photoreal-night']) {
   await openLook(run,look);
   assert.equal(await run.page.locator('canvas').getAttribute('data-tone-mapping'),tone,'requested tone mapping must reach the renderer');
   for(const spec of preview?[config.cameras[5]]:config.cameras) {
    await camera(run.page,spec);const name=`${spec.id}-${look}-${tone}.png`;
    await run.page.screenshot({path:resolve(output,name)});captures.push(name);
   }
  }
 }
 const before=await snapshot(run.page);
 await switchLook(run.page,'engineering');const engineering=await snapshot(run.page);
 assert.deepEqual(plantIdentity(engineering),plantIdentity(before));
 await switchLook(run.page,'photoreal-night');const after=await snapshot(run.page);
 assert.deepEqual(plantIdentity(after),plantIdentity(before));assert.deepEqual(after.registryIds,before.registryIds);
 assert.deepEqual(run.errors,[]);
 await writeFile(resolve(output,preview?'preview.json':'atmosphere-flow.json'),JSON.stringify({captures,nightUrl:'PASS',dayNightEngineeringIdentity:'PASS',knownWarnings,errors:run.errors},null,2)+'\n');
 console.log(JSON.stringify({captures,errors:run.errors}));
}finally{await run.close();}
