import {neon} from '@neondatabase/serverless';
import {createHmac, randomBytes} from 'node:crypto';
import {normalizeDestination} from '../lib/short-links.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {res.setHeader('Allow','POST');return res.status(405).json({error:'Use o formulário para encurtar um link.'});}
  if (!process.env.SHORTLINK_DATABASE_URL) return res.status(503).json({error:'O encurtador está temporariamente indisponível. Tente novamente mais tarde.'});
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({error:'Formato de envio inválido.'});
  if (req.headers.origin) {
    try { if (new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({error:'Abra o formulário no site da WJ Tecnologia.'}); }
    catch {return res.status(403).json({error:'Origem inválida.'});}
  }
  let destination;
  try {const body=typeof req.body==='string'?JSON.parse(req.body):req.body;destination=normalizeDestination(body?.url);} catch (error) {return res.status(400).json({error:error.message});}
  const sql = neon(process.env.SHORTLINK_DATABASE_URL);
  try {
    // Shared counters survive serverless restarts; no raw IP addresses are stored.
    const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const hash = createHmac('sha256', process.env.SHORTLINK_DATABASE_URL).update(ip).digest('hex');
    const hour = Math.floor(Date.now()/3600000), day=Math.floor(Date.now()/86400000);
    const counts = await sql`INSERT INTO short_link_limits (bucket, expires_at) VALUES (${`ip:${hour}:${hash}`}, now()+interval '2 days'), (${`global:${day}`}, now()+interval '2 days') ON CONFLICT (bucket) DO UPDATE SET hits=short_link_limits.hits+1 RETURNING bucket,hits`;
    if (counts.some(row => row.hits > (row.bucket.startsWith('ip:')?20:1000))) {res.setHeader('Retry-After','3600');return res.status(429).json({error:'Limite de criação atingido. Tente novamente mais tarde.'});}
    await sql`DELETE FROM short_link_limits WHERE expires_at < now()`;
    for (let attempt=0;attempt<3;attempt++) {
      const code=randomBytes(6).toString('base64url');
      const inserted=await sql`INSERT INTO short_links (code,destination) VALUES (${code},${destination}) ON CONFLICT (code) DO NOTHING RETURNING code`;
      if (inserted.length) return res.status(201).json({code});
    }
    return res.status(503).json({error:'Não foi possível gerar o link agora. Tente novamente.'});
  } catch {return res.status(503).json({error:'Não foi possível salvar o link agora. Tente novamente em instantes.'});}
}
