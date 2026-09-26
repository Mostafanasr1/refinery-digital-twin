import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
import {readMeasurementState,measurementValidity} from '../../scripts/measurement-validity.mjs';
const paths=JSON.parse(await readFile(resolve(root,'data/normalized/process_paths.json'),'utf8')),results=[];
const output=resolve(root,'docs/metrics/stageC-task-04-active.json');
const quantile=(v,q)=>v.toSorted((a,b)=>a-b)[Math.ceil(v.length*q)-1];
for(const look of ['engineering','photoreal','photoreal-night'])for(const index of [1,5])for(const path of look==='photoreal-night'?paths:[paths[0]]){
 const displayState=readMeasurementState(),refreshHz=displayState.displays.find(d=>d.primary)?.refreshHz;
 const validity=measurementValidity({fpsMedian:0,previousFps:0,refreshHz,state:displayState,uncapped:true});assert.ok(validity.valid,JSON.stringify(validity));
 const run=await openRun({metrics:true});run.url+='&animate=1&captureCycle=1';
 try{
  const hardware=await openLook(run,look);await run.page.getByLabel('Process path',{exact:true}).selectOption(path.process_path_id);await camera(run.page,config.cameras[index]);
  const samples=await run.page.evaluate(()=>new Promise(resolve=>{const samples=[],start=performance.now();let last=start;const tick=now=>{if(now-start>3000)samples.push({ms:now-last,calls:window.__refineryBudgetSnapshot().total});last=now;if(now-start>=13000)resolve(samples);else requestAnimationFrame(tick);};requestAnimationFrame(tick);}));
  const medianMs=quantile(samples.map(s=>s.ms),.5),p95Ms=quantile(samples.map(s=>s.ms),.95),callsMax=Math.max(...samples.map(s=>s.calls));
  const pass=medianMs<=(look==='engineering'?1000/60:25)&&p95Ms<=(look==='engineering'?20:25)&&callsMax<=(look==='engineering'?150:200);
  const result={look,camera:config.cameras[index].id,path:path.process_path_id,hardware,displayState,validity,medianMs,p95Ms,callsMax,callsMean:samples.reduce((n,s)=>n+s.calls,0)/samples.length,derivedFps:1000/medianMs,pass,samples};results.push(result);
  await writeFile(output,JSON.stringify({method:'Fixed camera active motion/path; 3s warmup,10s sample; uncapped flags',results},null,2));console.log(JSON.stringify({...result,samples:undefined}));assert.deepEqual(run.errors,[]);assert.ok(pass,'HARD STOP: active-path budget missed');
 }finally{await run.close();}
}
async function bytes(path){let total=0;for(const e of await readdir(path,{withFileTypes:true})){const p=resolve(path,e.name);total+=e.isDirectory()?await bytes(p):(await stat(p)).size;}return total;}
const lazyBytes=await bytes(resolve(root,'app/dist/assets/env'))+await bytes(resolve(root,'app/dist/assets/materials'))+await bytes(resolve(root,'app/dist/assets/detail'));
await writeFile(output,JSON.stringify({method:'Fixed camera active motion/path; 3s warmup,10s sample; uncapped flags',lazyBytes,results},null,2));assert.ok(lazyBytes<=80000000);
