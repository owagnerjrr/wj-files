import {isTresCoracoes, localTopics} from '../public/services/localNewsService.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function assertSlug(slug) {
  if (!slugPattern.test(slug || '') || slug.length > 100) throw new Error('Use um slug de até 100 caracteres: letras minúsculas, números e hífens.');
  return slug;
}
const text = value => typeof value === 'string' && value.trim().length > 0;
const https = value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; } };
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value.slice(0,10)+'T12:00:00Z').toISOString().slice(0,10) === value.slice(0,10);

export function validatePublication(article, existing = []) {
  assertSlug(article.slug);
  for (const field of ['storyKey', 'title', 'subtitle', 'author']) if (!text(article[field])) throw new Error(`Preencha ${field}.`);
  if (!['draft','published'].includes(article.status)) throw new Error('Reabra o texto rejeitado como rascunho antes de publicar.');
  if (article.category !== 'local' || !isTresCoracoes(article)) throw new Error('Informe a editoria local e a localização Três Corações / MG / BR.');
  if (!localTopics.some(([key]) => key === article.subcategory)) throw new Error('Subcategoria local inválida.');
  if (!['none','primary','secondary'].includes(article.featuredType || 'none')) throw new Error('Tipo de destaque inválido.');
  if (!Array.isArray(article.tags) || !article.tags.length || article.tags.some(tag => !text(tag))) throw new Error('Informe os assuntos em tags.');
  if (!validDate(article.publishedAt) || Date.parse(article.publishedAt) > Date.now()) throw new Error('Informe uma data de publicação válida, não futura.');
  if (!Array.isArray(article.content) || article.content.length < 4 || article.content.some(block => !text(block.text))) throw new Error('Escreva ao menos quatro blocos de texto com conteúdo.');
  if (!Array.isArray(article.sources) || !article.sources.length || article.sources.some(source => !text(source.name) || !text(source.title) || !https(source.url) || (source.publishedAt != null && (!validDate(source.publishedAt) || Date.parse(source.publishedAt) > Date.parse(article.publishedAt))))) throw new Error('Registre fontes com nome, título, URL HTTPS e data válida (ou null).');
  if (article.coverImage && (!(https(article.coverImage) || /^\/assets\/[a-zA-Z0-9_./-]+$/.test(article.coverImage) && !article.coverImage.includes('..')) || !text(article.imageCredit?.text) || !https(article.imageCredit?.url))) throw new Error('A capa precisa de URL segura, crédito e origem HTTPS.');
  if (!Array.isArray(article.videos) || article.videos.some(video => !/^[\w-]{11}$/.test(video.youtubeId) || !text(video.title) || !text(video.credit) || !https(video.sourceUrl))) throw new Error('Revise IDs, créditos e fontes dos vídeos.');
  if (!Array.isArray(article.relatedContent) || article.relatedContent.some(slug => !existing.some(item => item.slug === slug))) throw new Error('Matéria relacionada não encontrada.');
  if (existing.some(item => item.slug !== article.slug && item.storyKey === article.storyKey)) throw new Error('Este acontecimento já foi publicado.');
  if (article.featuredType === 'primary' && existing.some(item => item.slug !== article.slug && item.status === 'published' && item.featuredType === 'primary')) throw new Error('Já existe um destaque principal; revise a curadoria antes de publicar.');
  // Explicit projection: review notes and arbitrary draft fields never enter public output.
  const fields = ['slug','storyKey','title','subtitle','author','category','subcategory','location','tags','publishedAt','content','sources','videos','relatedContent','coverImage','imageCredit'];
  const output = Object.fromEntries(fields.filter(key => article[key] !== undefined).map(key => [key, article[key]]));
  output.location = {city: article.location.city, state: article.location.state, country: article.location.country};
  output.content = article.content.map(({heading,text}) => ({...(heading ? {heading} : {}),text}));
  output.sources = article.sources.map(({name,title,url,publishedAt}) => ({name,title,url,publishedAt:publishedAt ?? null}));
  output.videos = article.videos.map(({youtubeId,title,credit,sourceUrl}) => ({youtubeId,title,credit,sourceUrl}));
  if(article.imageCredit)output.imageCredit = {text:article.imageCredit.text,url:article.imageCredit.url};
  return {...output, illustration:'city', featuredType:article.featuredType || 'none', status:'published'};
}
