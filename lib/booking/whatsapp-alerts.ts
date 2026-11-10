import type {Client,Transaction} from '@libsql/client';
import type {Booking,Draft} from './service';
import {hash,secretToken} from './security';
import {money} from './pricing';

type Executor=Pick<Transaction,'execute'>;
type Env=Record<string,string|undefined>;
export function whatsappSettings(env:Env=process.env){
 try{
  const url=new URL(env.WHATSAPP_API_URL||''),instance=env.WHATSAPP_INSTANCE_ID||'',token=env.WHATSAPP_API_TOKEN||'',group=env.WHATSAPP_GROUP_ID||'';
  const invite=new URL(env.WHATSAPP_GROUP_INVITE_URL||'');
  if(url.protocol!=='https:'||! /^(?:[a-z0-9-]+\.)?api\.green-?api\.com$/.test(url.hostname)||url.username||url.password||url.search||url.hash||url.port||url.pathname!=='/')return null;
  if(!/^\d{1,20}$/.test(instance)||! /^[a-zA-Z0-9_-]{16,200}$/.test(token)||! /^\d+(?:-\d+)?@g\.us$/.test(group))return null;
  if(invite.protocol!=='https:'||invite.hostname!=='chat.whatsapp.com'||! /^\/[a-zA-Z0-9_-]{16,64}$/.test(invite.pathname))return null;
  return {endpoint:`${url.origin}/waInstance${instance}/sendMessage/${token}`,group,target:hash(invite.origin+invite.pathname)};
 }catch{return null}
}
const inline=(value:string,max=120)=>value.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').slice(0,max);
export function paymentAlertMessage(b:Booking,amount:number,phase:'token'|'balance'){
 return [phase==='balance'?'JAISALGO · BALANCE PAYMENT RECEIVED':'JAISALGO · PAID RESERVATION',
  `Booking: ${b.id}`,`Package: ${inline(b.title)}`,`Travel date: ${b.date}`,`Travelers: ${b.choices.travelers}${b.choices.children?` (${b.choices.children} children included)`:''}`,
  `Customer: ${inline(b.name)}`,`Mobile: ${inline(b.phone,30)}`,`Payment received: ${money(amount)}`,`Total paid: ${money(b.paid)}`,`Estimated package total: ${money(b.quote.total)}`,`Remaining: ${money(Math.max(0,b.quote.total-b.paid))}`,
  `Arrangements: ${b.confirmationPending?'Travel desk confirmation pending':'See booking details'}`,
  'Open the travel desk to manage this reservation.'].join('\n');
}
export function checkoutAlertMessage(d:Draft){
 return ['JAISALGO · ₹99 CHECKOUT STARTED — NOT PAID',
  `Checkout reference: ${d.id}`,`Package: ${inline(d.title)}`,`Travel date: ${d.date}`,`Travelers: ${d.choices.travelers}${d.choices.children?` (${d.choices.children} children included)`:''}`,
  `Customer: ${inline(d.name)}`,`Mobile: ${inline(d.phone,30)}`,
  ...(d.whatsapp?[`WhatsApp contact: ${inline(d.whatsapp,30)}`]:[]),
  `Requested payment: ${money(d.amount)}`,`Estimated package total: ${money(d.quote.total)}`,
  `Submitted: ${d.consentAt}`,
  'Payment was not confirmed when this checkout was submitted. This is an enquiry, not a paid booking.',
  'Supplier arrangements require confirmation. Check the travel desk before following up.'].join('\n');
}
function alertTarget(){try{const invite=new URL(process.env.WHATSAPP_GROUP_INVITE_URL||'');if(invite.protocol==='https:'&&invite.hostname==='chat.whatsapp.com')return hash(invite.origin+invite.pathname)}catch{}return ''}
/** Validated, consented live ₹99 submissions only; one event per checkout, including retries. */
export async function queueCheckoutAlert(tx:Executor,d:Draft){
 if(d.mode!=='live'||d.kind!=='token'||d.paymentPlan==='full'||d.amount!==9900||!d.consentAt)return;
 const key='checkout:'+d.id,now=Date.now();
 // The legacy payment_id column is the unique event key; checkout events are namespaced.
 await tx.execute({sql:"INSERT OR IGNORE INTO booking_alerts(id,booking_id,payment_id,target,message,state,created,next_attempt) VALUES(?,?,?,?,?,'pending',?,?)",args:[hash(key),d.id,key,alertTarget(),checkoutAlertMessage(d),now,now]});
}
/** Called inside the captured-payment transaction. No provider credentials or private ticket capability is stored. */
export async function queuePaymentAlert(tx:Executor,b:Booking,paymentId:string,amount:number,phase:'token'|'balance'){
 if(b.mode!=='live')return;
 const target=alertTarget();
 await tx.execute({sql:"INSERT OR IGNORE INTO booking_alerts(id,booking_id,payment_id,target,message,state,created,next_attempt) VALUES(?,?,?,?,?,'pending',?,?)",args:[hash('payment:'+paymentId),b.id,paymentId,target,paymentAlertMessage(b,amount,phase),Date.now(),Date.now()]});
}
/** One consented, verified new-user entry; no sign-in tokens or Google subject reach WhatsApp. */
export async function queueSignupAlert(tx:Executor,user:{id:string;name:string;email:string;consentAt:string},now=Date.now()){
 if(process.env.CUSTOMER_SIGNUP_ALERTS_ENABLED!=='true'||!user.consentAt)return;
 const key='signup:'+user.id,message=['JAISALGO · NEW GOOGLE SIGN-IN',`Name: ${inline(user.name)}`,`Google email: ${inline(user.email,320)}`,`Joined: ${new Date(now).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST`,'The user agreed to share these contact details with the private travel desk group.','New user entry only — no booking or payment has been made.'].join('\n');
 await tx.execute({sql:"INSERT OR IGNORE INTO booking_alerts(id,booking_id,payment_id,target,message,state,created,next_attempt) VALUES(?,?,?,?,?,'pending',?,?)",args:[hash(key),user.id,key,alertTarget(),message,now,now]});
}
/** Only definite non-acceptance is retried automatically. Unknown sends need review to avoid duplicate group posts. */
export async function drainPaymentAlerts(c:Client,now=Date.now()){
 const settings=whatsappSettings();if(!settings)return {configured:false,accepted:0,pending:0,review:0};
 await c.execute({sql:"UPDATE booking_alerts SET state='review',last_error='delivery_unknown' WHERE state='sending' AND lease_until<=?",args:[now]});
 const rows=(await c.execute({sql:"SELECT * FROM booking_alerts WHERE state='pending' AND next_attempt<=? AND target=? ORDER BY created LIMIT 3",args:[now,settings.target]})).rows;
 let accepted=0;
 for(const row of rows){
  const claim=secretToken(),changed=await c.execute({sql:"UPDATE booking_alerts SET state='sending',claim=?,lease_until=?,attempts=attempts+1 WHERE id=? AND state='pending' AND next_attempt<=?",args:[claim,now+60000,row.id,now]});
  if(!changed.rowsAffected)continue;
  const finish=async(state:string,error:string,providerId='')=>c.execute({sql:'UPDATE booking_alerts SET state=?,last_error=?,provider_id=?,next_attempt=?,claim=NULL,lease_until=0 WHERE id=? AND claim=?',args:[state,error,providerId,now+Math.min(3600000,60000*2**Math.min(6,Number(row.attempts))),row.id,claim]});
  try{
   if(String(row.payment_id)==='signup:'+row.booking_id){
    const user=(await c.execute({sql:'SELECT consent_at FROM customer_users WHERE id=?',args:[row.booking_id]})).rows[0];
    if(process.env.CUSTOMER_SIGNUP_ALERTS_ENABLED!=='true'||!user?.consent_at){await finish('cancelled','signup_not_active');continue}
   }else if(String(row.payment_id)==='checkout:'+row.booking_id){
    const draft=(await c.execute({sql:'SELECT payload,state FROM drafts WHERE id=?',args:[row.booking_id]})).rows[0];
    const paid=(await c.execute({sql:'SELECT id FROM payments WHERE draft_id=?',args:[row.booking_id]})).rows[0];
    const d=draft?JSON.parse(String(draft.payload)) as Draft:null;
    if(!d||d.mode!=='live'||d.kind!=='token'||d.paymentPlan==='full'||d.amount!==9900||!d.consentAt||paid||['captured','refunded','refund_required','payment_review'].includes(String(draft?.state))){await finish('cancelled','checkout_not_unpaid');continue}
   }else{
    const payment=(await c.execute({sql:'SELECT p.mode,p.refunded,b.status FROM payments p JOIN bookings b ON b.id=? WHERE p.id=?',args:[row.booking_id,row.payment_id]})).rows[0];
    if(!payment||payment.mode!=='live'||Number(payment.refunded)>0||!['reserved','paid'].includes(String(payment.status))){await finish('cancelled','booking_not_active');continue}
   }
   const response=await fetch(settings.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:settings.group,message:row.message,linkPreview:false}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
   if([401,403,429].includes(response.status)){await finish('pending','provider_'+response.status);continue}
   if(!response.ok){await finish('review','provider_'+response.status);continue}
   const result=await response.json();
   if(typeof result.idMessage!=='string'||!result.idMessage||result.idMessage.length>200){await finish('review','missing_receipt');continue}
   await finish('accepted','',result.idMessage);accepted++;
  }catch{await finish('review','delivery_unknown')}
 }
 const counts=(await c.execute("SELECT state,COUNT(*) count FROM booking_alerts WHERE state IN ('pending','review') GROUP BY state")).rows;
 return {configured:true,accepted,pending:Number(counts.find(r=>r.state==='pending')?.count||0),review:Number(counts.find(r=>r.state==='review')?.count||0)};
}
