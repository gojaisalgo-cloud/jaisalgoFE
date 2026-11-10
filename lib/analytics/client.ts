'use client';
import {analyticsAllowed,analyticsConsentVersion,analyticsPreferences,analyticsPreferencesKey} from './consent';
import {captureBehaviour,captureBehaviourOnce,posthogMeasurement,resetPosthogIdentity,resetCustomerAnalytics} from './posthog-client';
import {referralSource} from './referrals';
import {cityGuideAtPath} from '@/data/city-guide-keys';
import type {ClientEvent,EventProps,Measurement} from './schema';
const preference='jaisalgo_measurement',sessionKey='jaisalgo_measurement_session';
let firstParty=true;let campaigns=new Set<string>();export function configureCampaigns(ids:string[],enabled=true){campaigns=new Set(ids);firstParty=enabled}
let waiting:{id:string;at:number;name:ClientEvent;context:Measurement;props:EventProps}[]=[],sending=false;
const visited=new Set<string>();
const clocks=new Map<string,{total:number;start:number;paused:boolean;gateway:boolean}>();
export const permitted=analyticsAllowed;
export function measurement(packageId?:string):Measurement|undefined{if(typeof window==='undefined'||!permitted())return;try{let s=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(!s||Date.now()-s.at>1800000){let source:Measurement['source']='direct';const u=new URL(location.href),medium=u.searchParams.get('utm_medium')||'';if(/^(cpc|ppc|paid)$/.test(medium))source='paid';else if(medium==='email')source='email';else source=referralSource(document.referrer,location.origin);const campaign=u.searchParams.get('utm_campaign')||'unassigned';s={id:crypto.randomUUID(),at:Date.now(),source,campaign:campaigns.has(campaign)?campaign:campaign==='unassigned'?'unassigned':'other',attempts:{}}}s.at=Date.now();if(packageId&&!s.attempts[packageId])s.attempts[packageId]=crypto.randomUUID();sessionStorage.setItem(sessionKey,JSON.stringify(s));return {consent:true,consentVersion:analyticsConsentVersion,sessionId:s.id,attemptId:packageId?s.attempts[packageId]:undefined,device:innerWidth<640?'mobile':innerWidth<1024?'tablet':'desktop',source:s.source,campaign:s.campaign,posthog:posthogMeasurement()}}catch{return}}
export async function flush(){if(!firstParty){waiting=[];return}if(sending||!waiting.length)return;sending=true;const batch=waiting.splice(0,12);let retry=false;try{const r=await fetch('/api/analytics/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:batch}),keepalive:true});if(r.status>=500){retry=true;waiting.unshift(...batch)}}catch{retry=true;waiting.unshift(...batch)}finally{waiting=waiting.slice(-36);sending=false;if(!retry&&waiting.length)void flush()}}
export function track(name:ClientEvent,props:EventProps={},context=measurement(props.packageId)){if(!context||!permitted())return;bridgePosthog(name,props,context);if(!firstParty)return;if(!visited.has(context.sessionId)){visited.add(context.sessionId);waiting.push({id:crypto.randomUUID(),at:Date.now(),name:'website_visit',context:{...context,attemptId:undefined},props:cityGuideAtPath(location.pathname)?{cityGuideId:cityGuideAtPath(location.pathname)}:{}})}if(name!=='website_visit')waiting.push({id:crypto.randomUUID(),at:Date.now(),name,context,props});void flush()}
export function clockStart(slug:string){if(!clocks.has(slug))clocks.set(slug,{total:0,start:Date.now(),paused:document.hidden,gateway:false});else clockPause(slug,document.hidden)}
export function clockPause(slug:string,paused:boolean,reason:'gateway'|'visibility'='visibility'){const c=clocks.get(slug);if(!c)return;if(!c.paused)c.total+=Date.now()-c.start;c.start=Date.now();if(reason==='gateway')c.gateway=paused;c.paused=c.gateway||(reason==='visibility'?paused:document.hidden)}
export function activeTime(slug:string){const c=clocks.get(slug);return c?Math.min(86400000,Math.round(c.total+(c.paused?0:Date.now()-c.start))):0}
export async function chooseConsent(allow:boolean,options:{replay?:boolean;location?:boolean}={}){const context=measurement();waiting=[];if(!allow)resetPosthogIdentity();try{localStorage.setItem(preference,allow?'allow':'decline');localStorage.setItem(analyticsPreferencesKey,JSON.stringify({version:analyticsConsentVersion,analytics:allow,replay:allow&&options.replay===true,location:allow&&options.location===true,at:Date.now()}));if(!allow)sessionStorage.removeItem(sessionKey)}catch{}if(!allow&&context)try{await fetch('/api/analytics/events',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:context.sessionId}),keepalive:true})}catch{}window.dispatchEvent(new Event('jaisalgo-consent-changed'))}
export function consentChoice(){try{const p=analyticsPreferences();return p?p.analytics?'allow':'decline':localStorage.getItem(preference)==='decline'?'decline':null}catch{return 'decline'}}

