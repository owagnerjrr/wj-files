function setupContact(config) {
  const form = document.getElementById(config.form);
  const dialog = document.getElementById(config.dialog);
  if (!form || !dialog || typeof dialog.showModal !== 'function') return;
  const need = document.getElementById(config.need);
  const idea = document.getElementById(config.idea);
  const allowed = new Set(config.options);
  idea.addEventListener('input', () => idea.setCustomValidity(''));
  need.addEventListener('change', () => need.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    need.setCustomValidity(allowed.has(need.value) ? '' : 'Escolha uma das opções.');
    const description = idea.value.trim();
    idea.setCustomValidity(description ? '' : config.validation);
    if (!form.reportValidity()) return;
    const message = config.partnership ? [
      'Olá, Wagner! 👋',
      '🤝 Vim pelo site WJ Tecnologia e gostaria de conversar sobre uma parceria.',
      '',
      `💻 Tipo de parceria: ${need.value}`,
      '',
      '💡 Minha proposta:',
      description,
      '',
      '🚀 Vamos conectar nossas ideias e criar algo juntos?',
    ].join('\n') : [
      'Olá, Wagner! 👋',
      '💻 Vim pelo site WJ Tecnologia e gostaria de conversar sobre uma ideia.',
      '',
      `⚙️ O que preciso: ${need.value}`,
      '',
      '💡 Minha ideia:',
      description,
      '',
      '🚀 Podemos conversar sobre como tirar essa ideia do papel?',
    ].join('\n');
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const endpoint = mobile
      ? 'https://wa.me/5535991742614?text='
      : 'https://web.whatsapp.com/send?phone=5535991742614&text=';
    window.location.assign(endpoint + encodeURIComponent(message));
  });
  let previousFocus;
  const open = trigger => {
    if (dialog.open) return;
    previousFocus = trigger || document.querySelector(config.trigger);
    dialog.showModal();
    document.documentElement.classList.add('contact-open');
    need.focus();
  };
  document.querySelectorAll(config.trigger).forEach(trigger => {
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
    if (window.location.hash === config.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    previousFocus?.focus();
  });
  const openFromHash = () => {
    if (window.location.hash === config.hash) open();
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
setupContact({form:'quick-contact',dialog:'contact-dialog',need:'contact-need',idea:'contact-idea',trigger:'[data-open-contact]',hash:'#contato',options:['Site','Sistema','Automação','Suporte','Ainda não sei'],validation:'Conte sua ideia em poucas palavras.'});
setupContact({form:'partnership-form',dialog:'partnership-dialog',need:'partnership-type',idea:'partnership-proposal',trigger:'[data-open-partnership]',hash:'#parcerias',options:['Divulgar minha marca','Sugerir uma dica de TI','Desenvolver um projeto em parceria','Outra parceria'],validation:'Conte sua proposta em poucas palavras.',partnership:true});
