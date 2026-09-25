import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../app/dist/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
export function createStaticServer(rootDirectory = root) {
  const root = resolve(rootDirectory);
  return createServer(async (req, res) => {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}).end(); return; }
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (pathname === '/healthz') { res.writeHead(200, {'Content-Type':'text/plain'}).end(req.method === 'HEAD' ? undefined : 'ok'); return; }
    const file=resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root+sep)) { res.writeHead(403).end('Forbidden'); return; }
    try {
      const info=await stat(file);
      if (!info.isFile()) { res.writeHead(404).end('Not found'); return; }
      res.writeHead(200, {'Content-Type':mime[extname(file)] ?? 'application/octet-stream', 'Content-Length':info.size, 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'});
      if(req.method === 'HEAD') { res.end(); return; }
      createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch { res.writeHead(404).end('Not found'); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await stat(resolve(root,'index.html'));
  const port=Number(process.env.PORT || 3000);
  const server=createStaticServer();
  server.listen(port,'0.0.0.0',()=>console.log(`Refinery production server listening on ${port}`));
  process.on('SIGTERM',()=>server.close());
}
