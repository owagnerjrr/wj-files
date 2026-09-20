import {readdir,readFile,mkdir,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
async function walk(dir){const out=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())out.push(...await walk(p));else out.push(p)}return out;}
const files=await walk('public');
for(const file of files.filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const html=await readFile('public/index.html','utf8');
for(const [,asset] of html.matchAll(/(?:src|href)="(\/[^"#]+\.(?:js|css))"/g))await readFile('public'+asset);
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
console.log(`Build concluído: ${files.length} arquivos em dist/.`);
