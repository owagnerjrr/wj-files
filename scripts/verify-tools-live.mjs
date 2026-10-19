// Integration verification against a dedicated tools database; credential arrives via stdin only.
import {createInterface} from 'node:readline';
import assert from 'node:assert/strict';
import shorten from '../api/shorten.js';
import redirect from '../api/redirect.js';
const line=await new Promise(resolve=>{const input=createInterface({input:process.stdin});input.once('line',value=>{input.close();resolve(value)});});
const credentials=JSON.parse(line);
process.env.SHORTLINK_DATABASE_URL=credentials.databaseUrl;
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(body){this.body=body;return this},send(body){this.body=body;return this},end(){return this}});
const destination='https://www.wjfiles.com.br/dicas?origem=verificacao-ferramentas';
let res=response();await shorten({method:'POST',headers:{'content-type':'application/json',host:'www.wjfiles.com.br',origin:'https://www.wjfiles.com.br','x-forwarded-for':'qa-tools'},body:{url:destination}},res);assert.equal(res.code,201);const code=res.body.code;assert.equal(code.length,6);
res=response();await redirect({method:'GET',query:{code}},res);assert.equal(res.code,302);assert.equal(res.headers.Location,destination);
res=response();await redirect({method:'GET',query:{code:'________'}},res);assert.equal(res.code,404);
res=response();await shorten({method:'POST',headers:{'content-type':'application/json',host:'www.wjfiles.com.br',origin:'https://other.example'},body:{url:destination}},res);assert.equal(res.code,403);
res=response();await shorten({method:'POST',headers:{'content-type':'application/json'},body:{url:'javascript:alert(1)'}},res);assert.equal(res.code,400);
if(credentials.legacyCode){res=response();await redirect({method:'GET',query:{code:credentials.legacyCode}},res);assert.equal(res.code,302);}
console.log('Integração real: link salvo, recuperado e redirecionado; destino inválido, origem externa e código inexistente tratados.');
