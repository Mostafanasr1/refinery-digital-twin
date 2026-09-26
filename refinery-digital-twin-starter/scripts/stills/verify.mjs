import assert from 'node:assert/strict';
import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'../..'),out=resolve(root,'docs/stills');
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
async function files(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);result.push(...e.isDirectory()?await files(p):[p])}return result}
const sceneHash=await hash(resolve(out,'stageC-hero-scene.blend'));
const frames=[];
for(const id of ['CAM-6-day','CAM-6-night','CAM-2-day']){
 const record=JSON.parse(await readFile(resolve(out,id+'.json'),'utf8'));const path=resolve(out,id+'.png'),png=await readFile(path);
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),3840);assert.equal(png.readUInt32BE(20),2160);assert.equal(png[24],16);
 const [,camera,preset]=id.match(/^(CAM-\d+)-(day|night)$/);assert.equal(record.camera,camera);assert.equal(record.preset,preset);assert.equal(record.output,id+'.png');assert.equal(record.backend,'OPTIX');
 assert.equal(record.scene_sha256,sceneHash);assert.equal(record.output_sha256,await hash(path));assert.equal(record.engine,'CYCLES');assert.equal(record.denoising,true);assert.equal(record.width,3840);assert.equal(record.height,2160);assert.ok(record.render_seconds>0);assert.match(record.device.join(','),/RTX 3050/);
 frames.push({...record,bytes:png.length});
}
const appFiles=await files(resolve(root,'app/dist'));
assert.ok(appFiles.every(p=>!p.endsWith('.blend')&&!/CAM-[26]-(day|night)\.png/.test(p)));
for(const p of appFiles.filter(p=>p.endsWith('.js')))assert.ok(!(await readFile(p,'utf8')).includes('__heroScene'),'offline export bridge must not enter runtime');
const audit=JSON.parse(await readFile(resolve(root,'tests/visual/output/stageC-task-05/import-audit.json'),'utf8'));assert.equal(audit.status,'PASS');assert.equal(audit.source_glb_sha256,await hash(resolve(root,'tests/visual/output/stageC-task-05/hero-source.glb')));
const source=JSON.parse(await readFile(resolve(root,'tests/visual/output/stageC-task-05/hero-source.json'),'utf8'));assert.deepEqual(source.errors,[]);assert.equal(source.meshes,audit.source_nodes);for(const frame of frames)assert.equal(frame.source_commit,source.sourceCommit);
const inputs={};for(const dir of ['scripts/stills','data/presentation','data/normalized/models','data/normalized/assets/env','data/normalized/assets/materials','data/normalized/assets/detail'])for(const p of await files(resolve(root,dir)))inputs[relative(root,p).replaceAll('\\','/')]=await hash(p);
for(const name of ['tests/visual/cameras.json','tests/visual/canonical-hashes.json'])inputs[name]=await hash(resolve(root,name));
const record={status:'PASS',scene:{file:'stageC-hero-scene.blend',sha256:sceneHash,bytes:(await stat(resolve(out,'stageC-hero-scene.blend'))).size},frames,geometryAudit:audit,sourceCommit:source.sourceCommit,motionTime:source.motionTime,appExclusion:'PASS: no stills, Blender scene, or offline scene bridge in app/dist',inputHashes:inputs};
await writeFile(resolve(out,'manifest.json'),JSON.stringify(record,null,2));console.log(JSON.stringify({status:record.status,scene:record.scene,frames:frames.map(f=>({output:f.output,seconds:f.render_seconds,denoiser:f.denoiser})),appExclusion:record.appExclusion},null,2));
