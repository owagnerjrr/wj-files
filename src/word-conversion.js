import JSZip from 'jszip';
export async function inspectDocx(bytes){
 let zip;try{zip=await JSZip.loadAsync(bytes);}catch{throw Error('Este arquivo não é um DOCX válido. Abra no Word e salve como .docx.');}
 if(!zip.file('word/document.xml'))throw Error('Selecione um documento Word no formato .docx. Arquivos antigos .doc não são compatíveis.');
 const entries=Object.values(zip.files);const total=entries.reduce((sum,entry)=>sum+(entry._data?.uncompressedSize||0),0);
 if(entries.length>2500||total>100*1024*1024)throw Error('Este DOCX é muito complexo ou grande. Use um documento menor.');
 return zip;
}
export function pdfTextLines(items){
 const lines=[];let line='',lastY;
 for(const item of items){if(typeof item.str!=='string')continue;const y=item.transform?.[5];if(line&&lastY!==undefined&&y!==undefined&&Math.abs(y-lastY)>3){lines.push(line.trim());line='';}line+=item.str+(item.hasEOL?'':' ');lastY=y;if(item.hasEOL){lines.push(line.trim());line='';lastY=undefined;}}
 if(line.trim())lines.push(line.trim());return lines;
}
export async function createWordFromTextPages(pages){
 if(!pages.some(lines=>lines.some(line=>line.trim())))throw Error('Este PDF não tem texto selecionável. PDFs escaneados precisam de OCR antes da conversão para Word.');
 const {Document,Packer,Paragraph,TextRun}=await import('docx');
 const children=[];
 pages.forEach((lines,pageIndex)=>{const content=lines.length?lines:['[Página sem texto selecionável]'];content.forEach((line,index)=>children.push(new Paragraph({children:[new TextRun(line)],pageBreakBefore:pageIndex>0&&index===0,spacing:{after:120}})));});
 const doc=new Document({creator:'WJ Tecnologia',title:'Texto extraído de PDF',description:'Conversão de texto. A diagramação e as imagens do PDF original não são preservadas.',sections:[{properties:{},children}]});
 return {blob:await Packer.toBlob(doc),filename:'wj-pdf-texto.docx'};
}
export async function prepareWordPreview(file,container){
 const bytes=await file.arrayBuffer();await inspectDocx(bytes);
 const {renderAsync}=await import('docx-preview');
 const frame=document.createElement('iframe');frame.className='word-pdf-preview';frame.title='Prévia do documento Word para salvar em PDF';frame.setAttribute('sandbox','allow-same-origin allow-modals');container.replaceChildren(frame);
 const doc=frame.contentDocument;
 doc.open();doc.write(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; font-src data: blob:; style-src 'unsafe-inline';"><title>WJ PDF — Documento</title><style>body{margin:0;background:#e2e7ed}*{box-sizing:border-box}@media screen{.docx-wrapper{padding:14px!important}section.docx{zoom:.65;margin:0 auto 14px!important}}@media screen and (max-width:450px){section.docx{zoom:.4}}@media print{@page{margin:0}body{background:white}.docx-wrapper{background:white!important;padding:0!important}section.docx{box-shadow:none!important;margin:0!important;break-after:page}section.docx:last-child{break-after:auto}}</style></head><body><main id="document-content"></main></body></html>`);doc.close();
 try{
  await renderAsync(bytes,doc.getElementById('document-content'),doc.head,{className:'docx',inWrapper:true,hideWrapperOnPrint:true,breakPages:true,ignoreLastRenderedPageBreak:false,renderAltChunks:false,useBase64URL:true,ignoreFonts:false});
  for(const link of doc.querySelectorAll('a'))link.removeAttribute('href');
  await doc.fonts?.ready;
  await Promise.allSettled(Array.from(doc.images,image=>image.decode?.()));
  return frame;
 }catch{frame.remove();throw Error('Não foi possível preparar este DOCX. Tente salvar uma nova cópia no Word e converter novamente.');}
}
