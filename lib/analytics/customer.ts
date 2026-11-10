import {hash} from '@/lib/booking/security';
import {analyticsConsentVersion} from './consent';
import {analyticsDb,consentContext,storeEvent} from './server';
import {queuePosthogLifecycle} from './posthog-server';
import type {AnalyticsEvent} from './schema';
export const customerAnalyticsId=(id:string)=>'acct_'+hash('jaisalgo-analytics-customer:'+id);
/** Failures here must not affect authentication, enquiry delivery or operational alerts. */
export async function recordCustomerAnalytics(result:{user:{id:string};isNew:boolean;sessionToken:string},raw:unknown){
 try{const context=await consentContext(raw);if(context?.consentVersion!==analyticsConsentVersion||!context.posthog)return;const c=await analyticsDb(),account=customerAnalyticsId(result.user.id);
 for(const [name,key] of [...(result.isNew?[['signup_completed',result.user.id]]:[]),['login_completed',hash(result.sessionToken)]]){
  const event:AnalyticsEvent={id:hash('analytics:'+name+':'+key),name,at:Date.now(),mode:'live',origin:'server',session:context.sessionId,attempt:null,props:{account_type:'google',sign_in_method:'google'}};
  await storeEvent(event);const row=(await c.execute({sql:'SELECT at FROM analytics_events WHERE id=?',args:[event.id]})).rows[0];if(row)await queuePosthogLifecycle(c,{...event,at:Number(row.at)},context,account);
 }
 }catch{}
}
export async function recordAcceptedEnquiry(raw:unknown,attempt:unknown){
 try{if(typeof attempt!=='string'||!/^[a-f0-9-]{36}$/i.test(attempt))return;const context=await consentContext(raw);if(context?.consentVersion!==analyticsConsentVersion||!context.posthog)return;const event:AnalyticsEvent={id:hash('enquiry_accepted:'+attempt),name:'enquiry_accepted',at:Date.now(),mode:'live',origin:'server',session:context.sessionId,attempt:null,props:{enquiry_mode:'delivery'}};await storeEvent(event);const c=await analyticsDb(),row=(await c.execute({sql:'SELECT at FROM analytics_events WHERE id=?',args:[event.id]})).rows[0];if(row)await queuePosthogLifecycle(c,{...event,at:Number(row.at)},context)}catch{}
}
