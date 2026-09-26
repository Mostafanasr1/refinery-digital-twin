import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {openRun,root,camera,config} from '../../scripts/visual-common.mjs';import {openLook,switchLook} from './look-common.mjs';
const run=await openRun(),output=resolve(root,'docs/handbacks/evidence/stageC-task-04-correction'),states=[];
run.page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))run.errors.push(m.text());});
try{for(const look of ['engineering','photoreal','photoreal-night']){
 await openLook(run,look);await run.page.evaluate(()=>window.__refineryMotion.setMotion(false));
 await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');await run.page.getByRole('button',{name:'Pause',exact:true}).click();
 assert.equal(await run.page.getByLabel('Flow',{exact:true}).inputValue(),'pipes');
 for(const style of ['arcs','pipes']){
  await run.page.getByLabel('Flow',{exact:true}).selectOption(style);await run.page.waitForFunction(style=>window.__refineryFlow?.().style===style,style);
  const state=await run.page.evaluate(()=>window.__refineryFlow());assert.equal(state.drawBatches,1);assert.equal(state.phase,0);assert.ok(state.segments.every(s=>s.kind===(style==='arcs'?'arc':'pipe')));assert.equal(new URL(run.page.url()).searchParams.get('flow'),style);states.push({look,...state});
  for(const index of [1,5]){await camera(run.page,config.cameras[index]);await run.page.screenshot({path:resolve(output,`${config.cameras[index].id}-${look}-${style}.png`)});}
 }
 if(look!=='engineering')await run.page.evaluate(()=>window.__refineryMotion.setHour(18.25));
 await run.page.goBack();await run.page.waitForFunction(()=>window.__refineryFlow?.().style==='arcs');
 if(look!=='engineering')assert.equal(await run.page.evaluate(()=>window.__refineryMotion.read().hour),18.25);
 await run.page.goForward();await run.page.waitForFunction(()=>window.__refineryFlow?.().style==='pipes');
 await run.page.getByLabel('Flow',{exact:true}).selectOption('arcs');await run.page.reload({waitUntil:'networkidle'});await run.page.waitForFunction(()=>window.__refineryLoading?.snapshot().phase==='done');
 await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');assert.equal(await run.page.getByLabel('Flow',{exact:true}).inputValue(),'arcs');
 await switchLook(run.page,look==='engineering'?'photoreal':'engineering');assert.equal(await run.page.getByLabel('Flow',{exact:true}).inputValue(),'arcs');
}
await openLook(run,'photoreal');await run.page.getByRole('button',{name:'Follow the process',exact:false}).click();await run.page.waitForFunction(()=>document.querySelector('main').dataset.presentation==='tour');
await run.page.getByLabel('Flow',{exact:true}).selectOption('arcs');await run.page.waitForFunction(()=>window.__refineryFlow?.().style==='arcs');assert.equal(await run.page.locator('main').getAttribute('data-presentation'),'tour');
await run.page.getByLabel('Flow',{exact:true}).selectOption('pipes');await run.page.waitForFunction(()=>window.__refineryFlow?.().style==='pipes');assert.equal(await run.page.locator('main').getAttribute('data-presentation'),'tour');
await run.page.getByRole('button',{name:'End presentation',exact:true}).click();
for(const viewport of [{width:412,height:915},{width:915,height:412},{width:360,height:640}]){
 await run.page.setViewportSize(viewport);await run.page.getByRole('button',{name:'Controls',exact:true}).click();
 await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');await run.page.getByLabel('Flow',{exact:true}).selectOption('arcs');
 assert.equal(await run.page.getByLabel('Flow',{exact:true}).inputValue(),'arcs');
 assert.equal(await run.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
 await run.page.screenshot({path:resolve(output,`mobile-flow-${viewport.width}x${viewport.height}.png`)});
 await run.page.getByRole('button',{name:'Controls',exact:true}).click();
}
assert.deepEqual(run.errors,[]);await writeFile(resolve(output,'flow-style-check.json'),JSON.stringify({states,checks:['default pipes','URL back/forward/reload','both looks preserve style','frozen style changes','one batch either style','tour continues through both style switches'],errors:run.errors},null,2));console.log('PASS flow styles and URL state');
}finally{await run.close();}
