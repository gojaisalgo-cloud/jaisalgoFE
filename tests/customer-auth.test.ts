import {test,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {db} from '../lib/booking/db';
import {completeCustomerSignIn,createLoginChallenge,customerForSession,customerSessionSeconds,customerStore,googleClientId,googleIdentity,revokeCustomerSession} from '../lib/customer/auth';
import {drainPaymentAlerts} from '../lib/booking/whatsapp-alerts';
import {hash} from '../lib/booking/security';
import type {TokenPayload} from 'google-auth-library';
const temp=mkdtempSync(join(tmpdir(),'jaisalgo-auth-')),previous={...process.env},originalFetch=global.fetch,now=Date.now(),aud='123-fixture.apps.googleusercontent.com',identity={subject:'google-sub-fixture',name:'Fixture User',email:'fixture@example.com'};
Object.assign(process.env,{DATABASE_URL:'file:'+join(temp,'auth.db'),CUSTOMER_SIGNUP_ALERTS_ENABLED:'true',WHATSAPP_API_URL:'https://7107.api.greenapi.com',WHATSAPP_INSTANCE_ID:'7107000000',WHATSAPP_API_TOKEN:'fixture_sender_token',WHATSAPP_GROUP_ID:'120363000000000000@g.us',WHATSAPP_GROUP_INVITE_URL:'https://chat.whatsapp.com/FixtureGroupInvite12345'});
let sent:string[]=[];
global.fetch=async(_url,options)=>{sent.push(String(options?.body));return Response.json({idMessage:'fixture_receipt'})};
beforeEach(async()=>{const c=await customerStore();await c.batch(['DELETE FROM customer_sessions','DELETE FROM customer_users','DELETE FROM customer_login_challenges','DELETE FROM booking_alerts'],'write');sent=[];process.env.CUSTOMER_SIGNUP_ALERTS_ENABLED='true'});
after(async()=>{global.fetch=originalFetch;(await db()).close();rmSync(temp,{recursive:true,force:true});for(const key of Object.keys(process.env))if(!(key in previous))delete process.env[key];Object.assign(process.env,previous)});
test('Google payload requires the configured audience, verified email, issuer, lifetime and matching nonce',()=>{
 const nonce='a'.repeat(48),payload:TokenPayload&{nonce:string}={aud,iss:'https://accounts.google.com',sub:identity.subject,email:identity.email,email_verified:true,name:identity.name,iat:Math.floor(now/1000),exp:Math.floor(now/1000)+3600,nonce};
 assert.deepEqual(googleIdentity(payload,nonce,aud,now),identity);
 for(const change of [{aud:'other'},{iss:'https://attacker.example'},{exp:0},{iat:Math.floor(now/1000)+120},{email_verified:false},{email:'invalid'},{sub:''},{nonce:'b'.repeat(48)},{nonce:'é'.repeat(48)}])assert.throws(()=>googleIdentity({...payload,...change},nonce,aud,now));
 assert.throws(()=>googleIdentity(undefined,nonce,aud,now));assert.equal(googleClientId({GOOGLE_CLIENT_ID:aud}),aud);assert.equal(googleClientId({GOOGLE_CLIENT_ID:'not-a-client'}),'');
});
test('sign-in consumes a one-use challenge, creates only a hashed opaque session and sends one new-user alert',async()=>{
 const c=await customerStore(),nonce=await createLoginChallenge(c,now),r=await completeCustomerSignIn(identity,nonce,true,c,now);
 assert.equal(r.isNew,true);assert.deepEqual(await customerForSession(r.sessionToken,c,now),r.user);
 assert.equal((await c.execute('SELECT token_hash FROM customer_sessions')).rows[0].token_hash,hash(r.sessionToken));
 assert.equal((await c.execute('SELECT nonce_hash FROM customer_login_challenges')).rows.length,0);
 await assert.rejects(()=>completeCustomerSignIn(identity,nonce,true,c,now));
 assert.equal((await drainPaymentAlerts(c,now+10)).accepted,1);assert.equal(sent.length,1);
 for(const value of [identity.name,identity.email,'no booking or payment'])assert.ok(sent[0].includes(value));
 for(const secret of [identity.subject,r.sessionToken,nonce,'/reservations/'])assert.ok(!sent[0].includes(secret));
 const again=await completeCustomerSignIn(identity,await createLoginChallenge(c,now+20),true,c,now+20);assert.equal(again.isNew,false);await drainPaymentAlerts(c,now+30);assert.equal(sent.length,1);assert.equal((await c.execute('SELECT id FROM customer_users')).rows.length,1);
 await revokeCustomerSession(r.sessionToken,c);assert.equal(await customerForSession(r.sessionToken,c,now),null);assert.equal(await customerForSession(again.sessionToken,c,now+20+customerSessionSeconds*1000),null);assert.equal(await customerForSession('forged',c,now),null);
});
test('expired challenges and missing consent cannot create accounts or notifications',async()=>{
 const c=await customerStore(),expired=await createLoginChallenge(c,now-600001);await assert.rejects(()=>completeCustomerSignIn(identity,expired,true,c,now));
 const nonce=await createLoginChallenge(c,now);await assert.rejects(()=>completeCustomerSignIn(identity,nonce,false,c,now));
 assert.equal((await c.execute('SELECT id FROM customer_users')).rows.length,0);assert.equal((await c.execute('SELECT id FROM booking_alerts')).rows.length,0);
 assert.equal((await completeCustomerSignIn(identity,nonce,true,c,now)).isNew,true);
});
test('disabled signup alerts never send, and removed consent cancels an already queued alert',async()=>{
 const c=await customerStore();process.env.CUSTOMER_SIGNUP_ALERTS_ENABLED='false';await completeCustomerSignIn(identity,await createLoginChallenge(c,now),true,c,now);assert.equal((await c.execute('SELECT id FROM booking_alerts')).rows.length,0);
 process.env.CUSTOMER_SIGNUP_ALERTS_ENABLED='true';await completeCustomerSignIn({...identity,subject:'second-user'},await createLoginChallenge(c,now),true,c,now);await c.execute("UPDATE customer_users SET consent_at=''");await drainPaymentAlerts(c,now+10);assert.equal(sent.length,0);assert.equal((await c.execute('SELECT state FROM booking_alerts')).rows[0].state,'cancelled');
});
