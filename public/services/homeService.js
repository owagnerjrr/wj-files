// Pure selection rules shared by the Home and its tests; no browser dependencies.
export function selectHomeStories(items, {secondaryLimit = 2} = {}) {
  const published = items.filter(item => item.status === 'published')
    .slice().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug));
  const seen = new Set();
  const unique = published.filter(item => {
    const key = item.storyKey || item.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const eligible = unique.filter(item => item.featuredType !== 'none');
  const primary = eligible.find(item => item.featuredType === 'primary') || eligible[0] || null;
  const candidates = eligible.filter(item => item !== primary);
  const secondary = [
    ...candidates.filter(item => item.featuredType === 'secondary'),
    ...candidates.filter(item => item.featuredType !== 'secondary')
  ].slice(0, Math.max(0, secondaryLimit));
  // Latest is the complete chronological feed, independent of editorial placement.
  return {primary, secondary, latest: unique};
}
