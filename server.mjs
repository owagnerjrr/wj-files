import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const args = process.argv.slice(2);
const option = (name) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const port = Number(option('--port') || process.env.PORT || 5173);
const host = option('--host') || '127.0.0.1';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.jpg':'image/jpeg','.png':'image/png'};
const routes = new Map([
  ['/', '/portfolio.html'],
  ['/dicas', '/dicas.html'],
  ['/dicas/como-formatar-computador', '/dicas/como-formatar-computador.html'],
]);
http.createServer(async(req,res)=>{
  try {
    const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const clean=route==='/'?route:route.replace(/\/$/,'');
    const mapped=routes.get(clean)||route;
    const target=path.resolve(root,'.'+mapped);
    if(target!==root && !target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const file=path.extname(target)?target:path.join(root,'index.html');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}).end(body);
  }catch{res.writeHead(404).end('Arquivo não encontrado');}
}).listen(port,host,()=>console.log(`WJ Tecnologia: http://${host}:${port}`));
