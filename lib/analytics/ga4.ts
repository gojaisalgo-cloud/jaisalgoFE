'use client';
import {analyticsAllowed} from './consent';
import publicPaths from '@/data/analytics-public-paths.json';
const publicPages=new Set(publicPaths);
const measurementId=process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID||'';
export const ga4Configured=()=>process.env.NEXT_PUBLIC_GA4_ENABLED==='true'&&/^G-[A-Z0-9]{6,}$/.test(measurementId);
/** No queries, fragments, private routes, raw referrers or customer/payment events. */
export function ga4PagePayload(path:string){const clean=path.split(/[?#]/)[0].replace(/\/$/,'')||'/';return publicPages.has(clean)&&!/^\/(book|reservations|verify|admin|my-bookings|api)(\/|$)/.test(clean)?{page_path:clean,page_location:'https://www.jaisalgo.com'+(clean==='/'?'/':clean),page_referrer:''}:undefined}
const allowed=analyticsAllowed;
type GaWindow=Window&{dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
/** gtag consumes Arguments commands, not arbitrary array entries in dataLayer. */
export function googleCommandQueue(queue:unknown[]):(...args:unknown[])=>void {
 return function(){
  // eslint-disable-next-line prefer-rest-params -- Preserve Google's documented gtag queue protocol.
  queue.push(arguments);
 };
}
let loaded=false;
export function ga4Page(path:string){
 if(!ga4Configured())return;
 const w=window as GaWindow,payload=ga4PagePayload(path),enabled=allowed()&&Boolean(payload);
 (w as unknown as Record<string,unknown>)['ga-disable-'+measurementId]=!enabled;
 if(!enabled){w.gtag?.('consent','update',{analytics_storage:'denied'});return}
 if(!payload)return;
 if(!loaded){w.dataLayer=w.dataLayer||[];w.gtag=googleCommandQueue(w.dataLayer);w.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});w.gtag('js',new Date());w.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,...payload});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;document.head.appendChild(script);loaded=true}
 w.gtag?.('consent','update',{analytics_storage:'granted'});w.gtag?.('event','page_view',payload);
}
