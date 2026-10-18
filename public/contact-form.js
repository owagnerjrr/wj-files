(() => {
  const form = document.getElementById('quick-contact');
  if (!form) return;
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
  form.hidden = false;
})();