function bridgePosthog(name:ClientEvent,props:EventProps,context:Measurement){
 const common={...(props.paymentEnvironment?{payment_environment:props.paymentEnvironment}:{}),...(props.paymentPhase?{payment_phase:props.paymentPhase}:{}),...(props.paymentAmount!==undefined?{payment_amount_inr:props.paymentAmount/100}:{}),...(props.packageId?{package_slug:props.packageId,package_id:props.packageId}:{}),...(context.attemptId?{attempt_id:context.attemptId}:{}),arrival_city:'Jaisalmer' as const,currency:'INR' as const,...(props.price!==undefined?{package_price_inr:props.price/100}:{}),...(props.travellers!==undefined?{traveller_count:props.travellers}:{}),...(props.children!==undefined?{children_count:props.children}:{}),...(props.date?{travel_month:props.date.slice(0,7)}:{})};
 switch(name){
 case 'package_info_opened':captureBehaviourOnce('package-view:'+props.packageId,'package_viewed',common);break;
 case 'book_now_clicked':captureBehaviour('reserve_cta_clicked',{...common,reservation_amount_inr:99,cta_location:location.pathname.startsWith('/packages/')?'package_details':'package_card'});break;
 case 'reservation_99_clicked':captureBehaviour('reserve_cta_clicked',{...common,reservation_amount_inr:99,cta_location:'checkout'});break;
 case 'date_selected':captureBehaviour('travel_date_selected',common);break;
 case 'travellers_selected':captureBehaviour('traveller_count_updated',common);break;
 case 'variant_selected':captureBehaviour('package_variant_updated',{...common,...(props.stay?{stay_category:props.stay}:{}),...(props.rooming?{rooming:props.rooming}:{}),...(props.travelMode?{travel_mode:props.travelMode}:{})});break;
 case 'payment_initiated':captureBehaviour('payment_initiated',{...common,...(props.paymentPhase==='balance'||props.paymentPhase==='full'?{}:{reservation_amount_inr:99 as const}),booking_step:'payment'});break;
 case 'booking_error':captureBehaviour(props.reason==='payment_failed'?'payment_attempt_failed':'booking_error',{...common,reason:['network','validation','price_changed','availability','payment_failed','gateway_closed','gateway_load','unknown'].includes(props.reason||'')?props.reason as 'network':'unknown'});break;
 case 'support_clicked':if(props.support==='whatsapp')captureBehaviour('whatsapp_contact_clicked');else if(props.support==='phone')captureBehaviour('call_contact_clicked');break;
 case 'city_guide_viewed':captureBehaviourOnce('city-guide:'+props.cityGuideId,'city_guide_viewed',{city_guide_target:props.cityGuideId});break;
 case 'city_package_clicked':captureBehaviour('city_package_clicked',{...common,city_guide_target:props.cityGuideId});break;
 }
}

/** Drop queued events and checkout timing before another person uses this device. */
export function resetAnalyticsForLogout(){waiting=[];visited.clear();clocks.clear();resetCustomerAnalytics()}
