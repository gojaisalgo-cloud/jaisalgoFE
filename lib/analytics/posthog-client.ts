'use client';
import {sanitizeHeatmap,sanitizeReplayUrls} from './posthog-privacy';
import {analyticsAllowed,analyticsConsentVersion,replayAllowed,locationAllowed} from './consent';
import {pageLifecycle,engagementClock} from './posthog-navigation';
import type {PostHog,PostHogConfig,CaptureResult} from 'posthog-js';
import {analyticsPage,trafficSource,privateAnalyticsPage,pageType,posthogHost,marketingTouch,approvedMarketing,behaviourEvents,safeBehaviourProps,behaviourPropsSchema,posthogIdentitySchema,type BehaviourEvent,type BehaviourProps,type Marketing} from './posthog-schema';

const identityKey='jaisalgo_posthog_identity',attributionKey='jaisalgo_posthog_attribution',accountKey='jaisalgo_posthog_account';
const token=process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,host=posthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);
let entryAttribution:{firstTouch:Marketing;latestTouch:Marketing}|undefined,entryAt=0;
let sdk:PostHog|undefined,loading:Promise<void>|undefined,memoryId:string|undefined,accountId:string|undefined,lastIdentifiedId:string|undefined;
let accountKnown=false;
let engagement:{path:string;clock:ReturnType<typeof engagementClock>}|undefined;
let visitCount=1;
const navigation=pageLifecycle();
const once=new Set<string>();
const queue:{name:BehaviourEvent;props:BehaviourProps;at:number}[]=[];
const lists={campaigns:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CAMPAIGNS||'',content:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CONTENT||'',terms:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_TERMS||''};
export const posthogConfigured=()=>!!token&&!!host&&process.env.NEXT_PUBLIC_POSTHOG_ENABLED!=='false';
export const posthogConsent=analyticsAllowed;
const replaySample=()=>{const rate=Number(process.env.NEXT_PUBLIC_POSTHOG_REPLAY_SAMPLE_RATE||'.1');return Number.isFinite(rate)?Math.max(0,Math.min(1,rate)):.1};
const environment=process.env.NEXT_PUBLIC_POSTHOG_ENVIRONMENT||'development';
function attribution(){
  if(entryAttribution)return entryAttribution;
  entryAt=Date.now();const touch=marketingTouch(location.href,document.referrer,lists);let previous:unknown;
  try{previous=JSON.parse(localStorage.getItem(attributionKey)||'null')}catch{}
  const prior=previous as {firstTouch?:unknown}|null,parsed=posthogIdentitySchema.shape.firstTouch.safeParse(prior?.firstTouch);
  entryAttribution={firstTouch:parsed.success?approvedMarketing(parsed.data,lists):touch,latestTouch:touch};
  try{localStorage.setItem(attributionKey,JSON.stringify(entryAttribution))}catch{}
  return entryAttribution;
}
function anonymousId(){if(memoryId)return memoryId;try{const id=localStorage.getItem(identityKey);if(id&&/^[a-f0-9-]{36}$/i.test(id)&&posthogIdentitySchema.shape.distinctId.safeParse(id).success)return memoryId=id}catch{}memoryId=crypto.randomUUID();try{localStorage.setItem(identityKey,memoryId)}catch{}return memoryId}
export function posthogMeasurement(){if(!posthogConfigured()||!posthogConsent())return;try{const parsed=posthogIdentitySchema.safeParse({distinctId:accountId||sdk?.get_distinct_id()||anonymousId(),...(sdk?{sessionId:sdk.get_session_id()}:{}),...attribution()});return parsed.success?parsed.data:undefined}catch{return}}
function common(){const touch=attribution();return {analytics_environment:environment,page_path:analyticsPage(location.pathname),page_type:pageType(analyticsPage(location.pathname)),device_category:innerWidth<640?'mobile':innerWidth<1024?'tablet':'desktop',account_type:accountId?'google':'guest',visit_count:visitCount,visitor_type:visitCount>1?'returning':'new',...touch.latestTouch,traffic_source:trafficSource(touch.latestTouch),first_touch_traffic_source:trafficSource(touch.firstTouch),latest_touch_traffic_source:trafficSource(touch.latestTouch),...Object.fromEntries(Object.entries(touch.firstTouch).map(([k,v])=>['first_touch_'+k,v])),...Object.fromEntries(Object.entries(touch.latestTouch).map(([k,v])=>['latest_touch_'+k,v]))}}
/** SDK metadata is reduced before transmission; unknown routes, query strings and fragments never leave the browser. */
export function sanitizePosthogEvent(event:CaptureResult|null):CaptureResult|null {
  if(!event||!posthogConsent()||analyticsPage(location.pathname)==='/admin')return null;
  const page=analyticsPage(location.pathname);
  if(event.event==='$snapshot')return !replayAllowed()||privateAnalyticsPage(page)?null:{...event,properties:sanitizeReplayUrls(event.properties,location.origin) as CaptureResult['properties']};
  if(![...behaviourEvents,'$pageview','$pageleave','$autocapture','$$heatmap','$identify','$set'].includes(event.event))return null;
  if(privateAnalyticsPage(page)&&['$autocapture','$$heatmap'].includes(event.event))return null;
  // The SDK requires its public project token after before_send; dropping it discards every event.
  // Use configured routing rather than accepting a token supplied in event properties.
  const p=event.properties||{},eventPage=typeof p.page_path==='string'?analyticsPage(p.page_path):page,referrer=attribution().latestTouch.referrer_origin,properties:Record<string,unknown>={...common(),token,$current_url:location.origin+eventPage,$pathname:eventPage,$host:location.hostname,$referrer:referrer?.startsWith('https://')?referrer:'$direct',$referring_domain:referrer?.startsWith('https://')?new URL(referrer).hostname:'$direct',$geoip_disable:!locationAllowed()};
  for(const key of ['distinct_id','$device_id','$session_id','$window_id','$lib','$lib_version','$browser','$browser_version','$os','$os_version','$device_type','$screen_width','$screen_height','$viewport_width','$viewport_height','$pageview_id','$event_type','$ce_version','$is_identified','$process_person_profile'])if(p[key]!==undefined)properties[key]=p[key];
  if(['$identify','$set'].includes(event.event)){
    if(typeof p.distinct_id!=='string'||!/^acct_[a-f0-9]{64}$/.test(p.distinct_id))return null;
    if(typeof p.$anon_distinct_id==='string'&&/^[a-f0-9-]{36}$/i.test(p.$anon_distinct_id)&&posthogIdentitySchema.shape.distinctId.safeParse(p.$anon_distinct_id).success)properties.$anon_distinct_id=p.$anon_distinct_id;
    properties.$set={account_type:'google',sign_in_method:'google',analytics_consent_version:analyticsConsentVersion};properties.$process_person_profile=true;
  }
  const custom=safeBehaviourProps(Object.fromEntries(Object.entries(p).filter(([key])=>key in behaviourPropertyKeys)));if(custom)Object.assign(properties,custom);
  if(event.event==='$autocapture'&&Array.isArray(p.$elements))properties.$elements=p.$elements.map((el:Record<string,unknown>)=>({tag_name:['a','button','svg','path'].includes(String(el.tag_name))?el.tag_name:'element',...(typeof el.nth_child==='number'?{nth_child:el.nth_child}:{})}));
  // Heatmap data is generated by the SDK; retain coordinates, never its raw page URL.
  if(event.event==='$$heatmap'&&p.$heatmap_data)properties.$heatmap_data=sanitizeHeatmap(p.$heatmap_data,location.origin);
  return {...event,properties};
}
const behaviourPropertyKeys=behaviourPropsSchema.shape;
const publicCapture={dom_event_allowlist:['click'] as ['click'],element_allowlist:['a','button'] as ['a','button'],css_selector_ignorelist:['.ph-no-capture','.ph-no-autocapture','[data-ph-no-autocapture]','form','input','textarea','select','iframe','[data-posthog-private]'],capture_copied_text:false,capture_value_css_selector_allowlist:[]};
export function posthogNavigationStart(url:string){try{if(privateAnalyticsPage(analyticsPage(new URL(url,location.origin).pathname))){sdk?.stopSessionRecording();sdk?.set_config({autocapture:false,capture_heatmaps:false})}}catch{}}
function setPrivacy(){if(!sdk)return;const privatePage=privateAnalyticsPage(analyticsPage(location.pathname));sdk.set_config({autocapture:privatePage?false:publicCapture,capture_heatmaps:!privatePage,ip:locationAllowed()});if(privatePage||!replayAllowed())sdk.stopSessionRecording();else if(replaySample()>0)sdk.startSessionRecording()}
function identifyCustomer(){if(!sdk||!posthogConsent()||!accountId||lastIdentifiedId===accountId)return;sdk.identify(accountId,{account_type:'google',sign_in_method:'google',analytics_consent_version:analyticsConsentVersion});lastIdentifiedId=accountId}
/** Only an opaque ID supplied by the authenticated server is accepted. Never a name or email. */
export function setCustomerAnalyticsIdentity(value:unknown){
 const next=typeof value==='string'&&/^acct_[a-f0-9]{64}$/.test(value)?value:undefined;
 let prior=accountId;try{prior=prior||localStorage.getItem(accountKey)||undefined}catch{}
 accountKnown=true;
 if(prior&&prior!==next){resetCustomerAnalytics(false)}
 accountId=next;
 if(posthogConsent()){try{if(next)localStorage.setItem(accountKey,next);else localStorage.removeItem(accountKey)}catch{}if(!loading)void initializePosthog().then(identifyCustomer)}
}
export function resetCustomerAnalytics(restart=true){accountKnown=true;accountId=undefined;lastIdentifiedId=undefined;try{sdk?.stopSessionRecording();sdk?.reset(true);memoryId=sdk?.get_distinct_id()||crypto.randomUUID();localStorage.setItem(identityKey,memoryId);localStorage.removeItem('jaisalgo_posthog_visit');localStorage.removeItem(accountKey);sessionStorage.removeItem('jaisalgo_measurement_session');sessionStorage.removeItem('jaisalgo_posthog_landing')}catch{}visitCount=1;once.clear();queue.length=0;engagement=undefined;if(restart)navigation.reset();if(restart&&posthogConsent())posthogPage(location.pathname)}
function markSession(){if(!sdk||!posthogConsent())return;const session=sdk.get_session_id();try{const prior=JSON.parse(localStorage.getItem('jaisalgo_posthog_visit')||'null');if(prior?.session===session){visitCount=Math.max(1,Math.min(100000,Number(prior.count)||1));return}visitCount=Math.max(1,Math.min(100000,(Number(prior?.count)||0)+1));localStorage.setItem('jaisalgo_posthog_visit',JSON.stringify({session,count:visitCount}));sdk.capture('session_started',{...common(),visit_count:visitCount,visitor_type:visitCount>1?'returning':'new'})}catch{}}
export function posthogActivity(visible?:boolean){if(!engagement||!posthogConsent())return;if(typeof visible==='boolean')engagement.clock.visibility(visible);else engagement.clock.activity()}
function finishEngagement(){const current=engagement;engagement=undefined;if(current&&posthogConsent())captureBehaviour('page_engagement',{page_path:current.path,page_type:pageType(current.path),...current.clock.snapshot()})}

