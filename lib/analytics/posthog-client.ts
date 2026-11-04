'use client';
import {sanitizeHeatmap,sanitizeReplayUrls} from './posthog-privacy';
import {pageLifecycle} from './posthog-navigation';
import type {PostHog,PostHogConfig,CaptureResult} from 'posthog-js';
import {analyticsPage,trafficSource,privateAnalyticsPage,pageType,posthogHost,marketingTouch,approvedMarketing,behaviourEvents,safeBehaviourProps,posthogIdentitySchema,type BehaviourEvent,type BehaviourProps,type Marketing} from './posthog-schema';

const identityKey='jaisalgo_posthog_identity',attributionKey='jaisalgo_posthog_attribution';
const token=process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,host=posthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);
let entryAttribution:{firstTouch:Marketing;latestTouch:Marketing}|undefined,entryAt=0;
let sdk:PostHog|undefined,loading:Promise<void>|undefined,memoryId:string|undefined;
const navigation=pageLifecycle();
const once=new Set<string>();
const queue:{name:BehaviourEvent;props:BehaviourProps;at:number}[]=[];
const lists={campaigns:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CAMPAIGNS||'',content:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_CONTENT||'',terms:process.env.NEXT_PUBLIC_POSTHOG_ALLOWED_TERMS||''};
export const posthogConfigured=()=>!!token&&!!host&&process.env.NEXT_PUBLIC_POSTHOG_ENABLED!=='false';
export function posthogConsent(){try{return localStorage.getItem('jaisalgo_measurement')==='allow'&&!navigator.doNotTrack?.includes('1')&&!(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl}catch{return false}}
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
function anonymousId(){if(memoryId)return memoryId;try{const id=localStorage.getItem(identityKey);if(id&&posthogIdentitySchema.shape.distinctId.safeParse(id).success)return memoryId=id}catch{}memoryId=crypto.randomUUID();try{localStorage.setItem(identityKey,memoryId)}catch{}return memoryId}
export function posthogMeasurement(){if(!posthogConfigured()||!posthogConsent())return;try{const parsed=posthogIdentitySchema.safeParse({distinctId:sdk?.get_distinct_id()||anonymousId(),...(sdk?{sessionId:sdk.get_session_id()}:{}),...attribution()});return parsed.success?parsed.data:undefined}catch{return}}
function common(){const touch=attribution();return {analytics_environment:environment,page_path:analyticsPage(location.pathname),page_type:pageType(analyticsPage(location.pathname)),device_category:innerWidth<640?'mobile':innerWidth<1024?'tablet':'desktop',...touch.latestTouch,traffic_source:trafficSource(touch.latestTouch),first_touch_traffic_source:trafficSource(touch.firstTouch),latest_touch_traffic_source:trafficSource(touch.latestTouch),...Object.fromEntries(Object.entries(touch.firstTouch).map(([k,v])=>['first_touch_'+k,v])),...Object.fromEntries(Object.entries(touch.latestTouch).map(([k,v])=>['latest_touch_'+k,v]))}}
/** SDK metadata is reduced before transmission; unknown routes, query strings and fragments never leave the browser. */
function sanitize(event:CaptureResult|null):CaptureResult|null {
  if(!event||!posthogConsent()||analyticsPage(location.pathname)==='/admin')return null;
  const page=analyticsPage(location.pathname);
  if(event.event==='$snapshot')return privateAnalyticsPage(page)?null:{...event,properties:sanitizeReplayUrls(event.properties,location.origin) as CaptureResult['properties']};
  if(![...behaviourEvents,'$pageview','$pageleave','$autocapture','$$heatmap'].includes(event.event))return null;
  if(privateAnalyticsPage(page)&&['$autocapture','$$heatmap'].includes(event.event))return null;
  const p=event.properties||{},eventPage=typeof p.page_path==='string'?analyticsPage(p.page_path):page,referrer=attribution().latestTouch.referrer_origin,properties:Record<string,unknown>={...common(),$current_url:location.origin+eventPage,$pathname:eventPage,$host:location.hostname,$referrer:referrer?.startsWith('https://')?referrer:'$direct',$referring_domain:referrer?.startsWith('https://')?new URL(referrer).hostname:'$direct',$geoip_disable:true};
  for(const key of ['distinct_id','$device_id','$session_id','$window_id','$lib','$lib_version','$browser','$browser_version','$os','$os_version','$screen_width','$screen_height','$viewport_width','$viewport_height','$pageview_id','$event_type','$ce_version','$is_identified','$process_person_profile'])if(p[key]!==undefined)properties[key]=p[key];
  const custom=safeBehaviourProps(Object.fromEntries(Object.entries(p).filter(([key])=>key in behaviourPropertyKeys)));if(custom)Object.assign(properties,custom);
  if(event.event==='$autocapture'&&Array.isArray(p.$elements))properties.$elements=p.$elements.map((el:Record<string,unknown>)=>({tag_name:['a','button','svg','path'].includes(String(el.tag_name))?el.tag_name:'element',...(typeof el.nth_child==='number'?{nth_child:el.nth_child}:{})}));
  // Heatmap data is generated by the SDK; retain coordinates, never its raw page URL.
  if(event.event==='$$heatmap'&&p.$heatmap_data)properties.$heatmap_data=sanitizeHeatmap(p.$heatmap_data,location.origin);
  return {...event,properties};
}
const behaviourPropertyKeys={package_slug:1,package_id:1,package_category:1,arrival_city:1,travel_month:1,traveller_count:1,children_count:1,package_price_inr:1,reservation_amount_inr:1,currency:1,page_path:1,page_type:1,cta_location:1,booking_step:1,city_guide_target:1,device_category:1,reason:1,section:1,position:1,scroll_depth:1,attempt_id:1,payment_amount_inr:1,payment_phase:1,payment_environment:1,experiment_variant:1};
const publicCapture={dom_event_allowlist:['click'] as ['click'],element_allowlist:['a','button'] as ['a','button'],css_selector_ignorelist:['.ph-no-capture','.ph-no-autocapture','[data-ph-no-autocapture]','form','input','textarea','select','iframe','[data-posthog-private]'],capture_copied_text:false,capture_value_css_selector_allowlist:[]};
export function posthogNavigationStart(url:string){try{if(privateAnalyticsPage(analyticsPage(new URL(url,location.origin).pathname))){sdk?.stopSessionRecording();sdk?.set_config({autocapture:false,capture_heatmaps:false})}}catch{}}
function setPrivacy(){if(!sdk)return;const privatePage=privateAnalyticsPage(analyticsPage(location.pathname));sdk.set_config({autocapture:privatePage?false:publicCapture,capture_heatmaps:!privatePage});if(privatePage)sdk.stopSessionRecording();else if(Number(process.env.NEXT_PUBLIC_POSTHOG_REPLAY_SAMPLE_RATE||'.1')>0)sdk.startSessionRecording()}
export function initializePosthog(){
  if(!posthogConfigured()||!posthogConsent())return Promise.resolve();
  if(sdk){sdk.opt_in_capturing({captureEventName:false});setPrivacy();return Promise.resolve()}
  if(loading)return loading;
  loading=import('posthog-js').then(({default:posthog})=>{
    if(!posthogConsent())return;
    const config:Partial<PostHogConfig>={api_host:host,defaults:'2026-08-30',bootstrap:{distinctID:anonymousId(),isIdentifiedID:false},person_profiles:'identified_only',persistence:'localStorage',capture_pageview:false,capture_pageleave:false,autocapture:false,capture_heatmaps:false,mask_all_text:true,mask_all_element_attributes:true,save_campaign_params:false,save_referrer:false,disable_surveys:true,disable_session_recording:true,enable_recording_console_log:false,capture_performance:false,capture_exceptions:false,capture_dead_clicks:false,disable_external_dependency_loading:false,respect_dnt:true,ip:false,
      session_recording:{compress_events:false,maskAllInputs:true,maskTextSelector:'*',maskAllElementAttributes:true,blockSelector:'iframe,form,input,textarea,select,[data-posthog-private],.ph-no-capture',recordCrossOriginIframes:false,recordHeaders:false,recordBody:false,maskNetworkRequestFn:data=>{try{const u=new URL(data.url);return u.origin===location.origin?{url:u.origin+analyticsPage(u.pathname)}:null}catch{return null}},maskCapturedNetworkRequestFn:()=>null,sampleRate:Math.max(0,Math.min(1,Number(process.env.NEXT_PUBLIC_POSTHOG_REPLAY_SAMPLE_RATE||'.1'))),captureCanvas:{recordCanvas:false}},
      before_send:sanitize,get_current_url:()=>location.origin+analyticsPage(location.pathname),loaded:()=>{sdk=posthog;setPrivacy()},
    };posthog.init(token!,config);
  }).catch(()=>{queue.length=0}).finally(()=>{loading=undefined});return loading;
}
export function captureBehaviour(name:BehaviourEvent,props:BehaviourProps={}){
  if(!posthogConfigured()||!posthogConsent()||analyticsPage(location.pathname)==='/admin')return;
  const safe=safeBehaviourProps(props);if(!safe)return;
  try{if(sdk)sdk.capture(name,{...common(),...safe});else{queue.push({name,props:{...safe,page_path:analyticsPage(location.pathname),page_type:pageType(analyticsPage(location.pathname))},at:Date.now()});if(queue.length>40)queue.shift();void initializePosthog()}}catch{/* Optional analytics never affects the action. */}
}
function pageleave(path:string|undefined){try{if(path&&sdk&&posthogConsent()&&path!=='/admin')sdk.capture('$pageleave',{page_path:path,page_type:pageType(path)})}catch{}}
export function posthogPage(path:string){if(!posthogConfigured()||!posthogConsent())return;const page=analyticsPage(path),visit=navigation.start(page);if(!visit)return;pageleave(visit.previous);if(visit.changed)once.clear();void initializePosthog().then(()=>{if(!sdk||!posthogConsent()||!navigation.ready(visit.revision)||page==='/admin')return;setPrivacy();sdk.capture('$pageview',{...common(),page_path:page});const session=sdk.get_session_id();let seenLanding=false;try{seenLanding=sessionStorage.getItem('jaisalgo_posthog_landing')===session}catch{}if(navigation.landing(session)&&!seenLanding){const entry=attribution().latestTouch.landing_page_path;sdk.capture('landing_page_viewed',{...common(),page_path:entry,page_type:pageType(entry)},{timestamp:new Date(entryAt)});try{sessionStorage.setItem('jaisalgo_posthog_landing',session)}catch{}};while(queue.length&&posthogConsent()){const event=queue.shift()!;sdk.capture(event.name,{...common(),...event.props},{timestamp:new Date(event.at)})}if(page==='/packages')captureBehaviour('package_list_viewed');}).catch(()=>{})}
export function posthogPageleave(){pageleave(navigation.end())}
export function resetPosthogIdentity(){try{sdk?.stopSessionRecording();sdk?.reset();sdk?.opt_out_capturing();localStorage.removeItem(identityKey);localStorage.removeItem(attributionKey);sessionStorage.removeItem('jaisalgo_posthog_landing')}catch{}queue.length=0;once.clear();memoryId=undefined;entryAttribution=undefined;entryAt=0;navigation.reset()}

export function captureBehaviourOnce(key:string,name:BehaviourEvent,props:BehaviourProps={}){if(!posthogConsent()||!posthogConfigured()||once.has(key))return;once.add(key);captureBehaviour(name,props)}
