import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarAllowed,calendarDays,calendarMove,calendarMoveMonth,calendarLabel} from '../lib/calendar';
test('calendar rejects impossible dates and enforces the existing inclusive booking bounds',()=>{
 assert.equal(calendarAllowed('2026-02-30'),false);assert.equal(calendarAllowed('', '2026-11-11'),false);
 assert.equal(calendarAllowed('2026-11-10','2026-11-11','2027-11-10'),false);
 assert.equal(calendarAllowed('2026-11-11','2026-11-11','2027-11-10'),true);
 assert.equal(calendarAllowed('2027-11-10','2026-11-11','2027-11-10'),true);
 assert.equal(calendarAllowed('2027-11-11','2026-11-11','2027-11-10'),false);
});
test('calendar aligns weeks and handles month/year and leap-year keyboard movement',()=>{
 const days=calendarDays('2026-11-01');assert.equal(days.length,42);assert.equal(days[0],'2026-11-01');assert.equal(days[41],'2026-12-12');
 assert.equal(calendarMove('2026-12-31',1),'2027-01-01');assert.equal(calendarMoveMonth('2027-01-31',1),'2027-02-28');assert.equal(calendarMoveMonth('2028-01-31',1),'2028-02-29');assert.equal(calendarMoveMonth('2027-01-01',-1),'2026-12-01');assert.match(calendarLabel('2026-11-11'),/11 Nov 2026/);
});
