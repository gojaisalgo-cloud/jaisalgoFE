/** Vercel functions cannot provide a shared, durable SQLite file. */
export class StorageUnavailableError extends Error {
 readonly code='STORAGE_UNAVAILABLE';
 constructor(){super('Online booking is temporarily unavailable. Please try again later.');this.name='StorageUnavailableError'}
}
export function databaseSettings(env:Record<string,string|undefined>=process.env){
 const url=env.DATABASE_URL?.trim()||env.TURSO_DATABASE_URL?.trim();
 if(env.VERCEL==='1'){
  let valid=false;
  try{const parsed=new URL(url||'');valid=['libsql:','https:'].includes(parsed.protocol)&&!!parsed.hostname&&!parsed.username&&!parsed.password}catch{}
  if(!valid)throw new StorageUnavailableError();
 }
 return {url:url||'file:.data/jaisalgo.db',authToken:env.DATABASE_AUTH_TOKEN?.trim()||env.TURSO_AUTH_TOKEN?.trim()||undefined,localDefault:!url};
}
export function databaseConfigured(env:Record<string,string|undefined>=process.env){try{databaseSettings(env);return true}catch{return false}}
