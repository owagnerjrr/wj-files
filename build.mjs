import {readdir,readFile,mkdir,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {localPublishedArticles} from './public/data/localArticles.js';
import {articles} from './public/data/articles.js';
import {validatePublication} from './editorial/validation.mjs';
for(const article of localPublishedArticles){
  if(article.status!=='published')throw new Error('Rascunhos e rejeitados não podem estar no cadastro público.');
  const clean=validatePublication(article,articles);
  if(JSON.stringify(Object.keys(article).sort())!==JSON.stringify(Object.keys(clean).sort()))throw new Error('Campos privados ou desconhecidos no cadastro local publicado. Use o fluxo editorial.');
  if(JSON.stringify(article)!==JSON.stringify(clean))throw new Error('Cadastro local diferente da projeção revisada. Use o fluxo editorial.');
}
async function walk(dir){const out=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())out.push(...await walk(p));else out.push(p)}return out;}
const files=await walk('public');
for(const file of files.filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const html=await readFile('public/index.html','utf8');
for(const [,asset] of html.matchAll(/(?:src|href)="(\/[^"#]+\.(?:js|css))"/g))await readFile('public'+asset);
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
console.log(`Build concluído: ${files.length} arquivos em dist/.`);
