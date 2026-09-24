export const localTopics = [
  ['cidade', 'Cidade'], ['cultura', 'Cultura'], ['esportes', 'Esportes'],
  ['educacao', 'Educação'], ['servicos', 'Serviços'], ['eventos', 'Eventos']
];
export const tresCoracoes = {city: 'Três Corações', state: 'MG', country: 'BR'};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export function isTresCoracoes(article) {
  const place = article.location;
  return !!place && normalize(place.city) === 'tres coracoes' &&
    normalize(place.state) === 'mg' && normalize(place.country) === 'br';
}
export function localArticles(items, {topic = '', query = ''} = {}) {
  const term = normalize(query);
  return items.filter(article => article.status === 'published' && isTresCoracoes(article))
    .filter(article => !topic || article.subcategory === topic)
    .filter(article => !term || normalize([article.title, article.subtitle, ...(article.tags || [])].join(' ')).includes(term))
    .slice().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug));
}
