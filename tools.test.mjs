import test from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {normalizeDestination,validCode} from './lib/short-links.js';
import shorten from './api/shorten.js';
import redirect from './api/redirect.js';
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(body){this.body=body;return this},send(body){this.body=body;return this},end(){return this}});
test('QR Code pode ser decodificado com URL, acentos e emojis',()=>{
 for(const text of ['https://www.wjfiles.com.br/dicas','Olá! Tecnologia & ideias 💻','https://example.com/?a=1&b=caf%C3%A9']){
 const qr=QRCode.create(text,{errorCorrectionLevel:'M'}), scale=6, size=(qr.modules.size+8)*scale, data=new Uint8ClampedArray(size*size*4).fill(255);
 for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x))for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const p=(((y+4)*scale+dy)*size+(x+4)*scale+dx)*4;data[p]=data[p+1]=data[p+2]=0;}
 assert.equal(jsQR(data,size,size)?.data,text);
 }
});
test('links aceitam HTTP público e rejeitam protocolos, credenciais, IPs e loops',()=>{
 assert.equal(normalizeDestination(' https://example.com/a?x=1&y=2 '),'https://example.com/a?x=1&y=2');
 for(const url of ['javascript:alert(1)','data:text/html,oi','file:///etc/passwd','https://user:pass@example.com','http://localhost','http://127.0.0.1','http://[::1]','http://10.0.0.1','http://foo.local','https://www.wjfiles.com.br/s/abcdefgh','x'.repeat(2049)])assert.throws(()=>normalizeDestination(url));
 assert.ok(validCode('abCD_1-2'));assert.ok(validCode('abCD_1'));assert.ok(!validCode('abcde'));assert.ok(!validCode('abcdefghi'));for(const code of ['../','abc',['abcdefgh'],null])assert.ok(!validCode(code));
});
test('API rejeita método errado e link inexistente sem consultar o banco',async()=>{
 let res=response();await shorten({method:'GET'},res);assert.equal(res.code,405);
 res=response();await redirect({method:'GET',query:{code:'../'}},res);assert.equal(res.code,404);
 res=response();await redirect({method:'POST'},res);assert.equal(res.code,405);
});
