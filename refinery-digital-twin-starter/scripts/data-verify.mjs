import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const fixtureIndex = process.argv.indexOf('--fixture-root');
// Explicit fixture roots let the verifier be tested without mutating plant truth.
const root = fixtureIndex < 0 ? fileURLToPath(new URL('../', import.meta.url)) : resolve(process.argv[fixtureIndex + 1]);
const manifestPath = resolve(root, 'tests/visual/canonical-hashes.json');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
async function collect(directory, recursive = false) {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory() && recursive) paths.push(...await collect(path, true));
    else if (entry.isFile() && entry.name.endsWith('.json')) paths.push(path);
  }
  return paths;
}
const paths = [...await collect('data/synthetic', true), ...await collect('data/normalized'), ...await collect('schemas', true), 'pipeline/catalog.py'].sort();
const files = {};
for (const path of paths) {
  const text = await readFile(resolve(root, path), 'utf8');
  const content = path.endsWith('.json') ? JSON.stringify(stable(JSON.parse(text))) : text.replaceAll('\r\n', '\n');
  files[path] = createHash('sha256').update(content).digest('hex');
}
const snapshot = { algorithm: 'SHA-256; sorted JSON keys, array order retained; LF text', exclusions: ['data/presentation/**', 'tests/visual/cameras.json', 'data/normalized/models/**', 'data/normalized/preview/**'], files };
if (process.argv.includes('--record')) {
  await writeFile(manifestPath, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Recorded ${paths.length} canonical files in ${relative(root, manifestPath)}. Only rebaseline with explicit review approval.`);
} else {
  const baseline = JSON.parse(await readFile(manifestPath, 'utf8'));
  const changed = [...new Set([...Object.keys(baseline.files), ...paths])].filter(path => files[path] !== baseline.files[path]);
  if (changed.length) { console.error('Canonical data changed:', changed.join('\n')); process.exitCode = 1; }
  else console.log(`Canonical data unchanged (${paths.length} files).`);
}
