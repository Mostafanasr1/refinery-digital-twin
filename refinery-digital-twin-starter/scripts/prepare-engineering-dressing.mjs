import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const output='data/normalized/assets/dressing';await mkdir(output,{recursive:true});const manifest=[];
for(const name of ['source-cabin','container','source-pickup','source-tanker']) {
 const source=`data/normalized/assets/env/${name}.glb`,bytes=await readFile(source),doc=await io.readBinary(bytes);
 const grey=doc.createMaterial('Engineering flat grey').setBaseColorFactor([.46,.49,.5,1]).setMetallicFactor(0).setRoughnessFactor(1);
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives())primitive.setMaterial(grey);
 for(const material of [...doc.getRoot().listMaterials()])if(material!==grey)material.dispose();
 for(const texture of [...doc.getRoot().listTextures()])texture.dispose();
 doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 const signature = d => d.getRoot().listMeshes().flatMap(m => m.listPrimitives().flatMap(p => p.listSemantics().map(semantic => { const a=p.getAttribute(semantic).getArray();return semantic+':'+createHash('sha256').update(new Uint8Array(a.buffer,a.byteOffset,a.byteLength)).digest('hex'); }))).sort();
 const original=signature(doc);const result=await io.writeBinary(doc);assert.deepEqual(signature(await io.readBinary(result)),original,'Engineering dressing vertex attributes must be byte-identical');await writeFile(`${output}/${name}.glb`,result);
 manifest.push({file:`${output}/${name}.glb`,bytes:result.length,sha256:createHash('sha256').update(result).digest('hex'),source,sourceSha256:createHash('sha256').update(bytes).digest('hex'),modification:'Identical geometry/transforms; textures removed; neutral grey material; lossless meshopt. Source license and attribution retained in ASSETS.md.'});
}
await writeFile(`${output}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.log(manifest.map(x=>({file:x.file,bytes:x.bytes})));
