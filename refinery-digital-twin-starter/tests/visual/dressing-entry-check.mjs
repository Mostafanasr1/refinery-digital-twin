import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,root} from '../../scripts/visual-common.mjs';
import {openLook,switchLook,snapshot} from './look-common.mjs';
const run=await openRun();const checks=[];
try{
 await openLook(run,'photoreal');
 for(const look of ['engineering','photoreal']) {await switchLook(run.page,look);await run.page.waitForFunction(()=>window.__refineryLookSnapshot().sourced.visible.length===6);assert.ok(Object.values((await snapshot(run.page)).canonicalVisibility).every(Boolean));}
 checks.push('Direct photoreal entry -> engineering -> photoreal retains all canonical assets and six sourced batches');
 // Production initializes Blender by default. Switch to proxy while first-load geometry is parsing.
 await run.page.goto(run.url,{waitUntil:'domcontentloaded'});
 await run.page.waitForFunction(()=>document.querySelector('select[aria-label="Geometry"]'));
 await run.page.getByRole('combobox',{name:'Geometry',exact:true}).evaluate(el=>{el.value='proxy';el.dispatchEvent(new Event('change',{bubbles:true}));});
 await run.page.waitForFunction(()=>window.__refineryLoading.snapshot().phase==='done');
 assert.equal(await run.page.getByRole('combobox',{name:'Geometry',exact:true}).inputValue(),'proxy');
 assert.ok(Object.values((await snapshot(run.page)).canonicalVisibility).every(Boolean));
 checks.push('Initial proxy draw completes with sourced engineering dressing');
 assert.deepEqual(run.errors,[]);await writeFile(resolve(root,'docs/handbacks/evidence/stageC-task-03/correction/entry-check.json'),JSON.stringify({checks,errors:run.errors},null,2));
}finally{await run.close();}
