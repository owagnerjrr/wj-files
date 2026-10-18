(() => {
  const form = document.getElementById('quick-contact');
  const dialog = document.getElementById('contact-dialog');
  if (!form || !dialog || typeof dialog.showModal !== 'function') return;
  const need = document.getElementById('contact-need');
  const idea = document.getElementById('contact-idea');
  const allowed = new Set(['Site', 'Sistema', 'Automação', 'Suporte', 'Ainda não sei']);
  idea.addEventListener('input', () => idea.setCustomValidity(''));
  need.addEventListener('change', () => need.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    need.setCustomValidity(allowed.has(need.value) ? '' : 'Escolha uma das opções.');
    const description = idea.value.trim();
    idea.setCustomValidity(description ? '' : 'Conte sua ideia em poucas palavras.');
    if (!form.reportValidity()) return;
    const message = [
      'Olá! Vim pelo site WJ Tecnologia.',
      '',
      `Preciso de: ${need.value}`,
      `Minha ideia: ${description}`,
    ].join('\n');
    window.location.assign(`https://wa.me/5535991742614?text=${encodeURIComponent(message)}`);
  });
  let previousFocus;
  const open = trigger => {
    if (dialog.open) return;
    previousFocus = trigger || document.getElementById('contato');
    dialog.showModal();
    document.documentElement.classList.add('contact-open');
    need.focus();
  };
  document.querySelectorAll('[data-open-contact]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      open(trigger);
    });
  });
  dialog.querySelector('.contact-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('contact-open');
    if (window.location.hash === '#contato') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    previousFocus?.focus();
  });
  const openFromHash = () => {
    if (window.location.hash === '#contato') open();
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
