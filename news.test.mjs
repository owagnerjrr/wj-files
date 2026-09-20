import test from 'node:test';
import assert from 'node:assert/strict';
import {articles} from './public/data/articles.js';
import {filterArticles,articleUrl,publishedArticles} from './public/components/newsFeed.js';
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
