import {databaseSettings,databaseConfigured,StorageUnavailableError} from './storage';
import type {Client} from '@libsql/client';
import {mkdirSync} from 'node:fs';
import {packageDetails} from './package-details';
import {seedTours,type Tour} from '@/data/catalog';
let client:Client|undefined;let ready:Promise<void>|undefined;
export async function db(){const settings=databaseSettings();try{if(!client){if(settings.localDefault)mkdirSync('.data',{recursive:true,mode:0o700});const driver=process.env.VERCEL==='1'?await import('@libsql/client/web'):await import('@libsql/client');client??=driver.createClient({url:settings.url,authToken:settings.authToken});}const c=client;if(!ready)ready=(async()=>{await c.batch([
 `CREATE TABLE IF NOT EXISTS tours(slug TEXT PRIMARY KEY,payload TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS departures(slug TEXT NOT NULL,date TEXT NOT NULL,capacity INTEGER NOT NULL CHECK(capacity>=0),mode TEXT NOT NULL,PRIMARY KEY(slug,date,mode))`,
 `CREATE TABLE IF NOT EXISTS drafts(id TEXT PRIMARY KEY,access_hash TEXT NOT NULL,idempotency TEXT NOT NULL UNIQUE,payload TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL,state TEXT NOT NULL,provider_order TEXT UNIQUE)`,
 `CREATE TABLE IF NOT EXISTS payments(id TEXT PRIMARY KEY,draft_id TEXT NOT NULL UNIQUE,amount INTEGER NOT NULL,mode TEXT NOT NULL,refunded INTEGER NOT NULL DEFAULT 0)`,
 `CREATE TABLE IF NOT EXISTS payment_exceptions(id TEXT PRIMARY KEY,draft_id TEXT NOT NULL,amount INTEGER NOT NULL,mode TEXT NOT NULL,refunded INTEGER NOT NULL DEFAULT 0,reason TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,draft_id TEXT NOT NULL UNIQUE,payload TEXT NOT NULL,status TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS ticket_verifications(token_hash TEXT PRIMARY KEY,draft_id TEXT NOT NULL UNIQUE)`,
 `CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,created INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS booking_alerts(id TEXT PRIMARY KEY,booking_id TEXT NOT NULL,payment_id TEXT NOT NULL UNIQUE,target TEXT NOT NULL,message TEXT NOT NULL,state TEXT NOT NULL,created INTEGER NOT NULL,next_attempt INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,claim TEXT,lease_until INTEGER NOT NULL DEFAULT 0,provider_id TEXT NOT NULL DEFAULT '',last_error TEXT NOT NULL DEFAULT '')`,
 `CREATE INDEX IF NOT EXISTS booking_alert_pending ON booking_alerts(state,next_attempt)`,
 `CREATE TABLE IF NOT EXISTS audits(id TEXT PRIMARY KEY,created INTEGER NOT NULL,action TEXT NOT NULL)`,
 `CREATE INDEX IF NOT EXISTS draft_departure_lookup ON drafts(json_extract(payload,'$.slug'),json_extract(payload,'$.date'),json_extract(payload,'$.mode'),state,expires)`,
 `CREATE INDEX IF NOT EXISTS booking_departure_lookup ON bookings(json_extract(payload,'$.slug'),json_extract(payload,'$.date'),json_extract(payload,'$.mode'),status)`,
 `CREATE INDEX IF NOT EXISTS payment_exception_lookup ON payment_exceptions(draft_id)`
 ],'write');await c.batch([`UPDATE drafts SET payload=json_remove(payload, '$.email') WHERE json_type(payload, '$.email') IS NOT NULL`,`UPDATE bookings SET payload=json_remove(payload, '$.email') WHERE json_type(payload, '$.email') IS NOT NULL`],'write');await c.batch(seedTours().map(t=>({sql:'INSERT OR IGNORE INTO tours VALUES(?,?)',args:[t.slug,JSON.stringify(t)]})),'write')})().catch(error=>{ready=undefined;throw error});await ready;return c}catch(error){if(process.env.VERCEL==='1')throw new StorageUnavailableError();throw error}}
export function hydrateTour(t:Tour):Tour{return {...t,costs:{...t.costs,...(t.area==='City'&&t.costs.cityNights===undefined?{cityNights:t.nights}:{})},details:packageDetails(t)}}
export async function tours(all=false):Promise<Tour[]>{if(!databaseConfigured())return seedTours().map(hydrateTour).filter(t=>all||t.published);const c=await db(),r=await c.execute('SELECT payload FROM tours');return r.rows.map(r=>hydrateTour(JSON.parse(String(r.payload)) as Tour)).filter(t=>all||t.published)}
export async function tour(slug:string,all=false){return (await tours(all)).find(t=>t.slug===slug)}
