import {articles} from '../data/articles.js';
export const publishedArticles=()=>articles.filter(a=>a.status==='published').sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
export function mountNewsFeed(root,{category,topic,pageSize=6}={}){
 const items=publishedArticles().filter(a=>(!category||a.category===category)&&(!topic||(a.tags||[]).includes(topic)));let visible=pageSize;
 if(!items.length)return;
 function draw(){root.replaceChildren();for(const item of items.slice(0,visible)){const a=document.createElement('a');a.className='news-row';a.href='/noticias/'+encodeURIComponent(item.slug);if(item.coverImage){const img=document.createElement('img');img.src=item.coverImage;img.alt=item.title;img.loading='lazy';a.append(img)}const body=document.createElement('div');for(const [tag,text,cls] of [['span',item.category,'category-label'],['h3',item.title,''],['p',item.subtitle,''],['time',new Date(item.publishedAt).toLocaleString('pt-BR'),'']]){const node=document.createElement(tag);node.textContent=text;node.className=cls;if(tag==='time')node.dateTime=item.publishedAt;body.append(node)}a.append(body);root.append(a)}if(visible<items.length){const button=document.createElement('button');button.className='load-more';button.textContent='Carregar mais';button.onclick=()=>{visible+=pageSize;draw()};root.append(button)}}draw();
}
