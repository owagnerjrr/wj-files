import pdfService from './api/pdf-service.js';
import shorten from './api/shorten.js';
import redirect from './api/redirect.js';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const args = process.argv.slice(2);
const option = (name) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const port = Number(option('--port') || process.env.PORT || 5173);
const host = option('--host') || '127.0.0.1';
const tipsSlugs = ['computador-lento-o-que-fazer','como-fazer-backup','wifi-conectado-sem-internet','como-identificar-golpes','ssd-ou-memoria-ram','atalhos-uteis-windows'];
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.bcmap':'application/octet-stream','.pfb':'application/octet-stream','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif','.jpg':'image/jpeg','.png':'image/png'};
const routes = new Map([
  ['/', '/portfolio.html'],
  ['/dicas', '/dicas.html'],
  ['/ferramentas', '/ferramentas.html'],
  ['/ferramentas/pdf', '/pdf.html'],
  ['/dicas/como-formatar-computador', '/dicas/como-formatar-computador.html'],
]);
for(const slug of tipsSlugs)routes.set(`/dicas/${slug}`, `/dicas/${slug}.html`);
http.createServer(async(req,res)=>{
  try {
    const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const clean=route==='/'?route:route.replace(/\/$/,'');
    if(clean==='/api/pdf-service' || clean==='/api/shorten' || clean==='/api/redirect' || clean.startsWith('/s/')) {
      res.status=code=>{res.statusCode=code;return res;};
      res.json=value=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));return res;};
      res.send=value=>{res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(value);return res;};
      if(clean==='/api/pdf-service')return pdfService(req,res);
      const url=new URL(req.url,'http://localhost');
      req.query=Object.fromEntries(url.searchParams);
      if(clean.startsWith('/s/'))req.query.code=clean.slice(3);
      if(clean==='/api/shorten') {
        let body='';
        for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>8192)return res.status(413).json({error:'Envie um link menor.'});}
        req.body=body;
        return await shorten(req,res);
      }
      return await redirect(req,res);
    }
    const mapped=routes.get(clean)||route;
    const target=path.resolve(root,'.'+mapped);
    if(target!==root && !target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const file=path.extname(target)?target:path.join(root,'index.html');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}).end(body);
  }catch{res.writeHead(404).end('Arquivo não encontrado');}
}).listen(port,host,()=>console.log(`WJ Tecnologia: http://${host}:${port}`));
