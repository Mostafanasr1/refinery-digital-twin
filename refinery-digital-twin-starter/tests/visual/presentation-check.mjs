import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root,captureEngineering} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageB-task-08');await mkdir(output,{recursive:true});
const tourConfig=JSON.parse(await readFile(resolve(root,'data/presentation/tours.json'),'utf8'));
const attract=process.argv.includes('--attract'), captures=process.argv.includes('--captures');
const run=await openRun(captures?{}:{videoDir:resolve(root,'tests/visual/output/task08-video')});
const video=run.page.video(), checks=[];let hardware;
run.page.on('console',m=>{if(m.type()==='error' && !m.location().url?.endsWith('/favicon.ico'))run.errors.push(m.text());});
try {
 if(captures){
  hardware=await captureEngineering(run,resolve(output,'engineering-candidate'));
  await writeFile(resolve(output,'engineering-candidate/capture.json'),JSON.stringify({...hardware,config,status:'candidate awaiting Task 8 external approval'},null,2)+'\n');
  for(const look of ['photoreal','photoreal-night']){
   await openLook(run,look);
   for(const variant of ['default','selected']){
    if(variant==='selected')await run.page.getByRole('button',{name:'T-201 Atmospheric Distillation Column',exact:true}).click();
    await run.page.mouse.move(1590,890);
    for(const spec of config.cameras){await camera(run.page,spec);await run.page.screenshot({path:resolve(output,`${spec.id}-${look}-${variant}.png`)});}
   }
  }
  checks.push('All six cameras in engineering/day/night, default and selected; engineering candidate only');
 }else if(attract){
  hardware=await openLook(run,'engineering');await run.page.mouse.move(1590,890);
  const started=Date.now();
  await run.page.waitForFunction(()=>document.querySelector('main').dataset.presentation==='attract',null,{timeout:70000});
  checks.push('Attract entered after the real 60-second idle threshold');
  for(let leg=0;leg<5;leg++){
   await run.page.waitForTimeout(leg?20000:1000);
   const actual=await run.page.locator('main').getAttribute('data-look');
   assert.equal(actual,leg%2?'photoreal':'engineering');
   checks.push(`Attract leg ${leg+1}: ${actual}`);
  }
  await run.page.waitForTimeout(19000);
  await run.page.mouse.move(1000,750);
  assert.equal(await run.page.locator('main').getAttribute('data-presentation'),'idle');
  checks.push('Pointer input immediately returned control');
  await run.page.screenshot({path:resolve(output,'attract-exit.png')});
  void started;
 }else{
  for(const look of ['engineering','photoreal']){
   hardware=await openLook(run,look);
   await run.page.getByRole('button',{name:'Follow the process',exact:false}).click();
   await run.page.waitForFunction(()=>document.querySelector('main').dataset.presentation==='tour');
   const visited=[];
   for(let i=0;i<7;i++){
    await run.page.waitForTimeout(i?6000:500);
    visited.push(await run.page.locator('.card h2').textContent());
    assert.equal(await run.page.locator('.tour-caption p').textContent(),tourConfig.tours[0].actions.filter(a=>a.type==='caption')[i].text);
   }
   assert.deepEqual(visited,['TK-101','P-101A','E-201','F-201','T-201','E-205','TK-301']);
   await run.page.waitForFunction(()=>document.querySelector('main').dataset.tourComplete==='true',null,{timeout:10000});
   assert.equal(await run.page.locator('main').getAttribute('data-look'),look);
   checks.push(`${look}: all seven path assets/captions and tour completion; look retained`);
  }
  await openLook(run,'engineering');
  await run.page.getByLabel('Reveal photoreal during tour').check();
  await run.page.getByRole('button',{name:'Follow the process',exact:false}).click();
  await run.page.waitForFunction(()=>document.querySelector('main').dataset.look==='photoreal',null,{timeout:25000});
  checks.push('Optional reveal switches to photoreal at the configured point');
  await run.page.getByRole('button',{name:'Reset view',exact:true}).click();
  assert.equal(await run.page.locator('main').getAttribute('data-presentation'),'idle');checks.push('Reset interrupts tour');
  await run.page.getByRole('button',{name:'Follow the process',exact:false}).click();
  await run.page.waitForTimeout(300);
  await run.page.getByRole('button',{name:'F-201 Crude Fired Heater',exact:true}).click();
  assert.equal(await run.page.locator('main').getAttribute('data-presentation'),'idle');
  assert.equal(await run.page.locator('.card h2').textContent(),'F-201');checks.push('Directory selection interrupts tour and retains chosen card');
 }
 assert.deepEqual(run.errors,[]);
}finally{await run.close();}
await writeFile(resolve(output,`${captures?'captures':attract?'attract':'tour'}-verification.json`),JSON.stringify({hardware,checks,errors:run.errors,video:video?await video.path():null},null,2)+'\n');
console.log(checks);
