import {openRun,root} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const test=process.argv.includes('--probe'),frames=test?12:2533,output=resolve(root,'docs/handbacks/evidence/stageC-task-04'),folder=resolve(root,'tests/visual/output/stageC-task-04/frames');await mkdir(folder,{recursive:true});
const tour=JSON.parse(await readFile(resolve(root,'data/presentation/tours.json'),'utf8')).tours[0];
const run=await openRun();run.url+='&animate=1&captureCycle=1';
try{
 const hardware=await openLook(run,'photoreal');const epoch=Date.parse('2026-09-24T12:00:00Z');
 await run.page.clock.install({time:epoch});await run.page.clock.pauseAt(epoch+1000);await run.page.clock.runFor(100);
 await run.page.evaluate(()=>{window.__refineryMotion.setTime(2);document.querySelector('.start-tour').click();});
 const start=await run.page.evaluate(()=>performance.now()),captions=[],states=[];let lastCaption='';
 for(let i=0;i<frames;i++){
  if(i)await run.page.clock.runFor(Math.round(i*1000/60)-Math.round((i-1)*1000/60));
  // Flush React updates after the virtual animation frame, then take the real rendered image.
  const s=await run.page.evaluate(()=>({time:performance.now(),caption:document.querySelector('.tour-caption')?.textContent,phase:window.__refineryFlow?.().phase,path:window.__refineryFlow?.().pathId,complete:document.querySelector('main').dataset.tourComplete}));
  if(s.caption&&s.caption!==lastCaption){captions.push({frame:i,time:s.time-start,text:s.caption});lastCaption=s.caption;}
  if(i%60===0||i===frames-1)states.push({frame:i,...s});
  await run.page.screenshot({path:resolve(folder,`frame-${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:95,timeout:30000});
  if(i%120===0)console.log(`Captured ${i}/${frames-1}, virtual ${(s.time-start)/1000}s, phase ${s.phase}`);
 }
 assert.deepEqual(run.errors,[]);
 if(test){console.log(JSON.stringify({start,states,captions}));}else{
 assert.equal(states.at(-1).time-start,42200);assert.equal(states.at(-1).complete,'true');
 for(const action of tour.actions.filter(a=>a.type==='caption'))assert.ok(captions.some(c=>c.text.includes(action.text)),action.text);
 assert.ok(states.filter(s=>s.time-start<42000).every(s=>s.path===tour.processPathId));
 const file=resolve(output,'full-tour-review.mp4');execFileSync('C:/ffmpeg/bin/ffmpeg.exe',['-hide_banner','-y','-framerate','60','-i',resolve(folder,'frame-%05d.jpg'),'-frames:v',String(frames),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',file],{stdio:'inherit'});
 const encoded=JSON.parse(execFileSync('C:/ffmpeg/bin/ffprobe.exe',['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames','-show_entries','format=duration,size,bit_rate','-of','json',file],{encoding:'utf8'}));
 await writeFile(resolve(output,'video-recording.json'),JSON.stringify({hardware,method:'Frame-by-frame at 60 virtual time samples per second; Playwright clock used only for offline review capture, never metrics. Full viewport includes HUD captions. JPEG95 frames stitched H264 CRF18.',frames,virtualDurationMs:42200,tourDurationMs:42000,states,captions,encoded,errors:run.errors},null,2));
}}finally{await run.close();}
