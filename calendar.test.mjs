import test from 'node:test';
import assert from 'node:assert/strict';
import {countdown,getEvents,dateKey,parseDate} from './public/services/calendarService.js';
test('contagem usa dias civis, inclusive virada de ano e ano bissexto',()=>{assert.equal(countdown('2027-01-01',new Date(2026,11,31,23)),'Amanhã');assert.equal(countdown('2026-09-19',new Date(2026,8,19)),'Hoje');assert.equal(countdown('2024-03-01',new Date(2024,1,28)),'Faltam 2 dias');assert.equal(countdown('2026-09-18',new Date(2026,8,19)),'Encerrado');assert.equal(dateKey(parseDate('2026-09-19')),'2026-09-19')});
test('serviço retorna eventos oficiais, ordenados e isolados',async()=>{const events=await getEvents();assert.ok(events.every(e=>e.status==='published'&&['www.nintendo.com','www.rockstargames.com'].includes(new URL(e.url).hostname)));assert.deepEqual(events.map(e=>e.date),events.map(e=>e.date).sort());events[0].title='alterado';assert.notEqual((await getEvents())[0].title,'alterado')});

