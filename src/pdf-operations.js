import {PDFDocument, StandardFonts, degrees, rgb} from 'pdf-lib';
import JSZip from 'jszip';
export function pageSelection(value,count,{allowDuplicates=false}={}){
 if(!value.trim())return Array.from({length:count},(_,i)=>i);
 const pages=[];
 for(const part of value.split(',')){
  const match=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!match)throw Error('Use números e intervalos, como 1, 3-5, 8.');
  const start=Number(match[1]),end=Number(match[2]||start);
  if(start<1||end>count||start>end)throw Error(`Escolha páginas entre 1 e ${count}, com os intervalos em ordem crescente.`);
  for(let page=start;page<=end;page++)pages.push(page-1);
 }
 if(pages.length>200)throw Error('Selecione até 200 páginas por vez.');
 if(!allowDuplicates&&new Set(pages).size!==pages.length)throw Error('Há páginas repetidas. Revise a seleção.');
 return pages;
}
export async function loadPdf(bytes){
 try{const doc=await PDFDocument.load(bytes);if(doc.getPageCount()>200)throw Error('Use um PDF com até 200 páginas nesta ferramenta.');return doc;}
 catch(error){if(error.message?.includes('200 páginas'))throw error;if(error.message?.includes('encrypted'))throw Error('Este PDF tem senha. Use a ferramenta Desbloquear PDF primeiro.');throw Error('Não foi possível abrir este PDF. Confira se o arquivo está completo e não está protegido por senha.');}
}
export async function processPdf(id,files,options={}){
 if(!files.length)throw Error('Selecione pelo menos um arquivo.');
 if(files.length>15||files.reduce((sum,f)=>sum+f.size,0)>25*1024*1024)throw Error('Use até 15 arquivos e 25 MB no total.');
 const out=await PDFDocument.create();
 if(id==='images'||id==='scan'){
  for(const file of files){const bytes=await file.arrayBuffer();let image;
   try{image=file.type==='image/png'?await out.embedPng(bytes):await out.embedJpg(bytes);}catch{throw Error('Use imagens JPG ou PNG válidas.');}
   const page=out.addPage([595.28,841.89]),scale=Math.min(555.28/image.width,801.89/image.height);const width=image.width*scale,height=image.height*scale;
   page.drawImage(image,{x:(page.getWidth()-width)/2,y:(page.getHeight()-height)/2,width,height});
  }
 }else if(id==='merge'){
  let total=0;for(const file of files){const doc=await loadPdf(await file.arrayBuffer());total+=doc.getPageCount();if(total>200)throw Error('Junte até 200 páginas por vez.');const pages=await out.copyPages(doc,doc.getPageIndices());pages.forEach(page=>out.addPage(page));}
 }else{
  const doc=await loadPdf(await files[0].arrayBuffer()),count=doc.getPageCount();
  if(id==='split'){
   const zip=new JSZip();for(let i=0;i<count;i++){const part=await PDFDocument.create();const [page]=await part.copyPages(doc,[i]);part.addPage(page);zip.file(`pagina-${String(i+1).padStart(3,'0')}.pdf`,await part.save());options.onProgress?.(`Separando página ${i+1} de ${count}…`);}
   return {blob:await zip.generateAsync({type:'blob'}),filename:'wj-pdf-paginas.zip'};
  }
  let selected=doc.getPageIndices();
  if(['extract','remove','organize'].includes(id)){selected=pageSelection(options.pages||'',count,{allowDuplicates:id==='organize'});if(id==='remove'){const excluded=new Set(selected);selected=doc.getPageIndices().filter(i=>!excluded.has(i));if(!selected.length)throw Error('Mantenha pelo menos uma página no documento.');}}
  const pages=await out.copyPages(doc,selected);pages.forEach(page=>out.addPage(page));
  if(id==='rotate'){const angle=Number(options.angle);if(![90,180,270].includes(angle))throw Error('Escolha um ângulo válido.');for(const page of pages)page.setRotation(degrees((page.getRotation().angle+angle)%360));}
  if(id==='numbers'||id==='watermark'){
   const font=await out.embedFont(StandardFonts.Helvetica);
   const text=(options.text||'').trim();if(id==='watermark'&&!text)throw Error('Digite o texto da marca d’água.');
   if(text.length>80)throw Error('Use uma marca d’água com até 80 caracteres.');
   try{font.encodeText(text);}catch{throw Error('Use letras, números e pontuação comum na marca d’água, sem emojis.');}
   pages.forEach((page,index)=>{const {width,height}=page.getSize();if(id==='numbers'){const label=`${index+1} / ${pages.length}`;page.drawText(label,{x:(width-font.widthOfTextAtSize(label,10))/2,y:18,size:10,font,color:rgb(.25,.25,.25)});}else{const size=Math.min(42,(width-50)/Math.max(font.widthOfTextAtSize(text,1),1));page.drawText(text,{x:(width-font.widthOfTextAtSize(text,size))/2,y:height/2,size,font,color:rgb(.35,.35,.35),opacity:.25});}});
  }
 }
 return {blob:new Blob([await out.save()],{type:'application/pdf'}),filename:`wj-pdf-${id}.pdf`};
}
