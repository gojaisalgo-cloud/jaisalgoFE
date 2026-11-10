import {test,beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {db} from '../lib/booking/db';
import {createDraft,viewDraft,settle,preparePayment} from '../lib/booking/service';
import {drainPaymentAlerts,whatsappSettings} from '../lib/booking/whatsapp-alerts';

const temp=mkdtempSync(join(tmpdir(),'jaisalgo-whatsapp-')),originalFetch=global.fetch,previous={...process.env};
Object.assign(process.env,{DATABASE_URL:'file:'+join(temp,'alerts.db'),BOOKING_MODE:'live',BOOKING_DEFAULT_CAPACITY:'unlimited',BOOKING_BUSINESS_NAME:'Test travel desk',RAZORPAY_KEY_ID:'rzp_live_fixture',RAZORPAY_KEY_SECRET:'fixture',RAZORPAY_WEBHOOK_SECRET:'fixture',WHATSAPP_API_URL:'https://7107.api.greenapi.com',WHATSAPP_INSTANCE_ID:'7107000000',WHATSAPP_API_TOKEN:'fixture_sender_token',WHATSAPP_GROUP_ID:'120363000000000000@g.us',WHATSAPP_GROUP_INVITE_URL:'https://chat.whatsapp.com/FixtureGroupInvite12345'});
let orderFailure=false;
let sent:Array<{url:string;body:Record<string,unknown>}>=[],reply:()=>Promise<Response>=async()=>Response.json({idMessage:'fixture_message'});
global.fetch=async(url,options)=>{
 if(String(url).startsWith('https://api.razorpay.com/')){if(orderFailure)throw Error('Gateway unavailable');return Response.json({id:'order_'+randomUUID()})}
 sent.push({url:String(url),body:JSON.parse(String(options?.body))});return reply();
};
async function checkout(overrides:Record<string,unknown>={}){
 const access=randomUUID()+randomUUID(),date=new Date(Date.now()+10*86400000).toISOString().slice(0,10),input={slug:'golden-city-escape',date,travelers:2,stay:'Comfort',transport:true,jeep:false,guide:false,paymentPlan:'token',name:'Fixture Traveler',phone:'9999999999',consent:true,website:'',access,idempotency:randomUUID(),...overrides},r=await createDraft(input),s=await viewDraft(r.id,access);
 return {id:r.id,access,input,payment:{id:'pay_'+randomUUID(),order_id:String(s.order),amount:9900,currency:'INR',status:'captured'}};
}
async function captured(){const r=await checkout();await settle(r.id,r.payment);return r}
beforeEach(async()=>{await (await db()).execute('DELETE FROM booking_alerts');sent=[];orderFailure=false;reply=async()=>Response.json({idMessage:'fixture_message'})});
after(async()=>{global.fetch=originalFetch;(await db()).close();rmSync(temp,{recursive:true,force:true});for(const k of Object.keys(process.env))if(!(k in previous))delete process.env[k];Object.assign(process.env,previous)});

test('only verified live capture queues a paid alert, and repeat captures send one message without private ticket access',async()=>{
 const c=await db(),r=await checkout();assert.equal((await c.execute('SELECT id FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows.length,0);
 await assert.rejects(()=>settle(r.id,{...r.payment,amount:1}));await assert.rejects(()=>settle(r.id,{...r.payment,status:'authorized'}));assert.equal((await c.execute('SELECT id FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows.length,0);
 await settle(r.id,r.payment);await settle(r.id,r.payment);assert.equal((await c.execute('SELECT id FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows.length,1);
 const result=await drainPaymentAlerts(c);assert.equal(result.accepted,1);assert.equal(sent.length,1);assert.equal(sent[0].body.chatId,process.env.WHATSAPP_GROUP_ID);assert.equal(sent[0].body.linkPreview,false);
 const text=String(sent[0].body.message);assert.match(text,/Fixture Traveler/);assert.match(text,/\+919999999999/);assert.match(text,/₹99/);assert.match(text,/confirmation pending/);assert.equal(text.includes(r.access),false);assert.equal(text.includes(process.env.RAZORPAY_KEY_SECRET!),false);assert.equal(text.includes('/reservations/'),false);
 await drainPaymentAlerts(c);assert.equal(sent.length,1);assert.equal((await c.execute('SELECT state FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows[0].state,'accepted');
});
test('definite rejection retries later, while ambiguous sends require review and never automatically duplicate',async()=>{
 const c=await db();await captured();reply=async()=>new Response('',{status:429});const now=Date.now();await drainPaymentAlerts(c,now);assert.equal(sent.length,1);assert.equal((await c.execute('SELECT state FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows[0].state,'pending');await drainPaymentAlerts(c,now+1000);assert.equal(sent.length,1);
 reply=async()=>Response.json({idMessage:'retry_receipt'});assert.equal((await drainPaymentAlerts(c,now+61000)).accepted,1);assert.equal(sent.length,2);
 await captured();reply=async()=>{throw Error('unknown outcome')};await drainPaymentAlerts(c);assert.equal((await c.execute("SELECT COUNT(*) n FROM booking_alerts WHERE state='review'")).rows[0].n,1);const calls=sent.length;await drainPaymentAlerts(c,Date.now()+3600000);assert.equal(sent.length,calls);
});
test('parallel workers claim one alert and a worker crash leaves delivery in review instead of resending',async()=>{
 const c=await db();await captured();await Promise.all([drainPaymentAlerts(c),drainPaymentAlerts(c)]);assert.equal(sent.length,1);
 await captured();await c.execute("UPDATE booking_alerts SET state='sending',lease_until=1 WHERE state='pending' AND payment_id NOT LIKE 'checkout:%'");await drainPaymentAlerts(c);assert.equal(sent.length,1);assert.equal((await c.execute("SELECT COUNT(*) n FROM booking_alerts WHERE state='review'")).rows[0].n,1);
});
test('missing sender, wrong group, refunds and cancellation cannot produce a misleading paid booking post',async()=>{
 const c=await db(),r=await captured(),token=process.env.WHATSAPP_API_TOKEN,invite=process.env.WHATSAPP_GROUP_INVITE_URL;
 try{delete process.env.WHATSAPP_API_TOKEN;assert.equal((await drainPaymentAlerts(c)).configured,false);process.env.WHATSAPP_API_TOKEN=token;process.env.WHATSAPP_GROUP_INVITE_URL='https://chat.whatsapp.com/AnotherGroupInvite12345';await drainPaymentAlerts(c);assert.equal(sent.length,0)}finally{process.env.WHATSAPP_API_TOKEN=token;process.env.WHATSAPP_GROUP_INVITE_URL=invite}
 await c.execute({sql:'UPDATE payments SET refunded=amount WHERE id=?',args:[r.payment.id]});await drainPaymentAlerts(c);assert.equal(sent.length,0);assert.equal((await c.execute('SELECT state FROM booking_alerts WHERE payment_id NOT LIKE \'checkout:%\'')).rows[0].state,'cancelled');
 await captured();await c.execute("UPDATE bookings SET status='cancelled'");await drainPaymentAlerts(c);assert.equal(sent.length,0);
});
test('test/demo captures never queue operational WhatsApp messages',async()=>{
 const c=await db();
 try{for(const mode of ['test','demo']){process.env.BOOKING_MODE=mode;process.env.RAZORPAY_KEY_ID='rzp_test_fixture';await captured()}}finally{process.env.BOOKING_MODE='live';process.env.RAZORPAY_KEY_ID='rzp_live_fixture'}
 assert.equal((await c.execute('SELECT id FROM booking_alerts')).rows.length,0);await drainPaymentAlerts(c);assert.equal(sent.length,0);
});
test('sender configuration accepts only server-side GREEN-API endpoints and a group recipient',()=>{
 assert.ok(whatsappSettings());
 for(const changes of [{WHATSAPP_API_URL:'http://7107.api.greenapi.com'},{WHATSAPP_API_URL:'https://attacker.example'},{WHATSAPP_API_URL:'https://api.greenapi.com/extra'},{WHATSAPP_GROUP_ID:'919999999999@c.us'},{WHATSAPP_GROUP_INVITE_URL:'https://attacker.example/group'}])assert.equal(whatsappSettings({...process.env,...changes}),null);
});

test('a valid live ₹99 button submission sends one unpaid enquiry before any payment, including gateway retries',async()=>{
 const c=await db(),r=await checkout({whatsapp:'+919888888888'});
 assert.equal((await c.execute({sql:'SELECT id FROM bookings WHERE draft_id=?',args:[r.id]})).rows.length,0);
 await createDraft(r.input);await preparePayment(r.id,r.access);await preparePayment(r.id,r.access);
 assert.equal((await c.execute("SELECT id FROM booking_alerts WHERE payment_id LIKE 'checkout:%'")).rows.length,1);
 assert.equal((await drainPaymentAlerts(c)).accepted,1);assert.equal(sent.length,1);
 const text=String(sent[0].body.message);
 for(const detail of ['CHECKOUT STARTED — NOT PAID',r.id,'Fixture Traveler','+919999999999','+919888888888','₹99','not a paid booking','Travel date:','Travelers: 2'])assert.ok(text.includes(detail),detail);
 for(const secret of [r.access,String(process.env.WHATSAPP_API_TOKEN),String(process.env.RAZORPAY_KEY_SECRET),'/reservations/'])assert.ok(!text.includes(secret));
 assert.equal(sent[0].body.chatId,process.env.WHATSAPP_GROUP_ID);
 await drainPaymentAlerts(c);assert.equal(sent.length,1);
 await settle(r.id,r.payment);await settle(r.id,r.payment);await drainPaymentAlerts(c);assert.equal(sent.length,2);assert.match(String(sent[1].body.message),/PAID RESERVATION/);
});
test('invalid, unconsented and changed-price submissions cannot share customer details',async()=>{
 const c=await db();
 for(const input of [{phone:'bad'},{consent:false},{date:'2020-01-01'},{expectedTotal:1},{paymentPlan:'full'}])await assert.rejects(()=>checkout(input));
 assert.equal((await c.execute('SELECT id FROM booking_alerts')).rows.length,0);await drainPaymentAlerts(c);assert.equal(sent.length,0);
});
test('a validated submission is still shared if Razorpay order creation fails, without claiming a payment',async()=>{
 const c=await db();orderFailure=true;await assert.rejects(()=>checkout());orderFailure=false;
 assert.equal((await drainPaymentAlerts(c)).accepted,1);assert.equal(sent.length,1);assert.match(String(sent[0].body.message),/NOT PAID/);
 assert.equal((await c.execute("SELECT id FROM drafts WHERE state='order_unknown' AND id IN (SELECT booking_id FROM booking_alerts)")).rows.length,1);
});
test('an unpaid enquiry waiting to send is suppressed if capture has already been verified',async()=>{
 const c=await db(),r=await checkout();await settle(r.id,r.payment);
 assert.equal((await drainPaymentAlerts(c)).accepted,1);assert.equal(sent.length,1);assert.match(String(sent[0].body.message),/PAID RESERVATION/);
 assert.equal((await c.execute({sql:"SELECT state FROM booking_alerts WHERE payment_id=?",args:['checkout:'+r.id]})).rows[0].state,'cancelled');
});
