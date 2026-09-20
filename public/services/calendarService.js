import {events} from '../data/events.js';
export const categories={games:'Games',filmes:'Filmes',series:'Séries',tecnologia:'Tecnologia',eventos:'Eventos',outros:'Outros'};
export const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const parseDate=s=>new Date(`${s}T12:00:00`);
export const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function countdown(date,today=new Date()) {const d=parseDate(date);const days=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);return days===0?'Hoje':days===1?'Amanhã':days>1?`Faltam ${days} dias`:'Encerrado';}
// Contrato assíncrono para futura fonte Firestore. Nenhuma credencial no frontend.
export async function getEvents(){return events.filter(e=>['published','demo'].includes(e.status)).map(e=>({...e})).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||''));}
