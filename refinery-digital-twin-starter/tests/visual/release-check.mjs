import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook,switchLook,snapshot,plantIdentity} from './look-common.mjs';
const browserName=process.argv.find(a=>a.startsWith('--browser='))?.split('=')[1];
assert.ok(['chrome','edge'].includes(browserName));
process.env.VISUAL_BROWSER_PATH=browserName==='chrome'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const expectedMain=process.argv.find(a=>a.startsWith('--main='))?.split('=')[1];
const expectedPreview=process.argv.find(a=>a.startsWith('--preview='))?.split('=')[1];
assert.match(expectedMain??'',/^[a-f0-9]{40}$/);assert.match(expectedPreview??'',/^[a-f0-9]{40}$/);
const base='https://mostafanasr1.github.io/refinery-digital-twin/';
const output=resolve(root,'docs/handbacks/evidence/stageB-task-09',browserName);await mkdir(output,{recursive:true});
const run=await openRun();const requests=[],knownWarnings=[];let hardware;const checks=[];
run.page.on('request',request=>requests.push(request.url()));
run.page.on('console',message=>{if(message.type()==='error'){if(message.location().url?.endsWith('/favicon.ico'))knownWarnings.push(message.text());else run.errors.push(message.text());}});
try{
 for(const [suffix,branch,commit] of [['','main',expectedMain],['next/','dual-look',expectedPreview]]){
  const response=await run.page.request.get(base+suffix+'deploy.json');assert.equal(response.status(),200);
  assert.deepEqual(await response.json(),{branch,commit});checks.push(`${suffix||'/'} provenance ${branch}@${commit}`);
 }
 run.url=base+'?measure=1';hardware=await openLook(run,'engineering');
 const initialRequests=[...requests];
 assert.ok(!initialRequests.some(url=>/\/assets\/(env|materials|detail)\//.test(url)),'Engineering first load must not request photoreal packs');
 const initialBytes=await run.page.evaluate(()=>[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].filter(e=>e.responseEnd<=window.__refineryVisual.interactiveAt).reduce((total,e)=>total+e.transferSize,0));
 assert.ok(initialBytes>0 && initialBytes<=13200115,`Initial transfer ${initialBytes} must meet budget`);
 assert.match(await run.page.locator('footer').innerText(),/57 assets bound \/ 6 units/);
 for(const look of ['engineering','photoreal','photoreal-night']){
  if(look!=='engineering')await switchLook(run.page,look);
  for(const spec of config.cameras){await camera(run.page,spec);await run.page.screenshot({path:resolve(output,`${spec.id}-${look}.png`)});}
 }
 await run.page.getByRole('button',{name:'T-201 Atmospheric Distillation Column',exact:true}).click();
 await camera(run.page,config.cameras[2]);const before=await snapshot(run.page),card=await run.page.locator('.card').innerText();
 await switchLook(run.page,'engineering');const after=await snapshot(run.page);
 assert.deepEqual(plantIdentity(after),plantIdentity(before));assert.deepEqual(after.camera,before.camera);assert.equal(await run.page.locator('.card').innerText(),card);
 await run.page.getByRole('combobox',{name:'Geometry',exact:true}).selectOption('proxy');
 assert.equal(await run.page.locator('.card').innerText(),card);
 await switchLook(run.page,'photoreal');assert.equal(await run.page.locator('.card').innerText(),card);
 checks.push('Release: all 18 default camera captures; selection/card/camera/identity continuity and proxy mode PASS');
 checks.push(`Engineering initial ${initialBytes} bytes; no environment/material/detail requests before first switch`);
 run.url=base+'next/?measure=1';await openLook(run,'engineering');
 assert.match(await run.page.locator('footer').innerText(),/57 assets bound \/ 6 units/);await switchLook(run.page,'photoreal');await camera(run.page,config.cameras[5]);await run.page.screenshot({path:resolve(output,'next-CAM-6-photoreal.png')});checks.push('/next/ engineering and photoreal PASS');
 assert.deepEqual(run.errors,[]);
 await writeFile(resolve(output,'verification.json'),JSON.stringify({url:base,browserName,hardware,checks,initialBytes,knownWarnings,errors:run.errors,phone:'Not tested; Mostafa Samsung A35 Chrome pending'},null,2)+'\n');
 console.log(JSON.stringify({browserName,checks,errors:run.errors}));
}finally{await run.close();}
