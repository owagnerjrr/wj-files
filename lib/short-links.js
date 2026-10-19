import {isIP} from 'node:net';
export function normalizeDestination(input) {
  if (typeof input !== 'string' || input.trim().length > 2048) throw new Error('Cole um link com até 2.048 caracteres.');
  let url;
  try { url = new URL(input.trim()); } catch { throw new Error('Informe um endereço completo, começando com https:// ou http://.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Use um link http:// ou https:// sem usuário e senha no endereço.');
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host.includes('.') || isIP(host) || /(?:^|\.)(localhost|local|internal|test|invalid)$/.test(host)) throw new Error('Use um endereço público da internet.');
  if (['wjfiles.com.br', 'www.wjfiles.com.br'].includes(host) && url.pathname.startsWith('/s/')) throw new Error('Este link já está encurtado pela WJ.');
  if (url.href.length > 2048) throw new Error('Este endereço é muito longo. Use um link com até 2.048 caracteres.');
  return url.href;
}
export const validCode = code => typeof code === 'string' && /^[a-zA-Z0-9_-]{6,8}$/.test(code);
