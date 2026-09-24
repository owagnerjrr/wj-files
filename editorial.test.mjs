import test from 'node:test';
import assert from 'node:assert/strict';
import {localArticles,isTresCoracoes,tresCoracoes} from './public/services/localNewsService.js';
import {assertSlug,validatePublication} from './editorial/validation.mjs';
import {localPublishedArticles} from './public/data/localArticles.js';
import {articles} from './public/data/articles.js';
import {mkdtemp,mkdir,readFile,writeFile,copyFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const fixture=()=>({slug:'noticia-local',storyKey:'acontecimento-local',title:'Título de teste',subtitle:'Resumo',author:'Redação',category:'local',subcategory:'cultura',location:{...tresCoracoes},tags:['Cultura'],status:'draft',publishedAt:'2026-09-01T10:00:00-03:00',content:Array.from({length:4},()=>({text:'Texto de teste, não publicável como notícia real.'})),sources:[{name:'Fonte de teste',title:'Publicação',url:'https://example.com/fonte',publishedAt:'2026-08-31'}],videos:[],relatedContent:[],reviewNotes:'ANOTAÇÃO PRIVADA'});
test('cadastro público local contém somente a projeção aprovada',()=>{
 for(const article of localPublishedArticles){assert.equal(article.status,'published');assert.deepEqual(article,validatePublication(article,articles))}
});
test('recorte local exige município, estado e país; exclui rascunhos e rejeitados',()=>{
 const base=fixture();assert.ok(isTresCoracoes(base));assert.ok(isTresCoracoes({...base,location:{city:'Tres Coracoes',state:'mg',country:'br'}}));
 assert.equal(isTresCoracoes({...base,location:{...tresCoracoes,state:'RJ'}}),false);
 assert.equal(isTresCoracoes({...base,location:null}),false);
 const published={...base,status:'published'};
 assert.deepEqual(localArticles([base,{...base,status:'rejected'},published,{...published,location:{...tresCoracoes,city:'Outra cidade'}}]),[published]);
 assert.equal(localArticles([published],{topic:'cultura',query:'TITULO'}).length,1);
 assert.equal(localArticles([published],{topic:'esportes'}).length,0);
 assert.equal(localArticles([published],{query:'sem resultado'}).length,0);
});
test('projeção publicada exclui anotações privadas inclusive de fontes e blocos',()=>{
 const draft=fixture();draft.sources[0].notes='PRIVADO';draft.content[0].notes='PRIVADO';draft.location.address='PRIVADO';
 const result=validatePublication(draft);assert.equal(result.status,'published');assert.equal(result.featuredType,'none');
 assert.deepEqual(validatePublication(result),result);
 assert.equal(JSON.stringify(result).includes('PRIVADO'),false);assert.equal(result.reviewNotes,undefined);assert.equal(draft.status,'draft');
});
test('publicação exige origem segura, revisão de campos, datas e identidade sem duplicatas',()=>{
 for(const slug of ['../segredo','x/y','X','', 'a'.repeat(101)])assert.throws(()=>assertSlug(slug));
 assert.throws(()=>validatePublication({...fixture(),status:'rejected'}));
 assert.throws(()=>validatePublication({...fixture(),publishedAt:'2026-02-30'}));
 assert.throws(()=>validatePublication({...fixture(),publishedAt:'2999-01-01'}));
 assert.throws(()=>validatePublication({...fixture(),sources:[{name:'Fonte',title:'Título',url:'javascript:alert(1)'}]}));
 assert.throws(()=>validatePublication({...fixture(),content:[{text:''}]}));
 assert.throws(()=>validatePublication(fixture(),[{slug:'outra',storyKey:'acontecimento-local'}]));
 assert.throws(()=>validatePublication({...fixture(),featuredType:'primary'},[{slug:'outra',status:'published',featuredType:'primary'}]));
 assert.throws(()=>validatePublication({...fixture(),coverImage:'https://example.com/capa.jpg'}));
});
test('CLI cria, rejeita, reabre e exporta com revisão; falhas preservam o cadastro',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'wj-editorial-test-'));
 try{
  for(const dir of ['editorial','public/data','public/services'])await mkdir(path.join(temp,dir),{recursive:true});
  for(const file of ['editorial/cli.mjs','editorial/validation.mjs','public/services/localNewsService.js'])await copyFile(new URL(file,import.meta.url),path.join(temp,file));
  await writeFile(path.join(temp,'package.json'),'{"type":"module"}');
  await writeFile(path.join(temp,'public/data/articles.js'),"import {localPublishedArticles} from './localArticles.js'; export const articles=localPublishedArticles;");
  const publishedFile=path.join(temp,'public/data/localArticles.js');await writeFile(publishedFile,'export const localPublishedArticles=[];');
  const run=(...args)=>spawnSync(process.execPath,['editorial/cli.mjs',...args],{cwd:temp,encoding:'utf8'});
  assert.equal(run('new','noticia-local').status,0);assert.notEqual(run('new','noticia-local').status,0);
  const draftFile=path.join(temp,'.editorial/noticia-local.json');await writeFile(draftFile,JSON.stringify(fixture()));
  assert.equal(run('reject','noticia-local').status,0);assert.notEqual(run('publish','noticia-local','--reviewed').status,0);
  assert.equal(run('reopen','noticia-local').status,0);assert.equal(run('check','noticia-local').status,0);
  assert.notEqual(run('publish','noticia-local').status,0);
  assert.equal(run('publish','noticia-local','--reviewed').status,0);
  const output=await readFile(publishedFile,'utf8');assert.ok(output.includes('"status": "published"'));assert.ok(!output.includes('ANOTAÇÃO PRIVADA'));
  assert.equal((await readdir(path.join(temp,'.editorial/backups'))).length,1);
  assert.notEqual(run('reject','noticia-local').status,0);
  const invalid=fixture();invalid.sources[0].url='javascript:alert(1)';await writeFile(draftFile,JSON.stringify(invalid));
  assert.notEqual(run('publish','noticia-local','--reviewed').status,0);assert.equal(await readFile(publishedFile,'utf8'),output);
 }finally{
  const resolved=path.resolve(temp),base=path.resolve(tmpdir())+path.sep;
  if(resolved.startsWith(base)&&path.basename(resolved).startsWith('wj-editorial-test-'))await rm(resolved,{recursive:true,force:true});
 }
});
