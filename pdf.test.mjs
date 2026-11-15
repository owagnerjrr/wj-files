import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument,rgb} from 'pdf-lib';
import JSZip from 'jszip';
import {processPdf,pageSelection,loadPdf} from './src/pdf-operations.js';
import {pdfServiceConfig} from './api/pdf-service.js';
import {pdfTools} from './public/pdf-catalog.js';
const file=(bytes,name='amostra.pdf',type='application/pdf')=>({size:bytes.length,name,type,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
async function fixture(){const doc=await PDFDocument.create();for(let i=0;i<3;i++){const page=doc.addPage([300+i*20,400]);page.drawRectangle({x:20,y:20,width:40,height:40,color:rgb(.1*i,.3,.8)});page.drawText(`Pagina ${i+1}`,{x:40,y:200});}return file(await doc.save());}
const resultPdf=async result=>PDFDocument.load(await result.blob.arrayBuffer());
test('seleção respeita intervalos, sequência e rejeita páginas inválidas',()=>{assert.deepEqual(pageSelection('3,1-2',3),[2,0,1]);assert.deepEqual(pageSelection('',3),[0,1,2]);assert.deepEqual(pageSelection('1,1',3,{allowDuplicates:true}),[0,0]);for(const text of ['0','4','2-1','1,1','a','1,'])assert.throws(()=>pageSelection(text,3));});
test('junta arquivos e mantém a ordem de entrada',async()=>{const input=await fixture();const output=await resultPdf(await processPdf('merge',[input,input]));assert.equal(output.getPageCount(),6);assert.equal(output.getPage(2).getWidth(),340);assert.equal(output.getPage(3).getWidth(),300);});
test('extrai, remove e reorganiza páginas corretamente',async()=>{const input=await fixture();let out=await resultPdf(await processPdf('extract',[input],{pages:'1,3'}));assert.deepEqual(out.getPages().map(p=>p.getWidth()),[300,340]);out=await resultPdf(await processPdf('remove',[input],{pages:'2'}));assert.deepEqual(out.getPages().map(p=>p.getWidth()),[300,340]);out=await resultPdf(await processPdf('organize',[input],{pages:'3,1-2'}));assert.deepEqual(out.getPages().map(p=>p.getWidth()),[340,300,320]);await assert.rejects(processPdf('remove',[input],{pages:'1-3'}),/pelo menos uma/);});
test('divide páginas em PDFs independentes no ZIP',async()=>{const output=await processPdf('split',[await fixture()]);const zip=await JSZip.loadAsync(await output.blob.arrayBuffer());assert.equal(Object.keys(zip.files).length,3);const page=await PDFDocument.load(await zip.file('pagina-002.pdf').async('uint8array'));assert.equal(page.getPageCount(),1);assert.equal(page.getPage(0).getWidth(),320);});
test('gira, numera e adiciona marca d’água sem perder páginas',async()=>{const input=await fixture();const rotated=await resultPdf(await processPdf('rotate',[input],{angle:'90'}));assert.ok(rotated.getPages().every(page=>page.getRotation().angle===90));for(const id of ['numbers','watermark']){const out=await resultPdf(await processPdf(id,[input],{text:'CONFIDENCIAL'}));assert.equal(out.getPageCount(),3);}await assert.rejects(processPdf('watermark',[input],{text:'🚀'}),/sem emojis/);});
test('converte imagem PNG para PDF A4 e rejeita arquivos inválidos',async()=>{const {createCanvas}=await import('@napi-rs/canvas');const canvas=createCanvas(80,60),context=canvas.getContext('2d');context.fillStyle='#1488bb';context.fillRect(0,0,80,60);const png=file(new Uint8Array(canvas.toBuffer('image/png')),'foto.png','image/png');const out=await resultPdf(await processPdf('images',[png,png]));assert.equal(out.getPageCount(),2);assert.ok(Math.abs(out.getPage(0).getWidth()-595.28)<.01);await assert.rejects(loadPdf(new Uint8Array([1,2,3])),/Não foi possível abrir/);});
test('renderizador PDF lê texto e produz imagem real a partir do resultado',async()=>{const {createCanvas,DOMMatrix,ImageData,Path2D}=await import('@napi-rs/canvas');Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');const input=await fixture();const doc=await pdfjs.getDocument({data:new Uint8Array(await input.arrayBuffer()),useSystemFonts:true,isEvalSupported:false}).promise;try{const page=await doc.getPage(1);const content=await page.getTextContent();assert.ok(content.items.some(item=>item.str==='Pagina 1'));const view=page.getViewport({scale:1});const canvas=createCanvas(view.width,view.height);await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport:view}).promise;assert.ok(canvas.toBuffer('image/jpeg').length>1000);}finally{await doc.destroy();}});
test('servidor avançado fica indisponível sem URL HTTPS válida; catálogo tem 14 funções locais',()=>{for(const url of [undefined,'http://local','javascript:alert(1)','https://x.example/path','https://user:pass@x.example/'])assert.equal(pdfServiceConfig({WJ_PDF_SERVER_URL:url}).available,false);assert.deepEqual(pdfServiceConfig({WJ_PDF_SERVER_URL:'https://pdf.example.com/'}),{available:true,baseUrl:'https://pdf.example.com',aiAvailable:false});assert.equal(pdfTools.filter(tool=>tool.local).length,14);assert.equal(new Set(pdfTools.map(tool=>tool.id)).size,pdfTools.length);});
test('PDF para Word gera DOCX editável com acentos, texto, parágrafos e páginas',async()=>{
 const {createWordFromTextPages,pdfTextLines,inspectDocx}=await import('./src/word-conversion.js');
 const lines=pdfTextLines([{str:'Olá,',transform:[1,0,0,1,20,100]},{str:'tecnologia!',transform:[1,0,0,1,60,100],hasEOL:true},{str:'Segunda linha',transform:[1,0,0,1,20,80],hasEOL:true}]);
 assert.deepEqual(lines,['Olá, tecnologia!','Segunda linha']);
 const result=await createWordFromTextPages([lines,['Outra página com ação & café.']]);assert.equal(result.filename,'wj-pdf-texto.docx');
 const zip=await inspectDocx(await result.blob.arrayBuffer());const xml=await zip.file('word/document.xml').async('string');
 assert.ok(xml.includes('Olá, tecnologia!'));assert.ok(xml.includes('ação &amp; café.'));assert.ok(xml.includes('pageBreakBefore'));assert.ok(!xml.includes('w:drawing'));
 await assert.rejects(createWordFromTextPages([[]]),/OCR/);
});
test('Word para PDF aceita apenas um pacote DOCX válido e mantém tabelas na fonte',async()=>{
 const {Document,Packer,Paragraph,Table,TableRow,TableCell}=await import('docx');const {inspectDocx}=await import('./src/word-conversion.js');
 const doc=new Document({sections:[{children:[new Paragraph('Título com acentuação'),new Table({rows:[new TableRow({children:[new TableCell({children:[new Paragraph('Nome')]}),new TableCell({children:[new Paragraph('Valor') ]})]})]})]}]});
 const bytes=await Packer.toBuffer(doc);const zip=await inspectDocx(bytes);assert.ok((await zip.file('word/document.xml').async('string')).includes('<w:tbl>'));
 await assert.rejects(inspectDocx(new Uint8Array([1,2,3])),/DOCX válido/);
 const bad=new JSZip();bad.file('qualquer.txt','Não é Word');await assert.rejects(inspectDocx(await bad.generateAsync({type:'uint8array'})),/documento Word/);
});
test('ferramentas externas apontam diretamente ao iLovePDF e funcionam como links nativos',async()=>{
 const {readFile}=await import('node:fs/promises');
 const external=pdfTools.filter(tool=>!tool.local);
 assert.equal(external.length,19);
 assert.equal(new Set(external.map(tool=>tool.externalUrl)).size,19);
 const html=await readFile('public/pdf.html','utf8');
 for(const tool of external){
  const url=new URL(tool.externalUrl);assert.equal(url.origin,'https://www.ilovepdf.com');assert.ok(url.pathname.startsWith('/pt/'));
  const card=html.match(new RegExp(`<a[^>]*data-pdf-tool="${tool.id}"[^>]*>`))?.[0];
  assert.ok(card,`${tool.id}: deve ser um link`);assert.ok(card.includes(`href="${tool.externalUrl}"`));assert.ok(card.includes('target="_blank"'));assert.ok(card.includes('rel="noopener noreferrer"'));assert.ok(card.includes('abre em nova aba'));assert.ok(!card.includes('disabled'));
 }
 assert.deepEqual(pdfTools.slice(0,2).map(tool=>tool.id),['word-pdf','pdf-word']);
 assert.ok(!html.includes('em preparação'));assert.ok(!html.includes('ativação do servidor'));
 const client=await readFile('src/pdf-tools.js','utf8');assert.ok(!client.includes('/api/pdf-service'));assert.ok(!client.includes('window.open'));
});
