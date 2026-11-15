import {neon} from '@neondatabase/serverless';
import {validCode, normalizeDestination} from '../lib/short-links.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if (!['GET','HEAD'].includes(req.method)) {res.setHeader('Allow','GET, HEAD');return res.status(405).send('Método não permitido.');}
  const code=req.query?.code;
  if (!validCode(code)) return res.status(404).send('Link não encontrado. Confira o endereço.');
  if (!process.env.SHORTLINK_DATABASE_URL) return res.status(503).send('Serviço temporariamente indisponível. Tente novamente mais tarde.');
  try {
    const sql=neon(process.env.SHORTLINK_DATABASE_URL);
    const rows=await sql`SELECT destination FROM short_links WHERE code=${code} AND disabled=false LIMIT 1`;
    if (!rows.length) return res.status(404).send('Link não encontrado ou desativado.');
    const destination=normalizeDestination(rows[0].destination);
    res.setHeader('Location',destination);
    return res.status(302).end();
  } catch {return res.status(503).send('Serviço temporariamente indisponível. Tente novamente mais tarde.');}
}
