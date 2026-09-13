import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { createStaticServer } from '../scripts/serve.mjs';

test('production server serves the complete build with correct types and real missing-file errors', async () => {
  const server=createStaticServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try {
    const files=await readdir(new URL('../app/dist/',import.meta.url),{recursive:true,withFileTypes:true});
    for(const file of files.filter(f=>f.isFile())) {
      const path=relative(fileURLToPath(new URL('../app/dist/',import.meta.url)), `${file.parentPath}/${file.name}`).replaceAll('\\','/');
      const response=await fetch(`${base}/${path}`);
      assert.equal(response.status,200,path);
      assert.ok((await response.arrayBuffer()).byteLength>0,path);
      if(path.endsWith('.json')) assert.match(response.headers.get('content-type'),/application\/json/);
      if(path.endsWith('.glb')) assert.equal(response.headers.get('content-type'),'model/gltf-binary');
      if(path.endsWith('.js')) assert.match(response.headers.get('content-type'),/javascript/);
    }
    assert.equal((await fetch(base+'/')).status,200);
    assert.equal((await fetch(base+'/healthz')).status,200);
    const missing=await fetch(base+'/models/missing.glb');
    assert.equal(missing.status,404);
    assert.doesNotMatch(await missing.text(),/<!doctype/i);
    assert.equal((await fetch(base+'/package.json')).status,404);
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/preview/render.png',{method:'HEAD'})).status,200);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
