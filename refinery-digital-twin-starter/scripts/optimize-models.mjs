import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const file = fileURLToPath(new URL('../data/normalized/models/refinery.glb', import.meta.url));
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions([EXTMeshoptCompression]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const before = await readFile(file);
const document = await io.readBinary(before);
const signature = doc => {
  const indices = new Set(doc.getRoot().listMeshes().flatMap(mesh => mesh.listPrimitives().map(primitive => primitive.getIndices())));
  return {
  attributes: doc.getRoot().listAccessors().filter(accessor => !indices.has(accessor)).map(accessor => {
    const array = accessor.getArray();
    assert.ok(array, 'Every accessor must have decoded data');
    return [accessor.getType(), accessor.getComponentType(), accessor.getNormalized(), accessor.getCount(), createHash('sha256').update(new Uint8Array(array.buffer, array.byteOffset, array.byteLength)).digest('hex')].join(':');
  }).sort(),
  topology: doc.getRoot().listMeshes().map(mesh => JSON.stringify({ name: mesh.getName(), primitives: mesh.listPrimitives().map(primitive => {
    const source = primitive.getIndices()?.getArray();
    assert.ok(source && source.length % 3 === 0, 'Expected indexed triangles');
    const canonical = new Uint32Array(source.length);
    // Meshopt may cyclically rotate triangle corners; preserve winding and face order.
    for (let i = 0; i < source.length; i += 3) {
      const triangle = [source[i], source[i + 1], source[i + 2]];
      const start = triangle.indexOf(Math.min(...triangle));
      for (let j = 0; j < 3; j++) canonical[i + j] = triangle[(start + j) % 3];
    }
    return { material: primitive.getMaterial()?.getName(), hash: createHash('sha256').update(new Uint8Array(canonical.buffer)).digest('hex') };
  }) })).sort(),
  nodes: doc.getRoot().listNodes().map(node => JSON.stringify({ name: node.getName(), extras: node.getExtras(), matrix: node.getMatrix(), children: node.listChildren().map(child => child.getName()), mesh: node.getMesh()?.getName() })).sort(),
  materials: doc.getRoot().listMaterials().map(material => JSON.stringify({ name: material.getName(), base: material.getBaseColorFactor(), metal: material.getMetallicFactor(), rough: material.getRoughnessFactor(), emissive: material.getEmissiveFactor(), doubleSided: material.getDoubleSided() })).sort(),
}; };
const originalSignature = signature(document);
// QUANTIZE selects the lossless encoder path. No quantize() transform is applied:
// retain the original float arrays and normals exactly to protect the visual gate.
document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
const output = await io.writeBinary(document);
assert.deepEqual(signature(await io.readBinary(output)), originalSignature, 'Compression must preserve decoded attributes, asset hierarchy and materials');
const temporary = `${file}.meshopt-tmp`;
try {
  await writeFile(temporary, output);
  await rename(temporary, file);
} finally { await rm(temporary, { force: true }); }
console.log(JSON.stringify({ file: 'data/normalized/models/refinery.glb', inputBytes: before.length, outputBytes: output.length, compression: 'EXT_meshopt_compression', decodedVertexAttributes: 'byte-identical', triangleTopology: 'same faces and winding; cyclic corner rotations allowed', assetHierarchyAndMaterials: 'unchanged' }, null, 2));
