import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const command = fileURLToPath(new URL('../../scripts/data-verify.mjs', import.meta.url));
test('canonical lock detects added, changed and deleted data but excludes presentation and formatting', async () => {
  const root = await mkdtemp(join(tmpdir(), 'refinery-canonical-test-'));
  const run = (...args) => spawnSync(process.execPath, [command, '--fixture-root', root, ...args], { encoding: 'utf8' });
  try {
    for (const directory of ['data/synthetic', 'data/normalized', 'schemas', 'pipeline', 'data/presentation', 'tests/visual']) await mkdir(join(root, directory), { recursive: true });
    const path = join(root, 'data/synthetic/assets.json');
    await writeFile(path, '[{"id":"a","size":3}]');
    await writeFile(join(root, 'pipeline/catalog.py'), 'TYPES = []\n');
    assert.equal(run('--record').status, 0);
    assert.equal(run().status, 0);
    await writeFile(path, '[{ "size":3, "id":"a" }]\r\n');
    await writeFile(join(root, 'data/presentation/tours.json'), '{"tour":"new"}');
    await writeFile(join(root, 'tests/visual/cameras.json'), '{"camera":"new"}');
    assert.equal(run().status, 0, 'formatting and presentation must stay editable');
    await writeFile(path, '[{"id":"a","size":4}]');
    assert.equal(run().status, 1, 'changed truth fails');
    await writeFile(path, '[{"id":"a","size":3}]');
    const added = join(root, 'data/synthetic/new.json');
    await writeFile(added, '[]');
    assert.equal(run().status, 1, 'new truth files fail');
    await rm(added);
    await rm(path);
    assert.equal(run().status, 1, 'removed truth files fail');
    assert.equal(Object.keys(JSON.parse(await readFile(join(root, 'tests/visual/canonical-hashes.json'), 'utf8')).files).length, 2, 'verification never rewrites the lock');
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), 'refinery-canonical-test-')), 'cleanup stays inside the named temporary fixture directory');
    await rm(root, { recursive: true, force: true });
  }
});