export function initializePosthog(){
  if(!posthogConfigured()||!posthogConsent())return Promise.resolve();
  if(sdk){sdk.opt_in_capturing({captureEventName:false});setPrivacy();identifyCustomer();return Promise.resolve()}
  if(loading)return loading;
  loading=import('posthog-js').then(async({default:posthog})=>{
    // Resolve the HttpOnly session before loading a persisted identity. An expired
    // session on a shared device must never inherit the previous account.
    if(!accountKnown){const response=await fetch('/api/auth/session',{cache:'no-store'});if(!response.ok)return;const session=await response.json();setCustomerAnalyticsIdentity(session.user?.analyticsId)}
    if(!posthogConsent())return;
    const config:Partial<PostHogConfig>={api_host:host,defaults:'2026-08-30',bootstrap:{distinctID:accountId||anonymousId(),isIdentifiedID:!!accountId},person_profiles:'identified_only',persistence:'localStorage',capture_pageview:false,capture_pageleave:false,autocapture:false,capture_heatmaps:false,mask_all_text:true,mask_all_element_attributes:true,save_campaign_params:false,save_referrer:false,disable_surveys:true,disable_session_recording:true,enable_recording_console_log:false,capture_performance:false,capture_exceptions:false,capture_dead_clicks:false,disable_external_dependency_loading:false,respect_dnt:true,ip:locationAllowed(),
      session_recording:{compress_events:false,maskAllInputs:true,maskTextSelector:'*',maskAllElementAttributes:true,blockSelector:'iframe,form,input,textarea,select,[data-posthog-private],.ph-no-capture',recordCrossOriginIframes:false,recordHeaders:false,recordBody:false,maskNetworkRequestFn:data=>{try{const u=new URL(data.url);return u.origin===location.origin?{url:u.origin+analyticsPage(u.pathname)}:null}catch{return null}},maskCapturedNetworkRequestFn:()=>null,sampleRate:replaySample(),captureCanvas:{recordCanvas:false}},
      before_send:sanitizePosthogEvent,get_current_url:()=>location.origin+analyticsPage(location.pathname),loaded:()=>{sdk=posthog;setPrivacy();identifyCustomer();markSession()},
    };posthog.init(token!,config);
  }).catch(()=>{queue.length=0}).finally(()=>{loading=undefined});return loading;
}
export function captureBehaviour(name:BehaviourEvent,props:BehaviourProps={}){
  if(!posthogConfigured()||!posthogConsent()||analyticsPage(location.pathname)==='/admin')return;
  const safe=safeBehaviourProps(props);if(!safe)return;
  try{if(sdk){markSession();sdk.capture(name,{...common(),...safe})}else{queue.push({name,props:{...safe,page_path:analyticsPage(location.pathname),page_type:pageType(analyticsPage(location.pathname))},at:Date.now()});if(queue.length>40)queue.shift();void initializePosthog()}}catch{/* Optional analytics never affects the action. */}
}
function pageleave(path:string|undefined){try{if(path&&sdk&&posthogConsent()&&path!=='/admin')sdk.capture('$pageleave',{page_path:path,page_type:pageType(path)})}catch{}}
export function posthogPage(path:string){if(!posthogConfigured()||!posthogConsent())return;const page=analyticsPage(path),visit=navigation.start(page);if(!visit)return;finishEngagement();if(page!=='/admin'){engagement={path:page,clock:engagementClock()};engagement.clock.visibility(!document.hidden)}pageleave(visit.previous);if(visit.changed)once.clear();void initializePosthog().then(()=>{if(!sdk||!posthogConsent()||!navigation.ready(visit.revision)||page==='/admin')return;setPrivacy();identifyCustomer();markSession();sdk.capture('$pageview',{...common(),page_path:page});const session=sdk.get_session_id();let seenLanding=false;try{seenLanding=sessionStorage.getItem('jaisalgo_posthog_landing')===session}catch{}if(navigation.landing(session)&&!seenLanding){const entry=attribution().latestTouch.landing_page_path;sdk.capture('landing_page_viewed',{...common(),page_path:entry,page_type:pageType(entry)},{timestamp:new Date(entryAt)});try{sessionStorage.setItem('jaisalgo_posthog_landing',session)}catch{}};while(queue.length&&posthogConsent()){const event=queue.shift()!;sdk.capture(event.name,{...common(),...event.props},{timestamp:new Date(event.at)})}if(page==='/packages')captureBehaviour('package_list_viewed');}).catch(()=>{})}
export function posthogPageleave(){finishEngagement();pageleave(navigation.end())}
export function resetPosthogIdentity(){try{sdk?.stopSessionRecording();sdk?.reset();sdk?.opt_out_capturing();localStorage.removeItem(identityKey);localStorage.removeItem(attributionKey);localStorage.removeItem(accountKey);localStorage.removeItem('jaisalgo_posthog_visit');sessionStorage.removeItem('jaisalgo_posthog_landing')}catch{}queue.length=0;once.clear();memoryId=undefined;lastIdentifiedId=undefined;engagement=undefined;visitCount=1;entryAttribution=undefined;entryAt=0;navigation.reset()}

export function captureBehaviourOnce(key:string,name:BehaviourEvent,props:BehaviourProps={}){if(!posthogConsent()||!posthogConfigured()||once.has(key))return;once.add(key);captureBehaviour(name,props)}
