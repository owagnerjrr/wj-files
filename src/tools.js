import QRCode from 'qrcode';
const $=id=>document.getElementById(id);
const shortOrigin=location.hostname==='www.wjfiles.com.br'?'https://wjfiles.com.br':location.origin;
const qrForm=$('qr-form'), qrText=$('qr-text'), canvas=$('qr-canvas'), qrResult=$('qr-result'), qrStatus=$('qr-status');
let qrValue='';
qrForm.addEventListener('submit', async event=>{
  event.preventDefault();qrResult.hidden=true;qrStatus.textContent='';
  const text=qrText.value.trim();
  if(!text){qrStatus.textContent='Digite um texto ou cole um link para gerar o QR Code.';qrText.focus();return;}
  if(new TextEncoder().encode(text).length>1500){qrStatus.textContent='Este conteúdo é muito longo. Use um texto ou link menor.';return;}
  try {await QRCode.toCanvas(canvas,text,{width:640,margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}});qrValue=text;qrResult.hidden=false;qrStatus.textContent='QR Code pronto! Você já pode baixar a imagem.';}catch{qrStatus.textContent='Não foi possível gerar este QR Code. Tente um texto menor.';}
});
qrText.addEventListener('input',()=>{qrResult.hidden=true;qrStatus.textContent='';qrValue='';});
$('qr-download').addEventListener('click',()=>{if(!qrValue)return;const link=document.createElement('a');link.href=canvas.toDataURL('image/png');link.download='qr-code-wj-tecnologia.png';link.click();});
const shortForm=$('short-form'),shortInput=$('short-url'),shortStatus=$('short-status'),shortResult=$('short-result'),shortOutput=$('short-output'),shortButton=$('short-submit');
shortInput.addEventListener('input',()=>{shortResult.hidden=true;shortStatus.textContent='';});
shortForm.addEventListener('submit',async event=>{
  event.preventDefault();shortResult.hidden=true;shortStatus.textContent='';
  let url;try{url=new URL(shortInput.value.trim());if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{shortStatus.textContent='Cole um link completo, começando com https:// ou http://.';shortInput.focus();return;}
  shortButton.disabled=true;shortButton.textContent='Encurtando…';
  try{const response=await fetch('/api/shorten',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url.href}),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Não foi possível encurtar o link.');if(!/^[\w-]{6,8}$/.test(data.code))throw Error('Resposta inválida. Tente novamente.');shortOutput.value=`${shortOrigin}/s/${data.code}`;$('short-open').href=shortOutput.value;shortResult.hidden=false;shortStatus.textContent='Link criado e salvo! Copie para compartilhar.';}catch(error){shortStatus.textContent=error.name==='TimeoutError'?'A conexão demorou. Tente novamente.':error.message||'Confira sua conexão e tente novamente.';}finally{shortButton.disabled=false;shortButton.textContent='Encurtar link';}
});
$('short-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shortOutput.value);shortStatus.textContent='Link copiado!';}catch{shortOutput.focus();shortOutput.select();shortStatus.textContent='Selecione e copie o link acima.';}});
$('short-qr').addEventListener('click',()=>{qrText.value=shortOutput.value;qrForm.requestSubmit();$('qr-tool').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
