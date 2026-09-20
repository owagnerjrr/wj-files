import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const port = Number(process.env.PORT || 5173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{
  try {
    const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(root,'.'+route);
    if(target!==root && !target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const file=path.extname(target)?target:path.join(root,'index.html');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}).end(body);
  }catch{res.writeHead(404).end('Arquivo não encontrado');}
}).listen(port,'127.0.0.1',()=>console.log(`WJ Files: http://localhost:${port}`));
