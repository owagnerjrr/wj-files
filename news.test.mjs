import test from 'node:test';
import assert from 'node:assert/strict';
import {articles} from './public/data/articles.js';
import {filterArticles,articleUrl,publishedArticles} from './public/components/newsFeed.js';
import {selectHomeStories} from './public/services/homeService.js';

test('cadastro permite somente tipos de destaque conhecidos e um principal',()=>{
 assert.ok(articles.filter(a=>a.status==='published'&&a.featuredType==='primary').length<=1);
 for(const a of articles)assert.ok(a.featuredType===undefined||['none','primary','secondary'].includes(a.featuredType));
});
const sample=(slug,featuredType,status='published',publishedAt='2026-09-20')=>({slug,storyKey:slug,featuredType,status,publishedAt});
test('Home prioriza escolhas editoriais sem duplicar destaques e preserva a ordem das últimas',()=>{
 const input=[sample('new','secondary','published','2026-09-22'),sample('lead','primary'),sample('other','secondary')];
 const before=structuredClone(input),result=selectHomeStories(input);
 assert.equal(result.primary.slug,'lead');assert.deepEqual(result.secondary.map(a=>a.slug),['new','other']);
 assert.equal(result.latest[0].slug,'new');assert.deepEqual(input,before);
});
test('Home suporta cadastro antigo, vazio, não publicados e exclusão explícita dos destaques',()=>{
 assert.deepEqual(selectHomeStories([]),{primary:null,secondary:[],latest:[]});
 const result=selectHomeStories([sample('draft','primary','draft'),sample('rejected','secondary','rejected'),sample('hidden','none'),sample('legacy')]);
 assert.equal(result.primary.slug,'legacy');assert.deepEqual(result.secondary,[]);
 assert.deepEqual(result.latest.map(a=>a.slug),['hidden','legacy']);
 assert.equal(selectHomeStories([sample('hidden','none')]).primary,null);
});
test('Home resolve múltiplos principais deterministicamente e deduplica acontecimentos',()=>{
 const result=selectHomeStories([sample('b','primary'),sample('a','primary'),{...sample('duplicate','secondary'),storyKey:'a'}]);
 assert.equal(result.primary.slug,'a');assert.deepEqual(result.secondary.map(a=>a.slug),['b']);
 assert.equal(result.latest.length,2);
});
test('matérias têm fontes, datas válidas e identidade única por acontecimento',()=>{
 for(const key of ['slug','storyKey'])assert.equal(new Set(articles.map(a=>a[key])).size,articles.length);
 for(const a of articles){assert.match(a.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(a.content.length>=4);assert.ok(Number.isFinite(Date.parse(a.publishedAt)));assert.ok(a.sources.length);for(const s of a.sources){assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.title&&s.name);if(s.publishedAt)assert.ok(new Date(s.publishedAt)<=new Date(a.publishedAt))}if(a.coverImage)assert.ok(a.imageCredit?.url);for(const v of a.videos){assert.match(v.youtubeId,/^[\w-]{11}$/);assert.equal(new URL(v.sourceUrl).protocol,'https:')}for(const slug of a.relatedContent)assert.ok(articles.some(b=>b.slug===slug));assert.ok(articleUrl(a).startsWith('/noticias/'))}
});
test('filtros combinam editoria e assunto sem ocultar a opção todas',()=>{
 assert.equal(filterArticles({topic:'Últimas notícias'}).length,3);
 assert.equal(filterArticles({topic:'Nintendo'}).length,2);
 assert.equal(filterArticles({topic:'PlayStation'}).length,1);
 assert.equal(filterArticles({topic:'Xbox'}).length,1);
 assert.equal(filterArticles({topic:'Hardware'}).length,1);
 assert.equal(filterArticles({category:'games',topic:'Hardware'}).length,0);
 assert.equal(filterArticles({topic:'Cinema e Séries'}).length,0);
 assert.deepEqual(publishedArticles().map(a=>a.publishedAt),publishedArticles().map(a=>a.publishedAt).sort().reverse());
});
