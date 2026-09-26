import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({ base: './', publicDir: '../data/normalized', plugins: [{
  name: 'asset-byte-sizes',
  resolveId(id) { if (id === 'virtual:asset-sizes') return '\0asset-sizes'; },
  load(id) {
    if (id !== '\0asset-sizes') return;
    const root = resolve(__dirname, '../data/normalized');
    const paths = ['models/refinery.glb', 'assets/detail/hero.glb',
      ...['env', 'materials', 'dressing'].flatMap(dir => readdirSync(resolve(root, 'assets', dir))
        .filter(name => name !== 'sources.json').map(name => `assets/${dir}/${name}`))];
    return `export default ${JSON.stringify(Object.fromEntries(paths.map(path => [path, statSync(resolve(root, path)).size])))};`;
  },
}] });
