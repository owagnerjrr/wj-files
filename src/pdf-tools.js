import {createWordFromTextPages,pdfTextLines,prepareWordPreview} from './word-conversion.js';
import {pdfTools,getPdfTool} from '../public/pdf-catalog.js';
import {processPdf} from './pdf-operations.js';
import JSZip from 'jszip';
const $=id=>document.getElementById(id),dialog=$('pdf-dialog'),form=$('pdf-form'),fileInput=$('pdf-files'),status=$('pdf-status'),result=$('pdf-result');
let active,selectedFiles=[],downloadUrl,previousFocus,runId=0,server={available:false,aiAvailable:false};
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderCatalog(){
 const term=normalize($('pdf-search').value),category=$('pdf-category').value;let visible=0;
 for(const card of document.querySelectorAll('[data-pdf-tool]')){const tool=getPdfTool(card.dataset.pdfTool);const match=(!category||tool.category===category)&&normalize(tool.title+' '+tool.description).includes(term);card.hidden=!match;if(match)visible++;
 const enabled=tool.local||(server.available&&(!tool.ai||server.aiAvailable));card.disabled=!enabled;card.setAttribute('aria-label',tool.title+(enabled?'':', em preparação'));
 card.querySelector('.pdf-mode').textContent=tool.local?'Pronto para usar':enabled?'Abrir ferramenta':tool.ai?'IA em preparação':'Servidor em preparação';
 }
 $('pdf-count').textContent=`${visible} ferramenta${visible===1?'':'s'} encontrada${visible===1?'':'s'}.`;
 $('pdf-empty').hidden=visible!==0;
}
$('pdf-search').addEventListener('input',renderCatalog);$('pdf-category').addEventListener('change',renderCatalog);
function renderFiles(){
 const list=$('pdf-file-list');list.replaceChildren();
 selectedFiles.forEach((file,index)=>{const li=document.createElement('li'),label=document.createElement('span');label.textContent=`${index+1}. ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`;li.append(label);
 const actions=document.createElement('div');actions.className='file-actions';
 for(const [caption,description,disabled,callback] of [['↑','Mover para cima',index===0,()=>{[selectedFiles[index-1],selectedFiles[index]]=[selectedFiles[index],selectedFiles[index-1]];}],['↓','Mover para baixo',index===selectedFiles.length-1,()=>{[selectedFiles[index+1],selectedFiles[index]]=[selectedFiles[index],selectedFiles[index+1]];}],['×','Remover arquivo',false,()=>selectedFiles.splice(index,1)]]){if(!active.multiple&&caption!=='×')continue;const button=document.createElement('button');button.type='button';button.textContent=caption;button.disabled=disabled;button.setAttribute('aria-label',`${description}: ${file.name}`);button.addEventListener('click',()=>{callback();renderFiles();result.hidden=true;});actions.append(button);}
 li.append(actions);list.append(li);});
 $('pdf-run').disabled=!selectedFiles.length;
}
function clearDownload(){$('pdf-word-preview').replaceChildren();$('pdf-word-preview').hidden=true;$('pdf-print').hidden=true;$('pdf-print-help').hidden=true;$('pdf-download').hidden=false;if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=undefined;}}
function openLocal(tool,trigger){
 runId++;active=tool;selectedFiles=[];previousFocus=trigger;form.reset();form.removeAttribute('aria-busy');clearDownload();result.hidden=true;status.textContent='';
 $('pdf-dialog-title').textContent=tool.title;$('pdf-dialog-description').textContent=tool.description;
 fileInput.accept=tool.word?'.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document':tool.images?'image/jpeg,image/png':'.pdf,application/pdf';fileInput.multiple=!!tool.multiple;
 if(tool.id==='scan')fileInput.setAttribute('capture','environment');else fileInput.removeAttribute('capture');
 $('pdf-page-field').hidden=!tool.pages;$('pdf-pages').required=!!tool.pages;
 $('pdf-page-hint').textContent=tool.id==='organize'?'Ex.: 3, 1-2, 4. A sequência será a mesma que você escrever.':'Ex.: 1, 3-5, 8. A primeira página é a página 1.';
 $('pdf-text-field').hidden=tool.id!=='watermark';$('pdf-text').required=tool.id==='watermark';$('pdf-angle-field').hidden=tool.id!=='rotate';
 $('pdf-limit').textContent=tool.word?'Somente DOCX, até 25 MB. A conversão usa a impressão do navegador. Fontes, tabelas e quebras de página podem mudar; confira a prévia. Arquivos .doc antigos não são aceitos.':tool.id==='pdf-word'?'Gera um DOCX de texto editável. Não preserva imagens, tabelas, colunas nem a formatação original. PDFs escaneados precisam de OCR.':tool.id==='pdf-jpg'?'PDF de até 25 MB e 40 páginas. As imagens serão baixadas em um ZIP.':tool.id==='markdown'?'Extrai texto selecionável; PDFs digitalizados precisam passar pelo OCR.':'Até 15 arquivos, 25 MB no total e 200 páginas. Seus arquivos ficam no navegador.';
 $('pdf-run').textContent=tool.word?'Preparar PDF':tool.id==='pdf-word'?'Converter para Word':tool.id==='split'||tool.id==='pdf-jpg'?'Gerar arquivo ZIP':tool.id==='markdown'?'Extrair texto':'Gerar PDF';
 renderFiles();dialog.showModal();document.documentElement.classList.add('pdf-modal-open');fileInput.focus();
}
for(const trigger of document.querySelectorAll('[data-pdf-tool]'))trigger.addEventListener('click',()=>{
 const tool=getPdfTool(trigger.dataset.pdfTool);if(tool.local){openLocal(tool,trigger);return;}
 if(!server.available||tool.ai&&!server.aiAvailable)return;
 const target=new URL(tool.path,server.baseUrl);window.open(target.href,'_blank','noopener,noreferrer');
});
$('pdf-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{runId++;clearDownload();selectedFiles=[];fileInput.value='';document.documentElement.classList.remove('pdf-modal-open');previousFocus?.focus();});
dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close();});
fileInput.addEventListener('change',()=>{result.hidden=true;status.textContent='';const incoming=Array.from(fileInput.files||[]);const files=active.multiple?[...selectedFiles,...incoming]:incoming.slice(0,1);if(files.length>15||files.reduce((sum,file)=>sum+file.size,0)>25*1024*1024){status.textContent='Selecione até 15 arquivos e 25 MB no total.';fileInput.value='';return;}if(files.some(file=>active.word?!file.name.toLowerCase().endsWith('.docx'):active.images?!['image/jpeg','image/png'].includes(file.type):!file.name.toLowerCase().endsWith('.pdf'))){status.textContent=active.word?'Use um documento .docx. Arquivos .doc antigos não são compatíveis.':active.images?'Use imagens JPG ou PNG.':'Use arquivos PDF.';fileInput.value='';return;}selectedFiles=files;fileInput.value='';renderFiles();});
async function renderPdfFiles(id,file,onProgress){
 const pdfjs=await import('pdfjs-dist/build/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdfjs/pdf.worker.min.mjs';
 const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,cMapUrl:'/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/vendor/pdfjs/standard_fonts/'}).promise;
 try{
  const max=id==='pdf-jpg'?40:200;if(doc.numPages>max)throw Error(`Use um PDF de até ${max} páginas nesta ferramenta.`);
  const zip=new JSZip(),text=[],wordPages=[];
  for(let i=1;i<=doc.numPages;i++){
   onProgress(`Processando página ${i} de ${doc.numPages}…`);const page=await doc.getPage(i);
   if(id==='markdown'||id==='pdf-word'){const content=await page.getTextContent();const lines=pdfTextLines(content.items);wordPages.push(lines);text.push(`# Página ${i}\n\n`+lines.join('\n'));}
   else{const original=page.getViewport({scale:1}),scale=Math.min(1.5,2200/Math.max(original.width,original.height)),view=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport:view,background:'white'}).promise;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw Error('Não foi possível gerar a imagem.');zip.file(`pagina-${String(i).padStart(3,'0')}.jpg`,await blob.arrayBuffer());canvas.width=canvas.height=0;}
   page.cleanup();
  }
  if(id==='pdf-word')return await createWordFromTextPages(wordPages);
  if(id==='markdown'){if(!text.join('').replace(/# Página \d+/g,'').trim())throw Error('Este PDF não tem texto selecionável. Use a ferramenta OCR primeiro.');return {blob:new Blob([text.join('\n\n')],{type:'text/markdown;charset=utf-8'}),filename:'wj-pdf-texto.md'};}
  return {blob:await zip.generateAsync({type:'blob'}),filename:'wj-pdf-imagens.zip'};
 }finally{await doc.destroy();}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!selectedFiles.length)return;const token=++runId,tool=active,files=[...selectedFiles];clearDownload();result.hidden=true;$('pdf-run').disabled=true;form.setAttribute('aria-busy','true');status.textContent='Preparando seu arquivo…';
 const progress=text=>{if(token===runId)status.textContent=text;};
 try{
  if(tool.word){
   const frame=await prepareWordPreview(files[0],$('pdf-word-preview'));if(token!==runId){frame.remove();return;}
   $('pdf-word-preview').hidden=false;$('pdf-download').hidden=true;$('pdf-print').hidden=false;$('pdf-print-help').hidden=false;$('pdf-result-size').textContent='Documento preparado. Confira a prévia e salve em PDF.';result.hidden=false;status.textContent='Prévia pronta! Clique em Salvar como PDF.';return;
  }
  const output=['pdf-jpg','markdown','pdf-word'].includes(tool.id)?await renderPdfFiles(tool.id,files[0],progress):await processPdf(tool.id,files,{pages:$('pdf-pages').value,text:$('pdf-text').value,angle:$('pdf-angle').value,onProgress:progress});if(token!==runId)return;downloadUrl=URL.createObjectURL(output.blob);$('pdf-download').href=downloadUrl;$('pdf-download').download=output.filename;$('pdf-download').textContent=`Baixar ${output.filename.endsWith('.zip')?'ZIP':output.filename.endsWith('.md')?'Markdown':output.filename.endsWith('.docx')?'Word (.docx)':'PDF'} ↓`;$('pdf-result-size').textContent=`Arquivo pronto · ${(output.blob.size/1024/1024).toFixed(2)} MB`;result.hidden=false;status.textContent='Pronto! Baixe seu arquivo abaixo.';}
 catch(error){if(token===runId)status.textContent=error.name==='PasswordException'?'Este PDF tem senha. Use a ferramenta Desbloquear PDF primeiro.':error.message||'Não foi possível processar o arquivo. Confira o documento e tente novamente.';}
 finally{if(token===runId){$('pdf-run').disabled=false;form.removeAttribute('aria-busy');}}
});
$('pdf-print').addEventListener('click',()=>{
 const frame=$('pdf-word-preview').querySelector('iframe');
 try{if(!frame?.contentWindow||typeof frame.contentWindow.print!=='function')throw Error();frame.contentWindow.focus();frame.contentWindow.print();}
 catch{status.textContent='Este navegador não abriu a impressão. Tente pelo Chrome ou Edge e escolha Salvar como PDF.';}
});
for(const id of ['pdf-pages','pdf-text','pdf-angle'])$(id).addEventListener('input',()=>{result.hidden=true;});
renderCatalog();
fetch('/api/pdf-service').then(response=>response.ok?response.json():Promise.reject()).then(config=>{if(config.available){const url=new URL(config.baseUrl);if(url.protocol==='https:'){server=config;$('pdf-server-note').textContent='As ferramentas avançadas abrem em uma nova aba no servidor da WJ. Os arquivos selecionados lá serão enviados para processamento.';}}renderCatalog();}).catch(()=>{});
