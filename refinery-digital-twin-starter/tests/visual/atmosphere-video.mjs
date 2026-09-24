import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openRun,camera,config,root} from '../../scripts/visual-common.mjs';
import {openLook} from './look-common.mjs';
const run=await openRun();
try {
 run.url+='&animate=1';await openLook(run,'photoreal-night');await camera(run.page,config.cameras[4]);
 const recording=await run.page.evaluate(async()=>{
  const canvas=document.querySelector('canvas'),stream=canvas.captureStream(30);
  const type=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:5000000}),chunks=[];
  recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
  const done=new Promise(resolve=>{recorder.onstop=resolve;});
  const start=performance.now();recorder.start();await new Promise(resolve=>setTimeout(resolve,11000));recorder.stop();await done;stream.getTracks().forEach(track=>track.stop());
  const blob=new Blob(chunks,{type}),data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});
  return {data,mimeType:type,durationMs:performance.now()-start,width:canvas.width,height:canvas.height};
 });
 assert.ok(recording.durationMs>=10000);assert.deepEqual(run.errors,[]);
 const {data,...metadata}=recording;
 await writeFile(resolve(root,'tests/visual/output/CAM-5-flare-raw.webm'),Buffer.from(data.split(',')[1],'base64'));
 await writeFile(resolve(root,'docs/handbacks/evidence/stageB-task-06/flare-recording.json'),JSON.stringify({...metadata,flags:run.flags,errors:run.errors},null,2)+'\n');
 console.log(metadata);
}finally{await run.close();}
