import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook, snapshot, plantIdentity } from './look-common.mjs';
const output=resolve(root,'docs/handbacks/evidence/stageC-task-02');
const run=await openRun(), checks=[];
run.page.on('console',m=>{if(m.type()==='error' && !m.location().url?.endsWith('/favicon.ico'))run.errors.push(m.text());});
try {
  await openLook(run,'engineering'); const original=await snapshot(run.page);
  assert.equal(original.dressing.visible,false);
  await switchLook(run.page,'photoreal'); await camera(run.page,config.cameras[5]);
  const photo=await snapshot(run.page);
  assert.equal(photo.dressing.visible,true); assert.ok(photo.dressing.modules>10);
  assert.deepEqual(plantIdentity(photo),plantIdentity(original));
  assert.deepEqual(photo.registryIds,original.registryIds);
  assert.equal(photo.optionalDetail.assetIds.length,57);
  await run.page.getByLabel('Dressing',{exact:true}).uncheck();
  assert.equal((await snapshot(run.page)).dressing.visible,false);
  await run.page.screenshot({path:resolve(output,'CAM-6-dressing-off.png')});
  await run.page.getByLabel('Dressing',{exact:true}).check();
  assert.equal((await snapshot(run.page)).dressing.visible,true);
  await switchLook(run.page,'engineering');
  assert.equal((await snapshot(run.page)).dressing.visible,false);
  assert.equal(await run.page.evaluate(()=>window.__refineryDetailHits()),0);
  await switchLook(run.page,'photoreal');
  assert.ok(await run.page.evaluate(()=>window.__refineryDetailHits())>0);
  checks.push({name:'Dressing on/off/restored; registry/base identity unchanged; hidden optional raycasting disabled',modules:photo.dressing.modules});
  for(const viewport of [{width:390,height:844},{width:844,height:390}]) {
    await run.page.setViewportSize(viewport); await camera(run.page,config.cameras[5]);
    const layout=await run.page.locator('.time-controls').evaluate(el=>{
      const bounds=el.getBoundingClientRect();
      const items=[...el.querySelectorAll('input,button')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
      return {within:items.every(r=>r.x>=0 && r.right<=innerWidth && r.y>=0 && r.bottom<=innerHeight),overflow:el.scrollWidth>el.clientWidth+1,height:bounds.height};
    });
    assert.equal(layout.within,true); assert.equal(layout.overflow,false,'time/dressing toolbar must fit');
    await run.page.screenshot({path:resolve(output,`mobile-${viewport.width}.png`)});
    checks.push({viewport,layout});
  }
  assert.deepEqual(run.errors,[]);
  await writeFile(resolve(output,'slice-check.json'),JSON.stringify({checks,errors:run.errors},null,2));
} finally {await run.close();}
