import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
const run=await openRun(),states=[];run.url+='&captureCycle=1';
try{for(const look of ['engineering','photoreal','photoreal-night']){
 await openLook(run,look);await run.page.evaluate(()=>window.__refineryMotion.setMotion(false));
 await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');await run.page.getByRole('button',{name:'Pause',exact:true}).click();
 for(const index of [1,5]){await camera(run.page,config.cameras[index]);const state=await run.page.evaluate(()=>({flow:window.__refineryFlow(),motion:window.__refineryMotion.read()}));assert.equal(state.flow.phase,0);assert.equal(state.motion.time,2);states.push({look,camera:config.cameras[index].id,...state});await run.page.screenshot({path:resolve(root,`docs/handbacks/evidence/stageC-task-04/${config.cameras[index].id}-${look}-flow.png`)});}
}assert.deepEqual(run.errors,[]);await writeFile(resolve(root,'docs/handbacks/evidence/stageC-task-04/frozen-captures.json'),JSON.stringify({protocol:'Original screenshot flags, motion time 2, phase 0, master disabled and path paused; fixed cameras.',states},null,2));}finally{await run.close();}
