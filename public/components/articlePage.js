import {publishedArticles,articleUrl,categoryLabels,formatDate,makeCover} from './newsFeed.js';
import {isTresCoracoes} from '../services/localNewsService.js';
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el};
const external=(text,url)=>{const a=node('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
export function renderArticle(app,slug){
 const article=publishedArticles().find(a=>a.slug===slug);app.replaceChildren();const container=node('article',null,'portal-container article-page');app.append(container);
 const back=node('a','← Todas as notícias','article-back');back.href='/noticias';container.append(back);
 if(!article){document.title='Notícia não encontrada — WJ Files';container.append(node('h1','Notícia não encontrada'),node('p','Esta publicação não está disponível.'));return}
 if(isTresCoracoes(article)){back.href='/tres-coracoes';back.textContent='← Notícias de Três Corações'}
 document.title=article.title+' — WJ Files';document.querySelector('meta[name="description"]').content=article.subtitle;
 const header=node('header',null,'article-heading');header.append(node('span',categoryLabels[article.category]||article.category,'category-label'),node('h1',article.title),node('p',article.subtitle,'article-deck'));
 const byline=node('p',article.author+' · Publicado no WJ Files em ','article-byline');const time=node('time',formatDate(article.publishedAt));time.dateTime=article.publishedAt;byline.append(time);header.append(byline);container.append(header);
 const figure=node('figure',null,'article-cover');const credit=node('figcaption');
 const fallback=()=>credit.replaceChildren(node('span',isTresCoracoes(article)?'Ilustração editorial original WJ Files. Não é uma fotografia da cidade.':'Ilustração editorial original WJ Files. Não é uma captura do jogo ou produto.'));
 if(article.coverImage&&article.imageCredit)credit.append(external(article.imageCredit.text,article.imageCredit.url));else fallback();
 figure.append(makeCover(article,{priority:true,onFallback:fallback}),credit);container.append(figure);
 const body=node('div',null,'article-body');for(const block of article.content){const section=node('section');if(block.heading)section.append(node('h2',block.heading));section.append(node('p',block.text));body.append(section)}container.append(body);
 for(const video of article.videos||[]){const section=node('section',null,'article-video');section.append(node('h2',video.title));const holder=node('div',null,'video-frame');const button=node('button','▶ Carregar vídeo oficial');button.type='button';button.onclick=()=>{const iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+video.youtubeId;iframe.title=video.title;iframe.allow='encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';holder.replaceChildren(iframe)};holder.append(button);section.append(holder,node('p',video.credit),external('Assistir no YouTube ↗','https://www.youtube.com/watch?v='+video.youtubeId));section.append(node('p','Se o player estiver indisponível, utilize o link acima.','video-help'));container.append(section)}
 const sources=node('section',null,'article-sources');sources.append(node('h2',article.sources.length>1?'Fontes da notícia':'Fonte da notícia'));for(const source of article.sources){const box=node('div',null,'source-card');box.append(node('strong',source.name),node('p',source.title),node('p',source.publishedAt?'Publicado em: '+formatDate(source.publishedAt):'Data de publicação não informada pela fonte.'),external('Ver publicação original ↗',source.url));sources.append(box)}container.append(sources);
 const tags=node('nav',null,'news-filters');tags.setAttribute('aria-label','Assuntos desta notícia');for(const tag of article.tags){const a=node('a',tag);a.href='/noticias?tema='+encodeURIComponent(tag);tags.append(a)}container.append(tags);
 const related=publishedArticles().filter(a=>(article.relatedContent||[]).includes(a.slug));if(related.length){const section=node('section',null,'article-related');section.append(node('h2','Continue no arquivo'));for(const item of related){const a=node('a',item.title+' →');a.href=articleUrl(item);section.append(a)}container.append(section)}
}
