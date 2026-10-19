(() => {

  const filters = document.getElementById('tips-filters');
  if (filters) {
    const search = document.getElementById('tips-search');
    const category = document.getElementById('tips-category');
    const level = document.getElementById('tips-level');
    const count = document.getElementById('tips-result-count');
    const empty = document.getElementById('tips-empty');
    const cards = [...document.querySelectorAll('[data-tip-card]')];
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[-‐‑–—]/g, '');
    const entries = cards.map(card => ({ card, text: normalize(card.dataset.search || '') }));
    const update = () => {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let visible = 0;
      for (const {card, text} of entries) {
        const match = terms.every(term => text.includes(term)) && (!category.value || card.dataset.category === category.value) && (!level.value || card.dataset.level === level.value);
        card.hidden = !match;
        if (match) visible++;
      }
      count.textContent = `${visible} ${visible === 1 ? 'guia encontrado' : 'guias encontrados'} de ${cards.length}.`;
      empty.hidden = visible !== 0;
    };
    filters.hidden = false;
    filters.addEventListener('submit', event => event.preventDefault());
    filters.addEventListener('input', update);
    filters.addEventListener('change', update);
    filters.addEventListener('reset', () => requestAnimationFrame(update));
    document.getElementById('tips-clear').addEventListener('click', () => { filters.reset(); search.focus(); });
    update();
  }

  const fill = document.getElementById('reading-fill');
  const content = document.querySelector('.guide-content');
  if (fill && content) {
    let scheduled = false;
    const update = () => {
      const start = content.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, content.offsetHeight - window.innerHeight);
      const fraction = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      fill.style.width = `${fraction * 100}%`;
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  const sections = document.querySelectorAll('.guide-section');
  const links = new Map([...document.querySelectorAll('.toc a')].map(a => [a.hash.slice(1), a]));
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      const id = visible[0].target.id;
      for (const [key, link] of links) {
        link.classList.toggle('is-active', key === id);
        if (key === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }
  const toc = document.querySelector('.toc');
  if (toc) {
    const small = window.matchMedia('(max-width: 780px)');
    toc.open = !small.matches;
    small.addEventListener('change', event => { toc.open = !event.matches; });
    toc.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      if (small.matches) toc.open = false;
    }));
  }
})();
