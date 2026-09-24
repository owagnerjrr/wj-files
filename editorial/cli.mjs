import {mkdir,readFile,writeFile,readdir,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {articles} from '../public/data/articles.js';
import {localPublishedArticles} from '../public/data/localArticles.js';
import {tresCoracoes} from '../public/services/localNewsService.js';
import {assertSlug,validatePublication} from './validation.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const privateRoot=path.join(root,'.editorial');
const [command,slug,...flags]=process.argv.slice(2);
const help='Comandos: npm run editorial -- new <slug> | list | check <slug> | publish <slug> --reviewed | reject <slug> | reopen <slug>';
async function saveDraft(file,draft){const temp=file+'.tmp';await writeFile(temp,JSON.stringify(draft,null,2)+'\n');await rename(temp,file)}
try {
  if(!command || command==='help'){console.log(help);process.exit(0)}
  if(!['new','list','check','publish','reject','reopen'].includes(command))throw new Error(help);
  await mkdir(privateRoot,{recursive:true});
  if(command==='list'){
    for(const name of (await readdir(privateRoot)).filter(name=>name.endsWith('.json'))){const draft=JSON.parse(await readFile(path.join(privateRoot,name),'utf8'));console.log(`${draft.status}\t${draft.slug}\t${draft.title || '(sem título)'}`)}
  } else {
    assertSlug(slug);const file=path.join(privateRoot,slug+'.json');
    if(command==='new'){
      if(articles.some(article=>article.slug===slug))throw new Error('Este slug já existe. Escolha outro para uma nova matéria.');
      const draft={slug,storyKey:slug,title:'',subtitle:'',author:'Redação WJ Files',category:'local',subcategory:'cidade',location:tresCoracoes,tags:['Três Corações'],featuredType:'none',status:'draft',publishedAt:null,content:[{heading:'',text:''}],sources:[{name:'',title:'',publishedAt:null,url:''}],videos:[],relatedContent:[],reviewNotes:''};
      await writeFile(file,JSON.stringify(draft,null,2)+'\n',{flag:'wx'});console.log('Rascunho privado criado: '+file);
    } else {
      const draft=JSON.parse(await readFile(file,'utf8'));if(draft.slug!==slug)throw new Error('O slug do arquivo não corresponde ao comando.');
      if(command==='reject'||command==='reopen'){
        if(command==='reject'&&localPublishedArticles.some(item=>item.slug===slug))throw new Error('A matéria está publicada. Rejeitar um rascunho não remove uma publicação existente.');
        draft.status=command==='reject'?'rejected':'draft';await saveDraft(file,draft);console.log('Estado local: '+draft.status);
      } else {
        if(articles.some(item=>item.slug===slug)&&!localPublishedArticles.some(item=>item.slug===slug))throw new Error('Este slug pertence ao cadastro anterior; ele não será substituído.');
        const published=validatePublication(draft,articles);
        if(command==='check')console.log('Cadastro válido. A validação técnica não substitui a revisão factual e dos direitos de mídia.');
        else {
          if(!flags.includes('--reviewed'))throw new Error('Confirme a revisão de fatos, fontes, texto e direitos de mídia usando --reviewed.');
          const next=[...localPublishedArticles.filter(item=>item.slug!==slug),published];
          const target=path.join(root,'public/data/localArticles.js');
          const backupDir=path.join(privateRoot,'backups');await mkdir(backupDir,{recursive:true});
          await writeFile(path.join(backupDir,Date.now()+'-localArticles.js'),await readFile(target),{flag:'wx'});
          const temp=target+'.tmp';await writeFile(temp,'// Gerado pelo fluxo editorial local; somente publicações revisadas.\nexport const localPublishedArticles = '+JSON.stringify(next,null,2)+';\n');await rename(temp,target);
          await saveDraft(file,{...draft,status:'published'});
          console.log('Publicação exportada para public/data/localArticles.js. Execute testes e build, revise o diff e envie o commit para publicar online.');
        }
      }
    }
  }
} catch(error){console.error(error.message);process.exitCode=1}
