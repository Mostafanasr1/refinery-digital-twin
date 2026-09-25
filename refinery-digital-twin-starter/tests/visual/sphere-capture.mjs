import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageB-task-05b');
await mkdir(output,{recursive:true});
const run=await openRun();
try {
 for(const look of ['engineering','photoreal','photoreal-night']) {
  await openLook(run,look);await camera(run.page,config.cameras[5]);
  await run.page.screenshot({path:resolve(output,`CAM-6-${look}.png`)});
 }
 assert.deepEqual(run.errors,[]);
 await writeFile(resolve(output,'captures.json'),JSON.stringify({camera:'CAM-6',looks:['engineering','photoreal','photoreal-night'],errors:run.errors},null,2)+'\n');
}finally{await run.close();}
