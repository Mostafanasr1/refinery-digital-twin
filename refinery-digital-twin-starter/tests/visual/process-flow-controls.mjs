import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,root} from '../../scripts/visual-common.mjs';
import {openLook,switchLook} from './look-common.mjs';
const run=await openRun(),results=[];run.url+='&animate=1&captureCycle=1';
const state=()=>run.page.evaluate(()=>({flow:window.__refineryFlow?.(),tint:window.__refineryPipeTint()}));
try{
 for(const look of ['engineering','photoreal']){
  await openLook(run,look);await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');
  await run.page.getByRole('button',{name:'Pause',exact:true}).click();await run.page.waitForTimeout(100);const frozen=await state();await run.page.waitForTimeout(250);assert.equal((await state()).flow.phase,frozen.flow.phase);
  await run.page.getByRole('checkbox',{name:'Motion',exact:true}).uncheck();
  await run.page.getByLabel('Process path',{exact:true}).selectOption('path_standby');await run.page.waitForTimeout(200);const standby=await state();assert.equal(standby.flow.phase,0);assert.equal(standby.flow.pathId,'path_standby');assert.ok(standby.tint.every(s=>Boolean(s.active)===standby.flow.connections.includes(s.id)));
  await switchLook(run.page,look==='engineering'?'photoreal':'engineering');assert.equal((await state()).flow.phase,0);
  await run.page.getByLabel('Process path',{exact:true}).selectOption('');await run.page.waitForTimeout(100);assert.ok((await state()).tint.every(s=>s.active===0));
  // Restore the chosen look before scenario assertions.
  await switchLook(run.page,look);await run.page.getByLabel('Scenario',{exact:true}).selectOption('scenario_p101_trip');
  await run.page.getByRole('checkbox',{name:'Motion',exact:true}).check();
  await run.page.getByRole('button',{name:'Play',exact:true}).click();await run.page.waitForTimeout(600);const trip=await state();await run.page.waitForTimeout(400);assert.equal((await state()).flow.phase,trip.flow.phase);
  await run.page.waitForFunction(()=>window.__refineryFlow?.().pathId==='path_standby');const recovered=await state();await run.page.waitForTimeout(400);assert.notEqual((await state()).flow.phase,recovered.flow.phase);results.push({look,paused:frozen,standby,trip,recovered});
 }
 assert.deepEqual(run.errors,[]);await writeFile(resolve(root,'docs/handbacks/evidence/stageC-task-04/control-check.json'),JSON.stringify({results,errors:run.errors},null,2));console.log('PASS: paused path changes, tint reset, frozen look switch, trip/standby recovery.');
}finally{await run.close();}
