const form=document.getElementById('recommend-filters');
const cards=[...document.querySelectorAll('[data-recommendation]')];
const sections=[...document.querySelectorAll('[data-section]')];
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(){
 const term=normalize(form.querySelector('input').value.trim());
 const type=document.getElementById('recommend-type').value,category=document.getElementById('recommend-category').value;
 let total=0;
 for(const card of cards){card.hidden=!!((type&&card.dataset.type!==type)||(category&&card.dataset.category!==category)||!normalize(card.dataset.search).includes(term));if(!card.hidden)total++;}
 const filtering=!!(term||type||category);
 for(const section of sections)section.hidden=filtering?!cards.some(card=>!card.hidden&&section.contains(card)):false;
 document.getElementById('recommend-count').textContent=cards.length||filtering?`${total} indicaç${total===1?'ão':'ões'} encontrada${total===1?'':'s'}.`:'Estamos preparando as primeiras indicações.';
 document.getElementById('recommend-no-results').hidden=!filtering||total>0;
}
form.hidden=false;form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('reset',()=>queueMicrotask(filter));
