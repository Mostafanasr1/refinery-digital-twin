// Offline build only: never used by npm run build or the published app.
import {defineConfig,mergeConfig} from 'vite';
import app from '../../app/vite.config';
import {resolve} from 'node:path';
export default mergeConfig(app,defineConfig({root:resolve(__dirname,'../../app'),build:{outDir:resolve(__dirname,'../../tests/visual/output/stageC-task-05/export-app'),emptyOutDir:true},plugins:[{name:'offline-scene-access',enforce:'pre',transform(code,id){if(id.replaceAll('\\','/').endsWith('/scripts/visual-runtime.tsx'))return code.replace('window.__refineryVisual = bridge;','window.__refineryVisual = bridge; (window as any).__heroScene = scene;');}}]}));
