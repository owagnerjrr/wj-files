// Identidade recuperada da arte original enviada por Wagner.
document.querySelectorAll('.brand').forEach(brand=>{
  brand.innerHTML='<span class="original-brand" role="img" aria-label="WJ Files — Explorando o desconhecido"></span>';
});
if(location.pathname==='/'){
  document.body.classList.add('original-theme');
  const hero=document.querySelector('.hero');
  hero.innerHTML=`<div class="original-art"><img src="/assets/wj-files-original.png" alt="WJ Files — Explorando o desconhecido. Arte original com arquivos confidenciais, floresta e discos voadores."></div><div class="archive-intro"><p class="eyebrow"><span class="live-dot"></span> Arquivo aberto / WJ Files</p><h1>Todo mistério<br>começa com<br><em>uma pergunta.</em></h1><p class="intro">Games, tecnologia, filmes e histórias que desafiam o comum. Bem-vindo ao nosso arquivo do desconhecido.</p><a class="button" href="#arquivo">Acessar os arquivos <span>↗</span></a><div class="file-stamp">EXPLORANDO O DESCONHECIDO</div></div>`;
  const calendar=document.createElement('section');
  calendar.className='archive-calendar section';
  calendar.setAttribute('aria-label','Calendário');
  calendar.innerHTML=`<div class="calendar-heading"><p class="eyebrow">Registro temporal / Calendário</p><h2>O arquivo de cada dia.</h2><p>A curiosidade não tira folga.</p><button class="today-button">Voltar para hoje</button></div><div class="calendar"><div class="calendar-controls"><button id="previous-month" aria-label="Mês anterior">←</button><h3 id="calendar-month" aria-live="polite"></h3><button id="next-month" aria-label="Próximo mês">→</button></div><div class="weekdays">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<span>${d}</span>`).join('')}</div><div id="calendar-days"></div><p class="calendar-caption">Data atual destacada · Sem eventos cadastrados</p></div>`;
  document.querySelector('.archive').before(calendar);
  const today=new Date();let month=new Date(today.getFullYear(),today.getMonth(),1);
  function draw(){
    document.querySelector('#calendar-month').textContent=month.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    const offset=month.getDay(),count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    document.querySelector('#calendar-days').innerHTML=Array.from({length:offset},()=>'<span class="blank" aria-hidden="true"></span>').join('')+Array.from({length:count},(_,i)=>{const current=i+1===today.getDate()&&month.getMonth()===today.getMonth()&&month.getFullYear()===today.getFullYear();return `<span class="${current?'current-day':''}" ${current?'aria-current="date"':''}>${i+1}</span>`}).join('');
  }
  document.querySelector('#previous-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);draw()};
  document.querySelector('#next-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);draw()};
  document.querySelector('.today-button').onclick=()=>{month=new Date(today.getFullYear(),today.getMonth(),1);draw()};draw();
}
