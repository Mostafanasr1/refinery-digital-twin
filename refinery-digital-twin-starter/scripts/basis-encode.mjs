// Pinned portable encoder; no installer or system configuration changes.
import { WASI } from 'node:wasi';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const [encoder, directory, ...args] = process.argv.slice(2);
const bytes = await readFile(encoder);
if (createHash('sha256').update(bytes).digest('hex') !== 'b42d951b1bf146133578e8c7927ad4a4a857552846a46a3ee33b541b2a06bc7d') throw new Error('Unexpected Basis encoder checksum');
const wasi = new WASI({ version: 'preview1', args: ['basisu', ...args], preopens: { '/work': resolve(directory) }, returnOnExit: true });
const instance = await WebAssembly.instantiate(await WebAssembly.compile(bytes), wasi.getImportObject());
process.exitCode = wasi.start(instance);
