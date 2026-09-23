import {articles} from '../data/articles.js';
export const newsTopics=['Games','Nintendo','PlayStation','Xbox','PC','Hardware','Tecnologia','Cinema e Séries'];
export const categoryLabels={games:'Games',tecnologia:'Tecnologia',filmes:'Cinema e Séries',series:'Cinema e Séries'};
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const publishedArticles=()=>articles.filter(a=>a.status==='published').sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
export const articleUrl=a=>'/noticias/'+encodeURIComponent(a.slug);
export const formatDate=s=>new Date(s.length===10?s+'T12:00:00-03:00':s).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'long',year:'numeric'});
export function filterArticles({category,topic}={},items=publishedArticles()){
 const term=normalized(topic);return items.filter(a=>(!category||a.category===category)&&(!term||term==='ultimas noticias'||[...(a.tags||[]),categoryLabels[a.category],a.category].some(t=>normalized(t)===term)));
}
export function illustration(item){
 const colors={circuit:['#122529','#87d9b2','CIRCUITOS / IDEIAS'],cave:['#17221b','#c7b96d','MUNDOS / EXPLORAÇÃO'],detective:['#21212a','#d4c5ab','ARQUIVO / INVESTIGAÇÃO']};
 const [bg,fg,label]=colors[item.illustration]||colors.detective;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="${bg}"/><g fill="none" stroke="${fg}" stroke-width="6"><path d="M80 100h200v80h120M880 440H690v-80H570M80 440h130v-60M880 100H730v80"/><rect x="370" y="160" width="220" height="180"/><path d="M410 210h140M410 250h90M410 290h120M420 130v30m60-30v30m60-30v30M420 340v30m60-30v30m60-30v30"/></g><g fill="${fg}"><rect x="80" y="80" width="18" height="18"/><rect x="862" y="422" width="18" height="18"/><text x="60" y="485" font-family="monospace" font-size="25">${label}</text><text x="60" y="54" font-family="monospace" font-size="20">WJ FILES / ILUSTRAÇÃO EDITORIAL</text></g></svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function makeCover(item,{priority=false,onFallback}={}){
 const img=document.createElement('img');img.src=item.coverImage||illustration(item);img.alt=item.coverImage?item.title:'Ilustração editorial WJ Files; não representa uma captura do jogo ou produto';img.width=960;img.height=540;img.loading=priority?'eager':'lazy';img.decoding='async';if(priority)img.fetchPriority='high';
 img.onerror=()=>{img.onerror=null;img.src=illustration(item);img.alt='Ilustração editorial WJ Files';onFallback?.()};return img;
}
export function mountNewsFilters(root,selected){
 const nav=document.createElement('nav');nav.className='news-filters';nav.setAttribute('aria-label','Filtrar notícias');
 for(const label of ['Todas',...newsTopics]){const a=document.createElement('a');a.textContent=label;a.href=label==='Todas'?'/noticias':'/noticias?tema='+encodeURIComponent(label);if(normalized(selected||'Todas')===normalized(label)||(!selected&&label==='Todas')||selected==='Últimas notícias'&&label==='Todas')a.setAttribute('aria-current','page');nav.append(a)}root.replaceWith(nav);
}
export function mountNewsFeed(root,options={}){
 const {pageSize=6}=options;const items=filterArticles(options,options.items||publishedArticles());let visible=pageSize;root.className='news-feed';
 function draw(){root.replaceChildren();if(!items.length){const p=document.createElement('p');p.className='editorial-empty';p.textContent='Nenhuma matéria publicada para este assunto ainda.';root.append(p);return}
 for(const item of items.slice(0,visible)){const a=document.createElement('a');a.className='news-row';a.href=articleUrl(item);a.append(makeCover(item));const body=document.createElement('div');
 for(const [tag,text,cls] of [['span',categoryLabels[item.category]||item.category,'category-label'],['h3',item.title,''],['p',item.subtitle,'news-summary'],['time',formatDate(item.publishedAt),''],['span','Ler notícia →','news-read']]){const node=document.createElement(tag);node.textContent=text;node.className=cls;if(tag==='time')node.dateTime=item.publishedAt;body.append(node)}a.append(body);root.append(a)}
 if(visible<items.length){const button=document.createElement('button');button.className='load-more';button.textContent='Carregar mais';button.onclick=()=>{visible+=pageSize;draw();root.querySelectorAll('.news-row')[visible-pageSize]?.focus()};root.append(button)}}draw();
}
