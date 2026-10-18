(() => {
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
