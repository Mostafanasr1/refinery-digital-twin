import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, stat, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openRun, camera, config, root } from '../../scripts/visual-common.mjs';
import { openLook, switchLook, snapshot, plantIdentity } from './look-common.mjs';
const output = resolve(root, 'docs/handbacks/evidence/stageB-task-05');
await mkdir(output, {recursive:true});
const manifest = JSON.parse(await readFile(resolve(root, 'data/normalized/assets/detail/manifest.json'), 'utf8'));
const run = await openRun(), requests = [];
run.page.on('request', request => { if (request.url().endsWith('/assets/detail/hero.glb')) requests.push(request.url()); });
try {
  const hardware = await openLook(run);
  assert.equal(requests.length, 0);
  const base = await snapshot(run.page);
  await switchLook(run.page, 'photoreal');
  const photo = await snapshot(run.page);
  assert.deepEqual(plantIdentity(photo), plantIdentity(base), 'optional detail must not replace base plant');
  assert.deepEqual(photo.registryIds, base.registryIds);
  assert.deepEqual(photo.optionalDetail.assetIds, Object.keys(manifest.assets).sort());
  assert.ok(photo.optionalDetail.visibleMeshes > 0);
  const hitTransitions = [];
  const checkHits = async (state, visible) => {
    const hits = await run.page.evaluate(() => window.__refineryDetailHits());
    assert.ok(visible ? hits > 0 : hits === 0, `${state}: actual detail raycasting follows visibility`);
    hitTransitions.push({state, hits});
  };
  await checkHits('photoreal/blender', true);
  await switchLook(run.page, 'engineering');
  assert.equal((await snapshot(run.page)).optionalDetail.visibleMeshes, 0);
  await checkHits('engineering/blender', false);
  await switchLook(run.page, 'photoreal');
  await checkHits('photoreal/blender restored', true);
  await run.page.getByRole('combobox', {name:'Geometry', exact:true}).selectOption('proxy');
  await checkHits('photoreal/proxy', false);
  await switchLook(run.page, 'engineering');
  await checkHits('engineering/proxy', false);
  await switchLook(run.page, 'photoreal');
  await run.page.getByRole('combobox', {name:'Geometry', exact:true}).selectOption('blender');
  await checkHits('photoreal/blender restored after proxy', true);
  assert.deepEqual((await snapshot(run.page)).optionalDetail.meshes, photo.optionalDetail.meshes);
  assert.equal(requests.length, 1, 'detail cached after first visit');
  for (const spec of config.cameras) {
    await camera(run.page, spec);
    await run.page.screenshot({path: resolve(output, `${spec.id}-after.png`)});
    await copyFile(resolve(root, `docs/handbacks/evidence/stageB-task-04/${spec.id}-photoreal-default.png`), resolve(output, `${spec.id}-before.png`));
  }
  const assets = JSON.parse(await readFile(resolve(root, 'data/normalized/assets.json'), 'utf8'));
  const closeups = [];
  for (const tag of ['F-201', 'T-201', 'TK-101']) {
    const asset = assets.find(asset => asset.tag === tag);
    const {x,y,z} = asset.position;
    const size = Math.max(asset.dimensions.diameter, asset.dimensions.width, 5);
    const spec = tag === 'F-201'
      ? {id:tag, position:[x + 21,z + 24,-y + 20],target:[x,z + 10,-y]}
      : {id:tag, position:[x + size * 1.7,z + asset.dimensions.height * .65,-y + size * 2.3],target:[x,z + asset.dimensions.height * .4,-y]};
    closeups.push(spec); await camera(run.page, spec);
    await run.page.screenshot({path:resolve(output, `${tag}-closeup.png`)});
  }
  const files = [];
  for (const folder of ['env','materials','detail']) for (const file of await readdir(resolve(root, 'data/normalized/assets', folder))) files.push({file:`${folder}/${file}`,bytes:(await stat(resolve(root,'data/normalized/assets',folder,file))).size});
  const lazyBytes = files.reduce((sum,file)=>sum+file.bytes,0);
  assert.ok(lazyBytes<=40_000_000,'HARD STOP: lazy asset budget exceeded');
  assert.deepEqual(run.errors,[]);
  const result = {hardware, baseIdentity:'unchanged', registryIds:'unchanged', heroAssets:photo.optionalDetail.assetIds.length, detailCached:true, engineeringDetailVisible:false, hitTransitions, lazyBytes, files, closeups, errors:run.errors};
  await writeFile(resolve(output,'hero-flow.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally {await run.close();}
