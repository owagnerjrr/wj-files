import {publishedArticles, mountNewsFeed} from './newsFeed.js';
import {localArticles, localTopics} from '../services/localNewsService.js';

export function renderLocalPage(app) {
  document.title = 'Três Corações — WJ Files';
  document.querySelector('meta[name="description"]').content = 'Notícias, cultura, esportes e acontecimentos de Três Corações, Minas Gerais, no WJ Files.';
  app.innerHTML = `<div class="portal-container local-page">
    <header class="local-heading"><p class="category-label">WJ Files / Minas Gerais</p>
      <h1>Três Corações</h1><p>A cidade também faz parte do nosso arquivo.</p>
      <p class="local-deck">Notícias, cultura, esportes e acontecimentos locais, com contexto e fontes para você consultar.</p>
    </header>
    <section aria-labelledby="local-news-title" class="editorial-section">
      <div class="editorial-heading"><h2 id="local-news-title">Notícias da cidade</h2><a href="/noticias">Todas as notícias ↗</a></div>
      <form class="local-search" role="search"><label for="local-search-input">Buscar nas matérias de Três Corações</label>
        <div><input id="local-search-input" name="busca" type="search" maxlength="120" placeholder="Assunto ou palavra-chave"><button type="submit">Buscar</button></div>
      </form>
      <nav class="news-filters local-filters" aria-label="Assuntos de Três Corações"></nav>
      <p class="local-results" role="status" aria-live="polite"></p><div class="local-feed"></div>
    </section>
    <aside class="local-editorial-note"><h2>Informação com origem</h2><p>As matérias do WJ Files identificam suas fontes e distinguem a data da publicação da data dos acontecimentos. Esta é uma cobertura editorial independente.</p></aside>
  </div>`;
  const params = new URLSearchParams(location.search);
  const topic = localTopics.some(([key]) => key === params.get('tema')) ? params.get('tema') : '';
  const query = (params.get('busca') || '').slice(0,120);
  const input = app.querySelector('#local-search-input'); input.value = query;
  const form = app.querySelector('.local-search'); form.action = '/tres-coracoes'; form.method = 'get';
  if (topic) { const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = 'tema'; hidden.value = topic; form.append(hidden); }
  const filters = app.querySelector('.local-filters');
  for (const [key, label] of [['', 'Todas'], ...localTopics]) {
    const link = document.createElement('a'), search = new URLSearchParams();
    if (key) search.set('tema', key); if (query) search.set('busca', query);
    link.href = '/tres-coracoes' + (search.size ? '?' + search : ''); link.textContent = label;
    if (key === topic) link.setAttribute('aria-current', 'page'); filters.append(link);
  }
  const all = localArticles(publishedArticles()), items = localArticles(all, {topic, query});
  app.querySelector('.local-results').textContent = `${items.length} ${items.length === 1 ? 'matéria encontrada' : 'matérias encontradas'}`;
  const feed = app.querySelector('.local-feed');
  if (items.length) mountNewsFeed(feed, {items});
  else {
    const empty = document.createElement('div'); empty.className = 'editorial-empty';
    const text = document.createElement('p'); text.textContent = all.length ? 'Nenhuma matéria corresponde à busca. Experimente outro assunto ou remova os filtros.' : 'Ainda não há matérias locais publicadas. As notícias de Três Corações aparecerão aqui após a revisão editorial.';
    const link = document.createElement('a'); link.className = 'story-link'; link.href = all.length ? '/tres-coracoes' : '/noticias'; link.textContent = all.length ? 'Limpar filtros →' : 'Explorar as notícias do WJ Files →';
    empty.append(text, link); feed.replaceWith(empty);
  }
}
