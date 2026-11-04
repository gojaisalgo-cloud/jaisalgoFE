import {createHash,randomUUID} from 'node:crypto';
import type {Client} from '@libsql/client';
import {PostHog,type EventMessage} from 'posthog-node';
import {posthogHost,trafficSource,posthogIdentitySchema,approvedMarketing} from './posthog-schema';
import type {AnalyticsEvent,Measurement} from './schema';

const serverNames:Record<string,string>={reservation_payment_verified:'reservation_completed',booking_confirmed:'booking_confirmed',balance_payment_completed:'full_booking_paid',payment_failed:'payment_failed',refund_recorded:'refund_recorded',trip_completed:'trip_completed'};
export function posthogServerConfigured(){return !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN&&!!posthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST)&&process.env.ANALYTICS_ENABLED!=='false'&&process.env.NEXT_PUBLIC_POSTHOG_ENABLED!=='false'}
export function stableEventUuid(id:string){const h=createHash('sha256').update('posthog:'+id).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`}
/** Only trusted server ledger events can produce financial events. No order, booking ID, names or contact fields. */
export function financialPosthogEvent(event:AnalyticsEvent,measurement:Measurement):EventMessage|undefined{
  const identity=posthogIdentitySchema.safeParse(measurement.posthog),name=serverNames[event.name];
  if(event.origin!=='server'||!name||!identity.success||!event.session||measurement.consent!==true)return;
  const lists={campaigns:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CAMPAIGNS||'',content:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CONTENT||'',terms:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_TERMS||''};identity.data.firstTouch=approvedMarketing(identity.data.firstTouch,lists);identity.data.latestTouch=approvedMarketing(identity.data.latestTouch,lists);
  const p=event.props,properties:Record<string,unknown>={currency:'INR',arrival_city:'Jaisalmer',payment_environment:event.mode,analytics_environment:process.env.NEXT_PUBLIC_POSTHOG_ENVIRONMENT||process.env.VERCEL_ENV||'development',event_source:'verified_backend',$geoip_disable:true,$process_person_profile:false,...(identity.data.sessionId?{$session_id:identity.data.sessionId}:{})};
  if(typeof p.packageId==='string'&&/^[a-z0-9-]{2,90}$/.test(p.packageId))properties.package_slug=p.packageId;
  if(typeof p.price==='number'&&Number.isSafeInteger(p.price))properties.package_price_inr=p.price/100;
  if(typeof p.travellers==='number')properties.traveller_count=p.travellers;
  if(typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date))properties.travel_month=p.date.slice(0,7);
  if(event.attempt&&/^[0-9a-f-]{36}$/i.test(event.attempt))properties.attempt_id=event.attempt;
  for(const [prefix,touch] of [['first_touch',identity.data.firstTouch],['latest_touch',identity.data.latestTouch]] as const)for(const [key,value] of Object.entries(touch))properties[prefix+'_'+key]=value;
  properties.traffic_source=trafficSource(identity.data.latestTouch);properties.first_touch_traffic_source=trafficSource(identity.data.firstTouch);properties.latest_touch_traffic_source=trafficSource(identity.data.latestTouch);
  properties.landing_page_path=identity.data.firstTouch.landing_page_path;
  if(p.phase==='token'||p.phase==='balance')properties.payment_phase=p.phase;else if(['reservation_payment_verified','booking_confirmed'].includes(event.name))properties.payment_phase='token';else if(event.name==='balance_payment_completed')properties.payment_phase='balance';
  const paid=typeof p.paidPaise==='number'?p.paidPaise:0,refunded=typeof p.refundedPaise==='number'?p.refundedPaise:0,total=typeof p.price==='number'?p.price:0;
  if(event.name!=='payment_failed'){properties.total_collected_inr=paid/100;properties.refunded_inr=refunded/100}if(['reservation_payment_verified','booking_confirmed','balance_payment_completed'].includes(event.name)){properties.reservation_amount_inr=99;properties.outstanding_balance_inr=Math.max(0,total-paid)/100}
  if(event.name==='reservation_payment_verified')properties.deposit_collected_inr=99;
  if(event.name==='balance_payment_completed')properties.fully_paid=true;
  if(event.name==='refund_recorded'&&typeof p.refundTotal==='number')properties.refund_total_inr=p.refundTotal/100;
  return {distinctId:identity.data.distinctId,event:name,uuid:stableEventUuid(event.id),timestamp:new Date(event.at),disableGeoip:true,properties};
}
export async function queuePosthogFinancial(c:Client,event:AnalyticsEvent,measurement:Measurement){if(!posthogServerConfigured())return;const payload=financialPosthogEvent(event,measurement);if(!payload)return;await c.execute({sql:'INSERT OR IGNORE INTO posthog_outbox(id,session,payload,state,attempts,next_at,lock_id) VALUES(?,?,?,\'pending\',0,0,NULL)',args:[event.id,event.session,JSON.stringify(payload)]})}
export async function drainPosthogOutbox(c:Client,send?:(event:EventMessage)=>Promise<void>){
  if(!posthogServerConfigured())return {sent:0,failed:0};
  let client:PostHog|undefined;const result={sent:0,failed:0};
  try{
    if(!send){client=new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,{host:posthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST),flushAt:1,flushInterval:0,fetchRetryCount:0,requestTimeout:2000,disableGeoip:true});send=e=>client!.captureImmediate(e)}
    const lock=randomUUID(),now=Date.now();
    const rows=(await c.execute({sql:"UPDATE posthog_outbox SET state='sending',lock_id=?,next_at=? WHERE id IN (SELECT id FROM posthog_outbox WHERE state!='sent' AND attempts<10 AND next_at<=? ORDER BY rowid LIMIT 10) RETURNING id,session,payload",args:[lock,now+60000,now]})).rows;
    for(const row of rows){
      if((await c.execute({sql:'SELECT session FROM analytics_withdrawals WHERE session=?',args:[String(row.session)]})).rows.length){await c.execute({sql:'DELETE FROM posthog_outbox WHERE id=? AND lock_id=?',args:[String(row.id),lock]});continue}
      try{const event=JSON.parse(String(row.payload));event.timestamp=new Date(event.timestamp);await send(event);await c.execute({sql:"UPDATE posthog_outbox SET state='sent',payload='{}' WHERE id=? AND lock_id=?",args:[String(row.id),lock]});result.sent++}
      catch{await c.execute({sql:"UPDATE posthog_outbox SET state='pending',attempts=attempts+1,next_at=? WHERE id=? AND lock_id=?",args:[Date.now()+60000,String(row.id),lock]});result.failed++}
    }
  }catch{/* No SDK or network failure escapes into the booking path. */}finally{await client?.shutdown(1000).catch(()=>{})}
  return result;
}
