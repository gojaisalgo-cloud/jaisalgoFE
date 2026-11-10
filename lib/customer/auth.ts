import {OAuth2Client,type TokenPayload} from 'google-auth-library';
import type {Client} from '@libsql/client';
import {db} from '@/lib/booking/db';
import {hash,secretToken,equal} from '@/lib/booking/security';
import {queueSignupAlert} from '@/lib/booking/whatsapp-alerts';

export const customerSessionSeconds=30*24*3600;
export const signupConsentVersion='2026-11-10';
const googleClient=new OAuth2Client();
const initialized=new WeakMap<Client,Promise<void>>();
export type CustomerIdentity={subject:string;name:string;email:string};
export type Customer={id:string;name:string;email:string};
export function googleClientId(env:Record<string,string|undefined>=process.env){const id=env.GOOGLE_CLIENT_ID?.trim()||'';return /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(id)?id:''}
export async function customerStore(client?:Client){
 const c=client||await db();
 let ready=initialized.get(c);
 if(!ready){ready=c.batch([
  `CREATE TABLE IF NOT EXISTS customer_users(id TEXT PRIMARY KEY,google_sub TEXT NOT NULL UNIQUE,name TEXT NOT NULL,email TEXT NOT NULL,created INTEGER NOT NULL,last_seen INTEGER NOT NULL,consent_at TEXT NOT NULL,consent_version TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS customer_sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS customer_session_expiry ON customer_sessions(expires)`,
  `CREATE TABLE IF NOT EXISTS customer_login_challenges(nonce_hash TEXT PRIMARY KEY,created INTEGER NOT NULL,expires INTEGER NOT NULL)`,
 ],'write').then(()=>{}).catch(error=>{initialized.delete(c);throw error});initialized.set(c,ready)}
 await ready;return c;
}
export async function createLoginChallenge(c?:Client,now=Date.now()){
 const store=await customerStore(c),nonce=secretToken();
 await store.batch([{sql:'DELETE FROM customer_login_challenges WHERE expires<=?',args:[now]},{sql:'DELETE FROM customer_sessions WHERE expires<=?',args:[now]},{sql:'INSERT INTO customer_login_challenges VALUES(?,?,?)',args:[hash(nonce),now,now+10*60*1000]}],'write');
 return nonce;
}
export function googleIdentity(payload:(TokenPayload&{nonce?:string})|undefined,nonce:string,audience:string,now=Date.now()):CustomerIdentity{
 if(!payload||!audience||payload.aud!==audience||!['accounts.google.com','https://accounts.google.com'].includes(payload.iss)||!Number.isFinite(payload.exp)||payload.exp*1000<=now||!Number.isFinite(payload.iat)||payload.iat*1000>now+60000)throw Error('Invalid Google identity');
 if(!/^[a-f0-9]{48}$/.test(nonce)||typeof payload.nonce!=='string'||!/^[a-f0-9]{48}$/.test(payload.nonce)||!equal(nonce,payload.nonce))throw Error('Google challenge did not match');
 if(!payload.sub||payload.sub.length>255||payload.email_verified!==true||!payload.email||payload.email.length>320||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))throw Error('Google account details are incomplete');
 const name=(payload.name||'JaisalGo traveller').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').trim().slice(0,120)||'JaisalGo traveller';
 return {subject:payload.sub,name,email:payload.email};
}
export async function verifyGoogleCredential(credential:string,nonce:string){
 const audience=googleClientId();if(!audience||credential.length>16000)throw Error('Google sign-in is not configured');
 const ticket=await googleClient.verifyIdToken({idToken:credential,audience});
 return googleIdentity(ticket.getPayload(),nonce,audience);
}
/** Identity must come from verifyGoogleCredential, never a submitted name/email. */
export async function completeCustomerSignIn(identity:CustomerIdentity,nonce:string,consent:boolean,c?:Client,now=Date.now()){
 if(consent!==true)throw Error('Contact-sharing consent required');
 const store=await customerStore(c),tx=await store.transaction('write');
 try{
  const used=await tx.execute({sql:'DELETE FROM customer_login_challenges WHERE nonce_hash=? AND expires>?',args:[hash(nonce),now]});
  if(used.rowsAffected!==1)throw Error('Sign-in has expired; please try again');
  const id='customer_'+secretToken(),consentAt=new Date(now).toISOString();
  const inserted=await tx.execute({sql:'INSERT OR IGNORE INTO customer_users(id,google_sub,name,email,created,last_seen,consent_at,consent_version) VALUES(?,?,?,?,?,?,?,?)',args:[id,identity.subject,identity.name,identity.email,now,now,consentAt,signupConsentVersion]});
  const row=(await tx.execute({sql:'SELECT id FROM customer_users WHERE google_sub=?',args:[identity.subject]})).rows[0];
  if(!row)throw Error('Could not create account');
  const user={id:String(row.id),name:identity.name,email:identity.email};
  await tx.execute({sql:'UPDATE customer_users SET name=?,email=?,last_seen=?,consent_at=?,consent_version=? WHERE id=?',args:[user.name,user.email,now,consentAt,signupConsentVersion,user.id]});
  const sessionToken=secretToken();
  await tx.execute({sql:'INSERT INTO customer_sessions VALUES(?,?,?,?)',args:[hash(sessionToken),user.id,now,now+customerSessionSeconds*1000]});
  if(inserted.rowsAffected===1)await queueSignupAlert(tx,{...user,consentAt},now);
  await tx.commit();return {user,sessionToken,isNew:inserted.rowsAffected===1};
 }catch(error){await tx.rollback();throw error}finally{tx.close()}
}
export async function customerForSession(token:string,c?:Client,now=Date.now()):Promise<Customer|null>{
 if(!/^[a-f0-9]{48}$/.test(token))return null;
 const store=await customerStore(c),row=(await store.execute({sql:'SELECT u.id,u.name,u.email FROM customer_sessions s JOIN customer_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?',args:[hash(token),now]})).rows[0];
 return row?{id:String(row.id),name:String(row.name),email:String(row.email)}:null;
}
export async function revokeCustomerSession(token:string,c?:Client){if(/^[a-f0-9]{48}$/.test(token))await (await customerStore(c)).execute({sql:'DELETE FROM customer_sessions WHERE token_hash=?',args:[hash(token)]})}
