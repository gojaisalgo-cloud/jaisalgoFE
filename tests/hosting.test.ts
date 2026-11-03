import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {databaseSettings,databaseConfigured,StorageUnavailableError} from '../lib/booking/storage';
import {db,tours,tour} from '../lib/booking/db';
import {seedTours} from '../data/catalog';
import {POST} from '../app/api/booking/route';
const previous={...process.env};process.env.VERCEL='1';delete process.env.DATABASE_URL;delete process.env.DATABASE_AUTH_TOKEN;delete process.env.TURSO_DATABASE_URL;delete process.env.TURSO_AUTH_TOKEN;
after(()=>{for(const key of ['VERCEL','DATABASE_URL','DATABASE_AUTH_TOKEN','TURSO_DATABASE_URL','TURSO_AUTH_TOKEN','BOOKING_MODE']){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key]}});
test('Vercel requires shared remote storage and never selects a local or temporary database',()=>{
 for(const url of [undefined,'','file:.data/jaisalgo.db','file:/tmp/jaisalgo.db',':memory:','postgres://example.com/database','http://example.com','https://user:password@example.com/db','not-a-url']){const env={VERCEL:'1',DATABASE_URL:url};assert.equal(databaseConfigured(env),false,url);assert.throws(()=>databaseSettings(env),StorageUnavailableError)}
 assert.deepEqual(databaseSettings({}),{url:'file:.data/jaisalgo.db',authToken:undefined,localDefault:true});
 assert.deepEqual(databaseSettings({VERCEL:'1',DATABASE_URL:' libsql://example.turso.io ',DATABASE_AUTH_TOKEN:' token '}),{url:'libsql://example.turso.io',authToken:'token',localDefault:false});
 assert.equal(databaseSettings({VERCEL:'1',TURSO_DATABASE_URL:'libsql://alias.turso.io',TURSO_AUTH_TOKEN:'alias-token'}).url,'libsql://alias.turso.io');
 assert.equal(databaseSettings({VERCEL:'1',DATABASE_URL:'https://primary.example.com',TURSO_DATABASE_URL:'libsql://alias.turso.io'}).url,'https://primary.example.com');
});
test('public package reads work without a hosted database, while durable operations fail closed',async()=>{const catalogue=await tours();assert.equal(catalogue.length,seedTours().filter(t=>t.published).length);assert.equal((await tour('city-and-dunes'))?.slug,'city-and-dunes');assert.equal(await tour('does-not-exist'),undefined);assert.ok(catalogue.every(t=>t.details&&t.costs));await assert.rejects(()=>db(),StorageUnavailableError)});
test('unconfigured hosted checkout and availability return 503 without a payment-provider call',async()=>{const originalFetch=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw Error('No provider request is allowed without persistent storage')};try{for(const mode of ['demo','live']){process.env.BOOKING_MODE=mode;const input={slug:'city-and-dunes',date:new Date(Date.now()+5*86400000).toISOString().slice(0,10),travelers:2,stay:'Comfort',transport:true,jeep:false,guide:false,name:'Test Traveler',phone:'+919999999999',consent:true,website:'',access:randomUUID()+randomUUID(),idempotency:randomUUID()};for(const action of ['create','availability']){const r=await POST(new Request('http://localhost/api/booking',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({action,input})})),body=await r.json();assert.equal(r.status,503);assert.equal(body.code,'STORAGE_UNAVAILABLE');assert.equal(body.error.includes('.data'),false);assert.equal(body.error.includes('mkdir'),false)}}assert.equal(calls,0)}finally{global.fetch=originalFetch}});
