import assert from 'node:assert/strict';
import {build as bundle} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {openRun,root,camera,config} from '../visual-common.mjs';
import {openLook,switchLook} from '../../tests/visual/look-common.mjs';
const out=resolve(root,'tests/visual/output/stageC-task-05');await mkdir(out,{recursive:true});
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','scripts/stills/vite.config.ts'],{cwd:root,stdio:'inherit'});
await bundle({entryPoints:[resolve(root,'scripts/stills/export-scene.js')],bundle:true,format:'esm',outfile:resolve(out,'export-app/hero-export.js')});
const run=await openRun({staticRoot:resolve(out,'export-app')});
try{
 await run.page.route('**/favicon.ico',route=>route.fulfill({status:204}));
 run.page.on('console',m=>{if(m.type()==='error')run.errors.push(m.text())});
 const hardware=await openLook(run,'photoreal');await run.page.evaluate(()=>window.__refineryMotion.setTime(1.5));await camera(run.page,config.cameras[5]);
 await run.page.evaluate(async()=>{window.__heroExport=await import('/hero-export.js')});
 console.log('day',await run.page.evaluate(()=>window.__heroExport.capture('day')));
 await switchLook(run.page,'photoreal-night');await camera(run.page,config.cameras[5]);
 console.log('night',await run.page.evaluate(()=>window.__heroExport.capture('night')));
 const download=run.page.waitForEvent('download',{timeout:180000});
 const [meta,file]=await Promise.all([run.page.evaluate(()=>window.__heroExport.save()),download]);
 await file.saveAs(resolve(out,'hero-source.glb'));
 for(const preset of Object.values(meta.presets)){await writeFile(resolve(out,'dusk-sky.png'),Buffer.from(preset.duskSky.split(',')[1],'base64'));delete preset.duskSky;}
 meta.motionTime=1.5;meta.errors=run.errors;meta.hardware=hardware;meta.cameras=config.cameras;meta.sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 assert.deepEqual(run.errors,[],'offline source export must have no page or shader errors');
 await writeFile(resolve(out,'hero-source.json'),JSON.stringify(meta,null,2));console.log({bytes:meta.bytes,meshes:meta.meshes,errors:run.errors});
}catch(error){console.error(error);throw error}finally{await run.close()}
