import {articleUrl, categoryLabels, formatDate, makeCover} from './newsFeed.js';
import {selectHomeStories} from '../services/homeService.js';

function storyCard(item, primary) {
  const link = document.createElement('a');
  link.className = primary ? 'lead-story home-story' : 'home-secondary-story';
  link.href = articleUrl(item);
  link.append(makeCover(item, {priority: primary}));
  const body = document.createElement('div');
  for (const [tag, value, className] of [
    ['span', categoryLabels[item.category] || item.category, 'category-label'],
    [primary ? 'h1' : 'h2', item.title, ''],
    ['p', item.subtitle, 'home-story-summary'],
    ['time', formatDate(item.publishedAt), 'home-story-date'],
    ['span', 'Ler notícia →', 'story-link']
  ]) {
    const node = document.createElement(tag);
    node.textContent = value;
    node.className = className;
    if (tag === 'time') node.dateTime = item.publishedAt;
    body.append(node);
  }
  link.append(body);
  return link;
}

export function mountHomeHighlights(root, items) {
  const {primary, secondary} = selectHomeStories(items);
  if (!primary) return; // Preserve the existing special as the empty-catalog fallback.
  const aside = document.createElement('aside');
  aside.className = 'secondary-stories home-secondary';
  secondary.forEach(item => aside.append(storyCard(item, false)));
  const agenda = root.querySelector('.agenda-teaser');
  if (agenda) aside.append(agenda);
  root.replaceChildren(storyCard(primary, true), aside);
}
