import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,root,camera,config} from '../../scripts/visual-common.mjs';
import {openLook,switchLook} from './look-common.mjs';
const expected=process.argv.find(a=>a.startsWith('--commit='))?.split('=')[1];assert.match(expected??'',/^[a-f0-9]{40}$/);
const base='https://mostafanasr1.github.io/refinery-digital-twin/';
const output=resolve(root,'docs/handbacks/evidence/stageC-task-04-correction/live');await mkdir(output,{recursive:true});
for(const [name,exe] of [['chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'],['edge','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']]){
 process.env.VISUAL_BROWSER_PATH=exe;const run=await openRun();
 try{
  const release=await(await run.page.request.get(base+'deploy.json')).json();assert.deepEqual(release,{branch:'main',commit:expected});
  const preview=await(await run.page.request.get(base+'next/deploy.json')).json();assert.deepEqual(preview,{branch:'dual-look',commit:expected});
  run.url=base+'?measure=1';const hardware=await openLook(run,'engineering');
  assert.match(await run.page.locator('footer').innerText(),/57 assets bound/);
  await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');await camera(run.page,config.cameras[5]);
  for(const look of ['engineering','photoreal','photoreal-night']){
   if(look!=='engineering')await switchLook(run.page,look);
   for(const style of ['pipes','arcs']){
    await run.page.getByLabel('Flow',{exact:true}).selectOption(style);
    await run.page.waitForFunction(s=>window.__refineryFlow?.().style===s,style);
    const snapshot=await run.page.evaluate(()=>window.__refineryFlow());assert.equal(snapshot.drawBatches,1);assert.ok(snapshot.segments.every(s=>s.kind===(style==='pipes'?'pipe':'arc')));
    assert.equal(new URL(run.page.url()).searchParams.get('flow'),style);
    await run.page.screenshot({path:resolve(output,`${name}-CAM-6-${look}-${style}.png`)});
   }
  }
  await run.page.reload({waitUntil:'networkidle'});await run.page.getByLabel('Process path',{exact:true}).selectOption('path_crude_to_products');await run.page.waitForFunction(()=>window.__refineryFlow?.().style==='arcs');
  assert.deepEqual(run.errors,[]);
  await writeFile(resolve(output,name+'.json'),JSON.stringify({status:'PASS',hardware,release,preview,checks:['root released commit','preview retained','57 bound assets','Pipes and Arcs actual geometry in both looks','URL and reload'],phone:'Pending Mostafa physical-phone report',errors:run.errors},null,2));
  console.log(name+' PASS');
 }finally{await run.close()}
}
