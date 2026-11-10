import {aiReferral} from './referrals';
import {isPackageCollectionPath} from '@/data/package-collection-keys';
import {z} from 'zod';
import publicPaths from '@/data/analytics-public-paths.json';
const paths=new Set(publicPaths);
export function analyticsPage(path:string){
  const clean=path.split(/[?#]/)[0].replace(/\/$/,'')||'/';
  if(paths.has(clean))return clean;
  if(/^\/verify\//.test(clean))return '/verify/[token]';
  if(/^\/reservations\//.test(clean))return '/reservations/[id]';
  if(/^\/book\//.test(clean))return '/book/[slug]';
  if(/^\/packages\//.test(clean))return '/packages/[slug]';
  if(clean==='/my-bookings')return clean;
  if(/^\/admin(?:\/|$)/.test(clean))return '/admin';
  return '/not-found';
}
export const privateAnalyticsPage=(path:string)=>/^\/(?:book|reservations|my-bookings|admin|verify)(?:\/|$)/.test(path);
export function pageType(path:string){return path==='/'?'home':path==='/packages'||isPackageCollectionPath(path)?'package_list':path.startsWith('/packages/')?'package':path.startsWith('/book/')?'checkout':path.startsWith('/reservations/')?'ticket':path.startsWith('/jaisalmer-travel-from/')?'city_guide':path==='/admin'?'admin':'editorial'}
export function posthogHost(value:string|undefined){return value==='https://us.i.posthog.com'||value==='https://eu.i.posthog.com'?value:undefined}
export const marketingSchema=z.object({utm_source:z.enum(['google','bing','facebook','instagram','youtube','whatsapp','newsletter','partner','other']).optional(),utm_medium:z.enum(['organic','cpc','ppc','paid','social','referral','email','other']).optional(),utm_campaign:z.string().regex(/^[a-z][a-z0-9_-]{0,59}$/).optional(),utm_content:z.string().regex(/^[a-z][a-z0-9_-]{0,59}$/).optional(),utm_term:z.string().regex(/^[a-z][a-z0-9_-]{0,59}$/).optional(),landing_page_path:z.string().max(180).refine(p=>p===analyticsPage(p)),referrer_origin:z.enum(['https://www.google.com','https://google.com','https://www.bing.com','https://bing.com','https://www.instagram.com','https://instagram.com','https://www.facebook.com','https://facebook.com','https://t.co','https://www.youtube.com','https://chatgpt.com','https://chat.openai.com','https://www.perplexity.ai','https://perplexity.ai','https://copilot.microsoft.com','https://gemini.google.com','https://claude.ai','https://www.phind.com','https://phind.com','https://you.com','https://www.you.com','other']).optional()}).strict();
export type Marketing=z.infer<typeof marketingSchema>;
export const posthogIdentitySchema=z.object({distinctId:z.union([z.uuid(),z.string().regex(/^acct_[a-f0-9]{64}$/)]),sessionId:z.uuid().optional(),firstTouch:marketingSchema,latestTouch:marketingSchema}).strict();
export const behaviourEvents=['landing_page_viewed','destination_explored','package_list_viewed','package_viewed','package_card_viewed','package_gallery_interacted','destination_gallery_interacted','package_itinerary_viewed','package_inclusions_viewed','package_price_viewed','travel_date_selected','traveller_count_updated','reserve_cta_clicked','booking_started','traveller_details_started','traveller_details_completed','checkout_started','payment_initiated','ticket_viewed','ticket_downloaded','whatsapp_contact_clicked','call_contact_clicked','booking_validation_failed','faq_expanded','trust_section_viewed','reservation_offer_viewed','hero_cta_clicked','scroll_depth_reached','booking_error','payment_attempt_failed','package_variant_updated','city_guide_viewed','city_package_clicked','search_submitted','search_results_viewed','package_filter_changed','package_sort_changed','navigation_clicked','collection_explored','experience_filter_changed','package_card_clicked','enquiry_started','enquiry_submitted','enquiry_failed','trip_brief_created','trip_brief_downloaded','auth_prompt_viewed','auth_prompt_dismissed','login_started','login_failed','logout_completed','page_engagement','session_started'] as const;
export type BehaviourEvent=typeof behaviourEvents[number];
export const behaviourPropsSchema=z.object({
  search_intent:z.enum(['none','jaisalmer','sam','khuri','camel','jeep','heritage','camp','culture','package','other']).optional(),
  collection:z.enum(['all','tour','camp','activity','cultural','couples','heritage','desert','family','city','combined']).optional(),
  result_count:z.number().int().min(0).max(10000).optional(),has_date:z.boolean().optional(),has_query:z.boolean().optional(),
  filter_key:z.enum(['kind','area','category','style','place','stayType','transfer','tour','priceBand','days','safari','desert','minNights','maxNights','minPrice','maxPrice','clear','other']).optional(),
  sort_order:z.enum(['recommended','price','price-desc','duration','duration-desc','name']).optional(),
  target_path:z.string().max(180).refine(p=>p===analyticsPage(p)).optional(),navigation_area:z.enum(['header','footer','content']).optional(),
  sign_in_method:z.literal('google').optional(),account_type:z.enum(['guest','google']).optional(),
  active_seconds:z.number().int().min(0).max(86400).optional(),elapsed_seconds:z.number().int().min(0).max(86400).optional(),
  visit_count:z.number().int().min(1).max(100000).optional(),visitor_type:z.enum(['new','returning']).optional(),
  stay_category:z.enum(['Budget','Comfort','Premium']).optional(),rooming:z.enum(['private','single','shared']).optional(),travel_mode:z.enum(['Private','Shared','Solo']).optional(),
  enquiry_mode:z.enum(['local_brief','delivery']).optional(),
  package_slug:z.string().regex(/^[a-z0-9-]{2,90}$/).optional(),package_id:z.string().regex(/^[a-z0-9-]{2,90}$/).optional(),
  package_category:z.enum(['Budget','Comfort','Premium']).optional(),arrival_city:z.literal('Jaisalmer').optional(),
  travel_month:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),traveller_count:z.number().int().min(1).max(12).optional(),children_count:z.number().int().min(0).max(11).optional(),
  package_price_inr:z.number().finite().min(0).max(10000000).optional(),reservation_amount_inr:z.literal(99).optional(),currency:z.literal('INR').optional(),
  page_path:z.string().max(180).refine(p=>p===analyticsPage(p)).optional(),page_type:z.string().regex(/^[a-z_]{2,25}$/).optional(),
  cta_location:z.enum(['hero','package_card','package_details','checkout','navigation','gallery','other']).optional(),booking_step:z.enum(['options','details','checkout','payment','ticket']).optional(),
  city_guide_target:z.string().regex(/^[a-z-]{2,40}$/).optional(),device_category:z.enum(['mobile','tablet','desktop']).optional(),
  reason:z.enum(['network','validation','price_changed','availability','payment_failed','gateway_closed','gateway_load','unknown']).optional(),
  section:z.enum(['overview','itinerary','stay','price','faq','inclusions','gallery']).optional(),position:z.number().int().min(0).max(100).optional(),scroll_depth:z.union([z.literal(25),z.literal(50),z.literal(75),z.literal(100)]).optional(),
  payment_amount_inr:z.number().finite().min(0).max(10000000).optional(),payment_phase:z.enum(['token','balance','full']).optional(),attempt_id:z.uuid().optional(),payment_environment:z.enum(['demo','test','live']).optional(),experiment_variant:z.literal('none').optional(),
}).strict();
export type BehaviourProps=z.infer<typeof behaviourPropsSchema>;
export function safeBehaviourProps(value:unknown){const parsed=behaviourPropsSchema.safeParse(value);return parsed.success?parsed.data:undefined}
const sources=new Set(['google','bing','facebook','instagram','youtube','whatsapp','newsletter','partner']);
const mediums=new Set(['organic','cpc','ppc','paid','social','referral','email']);
const allowed=(value:string|null,configured:string)=>value&&configured.split(',').map(v=>v.trim()).filter(v=>/^[a-z][a-z0-9_-]{0,59}$/.test(v)).includes(value)?value:value?'other':undefined;
export function approvedMarketing(touch:Marketing,lists:{campaigns:string;content:string;terms:string}):Marketing{return {...touch,...(touch.utm_campaign?{utm_campaign:allowed(touch.utm_campaign,lists.campaigns)}:{}),...(touch.utm_content?{utm_content:allowed(touch.utm_content,lists.content)}:{}),...(touch.utm_term?{utm_term:allowed(touch.utm_term,lists.terms)}:{})}}
export function marketingTouch(url:string,referrer:string,lists:{campaigns:string;content:string;terms:string}):Marketing{
  const u=new URL(url),q=u.searchParams;let origin:string|undefined;
  try{const r=new URL(referrer);if(r.origin!==u.origin)origin=aiReferral(referrer)?r.origin:['www.google.com','google.com','www.bing.com','bing.com','www.instagram.com','instagram.com','www.facebook.com','facebook.com','t.co','www.youtube.com'].includes(r.hostname)?r.origin:'other'}catch{}
  return {landing_page_path:analyticsPage(u.pathname),...(origin?{referrer_origin:origin as Marketing['referrer_origin']}:{}),...(q.has('utm_source')?{utm_source:sources.has(q.get('utm_source')!)?q.get('utm_source') as Marketing['utm_source']:'other'}:{}),...(q.has('utm_medium')?{utm_medium:mediums.has(q.get('utm_medium')!)?q.get('utm_medium') as Marketing['utm_medium']:'other'}:{}),...(q.has('utm_campaign')?{utm_campaign:allowed(q.get('utm_campaign'),lists.campaigns)}:{}),...(q.has('utm_content')?{utm_content:allowed(q.get('utm_content'),lists.content)}:{}),...(q.has('utm_term')?{utm_term:allowed(q.get('utm_term'),lists.terms)}:{})};
}

export function trafficSource(touch:Marketing):'paid'|'search'|'social'|'email'|'referral'|'direct'|'ai'{if(['cpc','ppc','paid'].includes(touch.utm_medium||''))return 'paid';if(touch.utm_medium==='email')return 'email';if(aiReferral(touch.referrer_origin||''))return 'ai';if(touch.utm_medium==='organic'||/google|bing/.test(touch.referrer_origin||''))return 'search';if(touch.utm_medium==='social'||/instagram|facebook|youtube|t.co/.test(touch.referrer_origin||''))return 'social';return touch.referrer_origin?'referral':'direct'}

/** Search text never leaves the browser; only these broad, non-personal intents do. */
export function searchIntent(value:string):NonNullable<BehaviourProps['search_intent']>{
 const q=value.trim().toLowerCase();if(!q)return 'none';
 for(const [intent,pattern] of [['khuri',/\bkhuri\b/],['sam',/\bsam\b/],['camel',/\bcamel\b/],['jeep',/\bjeep\b/],['heritage',/fort|haveli|heritage|city/],['camp',/camp|tent/],['culture',/cultur|folk|dinner/],['jaisalmer',/jaisalmer/]] as const)if(pattern.test(q))return intent;
 return 'other';
}
export function searchProperties(params:URLSearchParams):BehaviourProps{
 const kind=params.get('kind')||'',collection=['tour','camp','activity','cultural','couples'].includes(kind)?kind as BehaviourProps['collection']:'all';
 const count=Number(params.get('travelers'));
 return {search_intent:searchIntent(params.get('q')||''),has_query:!!params.get('q')?.trim(),has_date:/^\d{4}-\d{2}-\d{2}$/.test(params.get('date')||''),collection,...(Number.isInteger(count)&&count>=1&&count<=12?{traveller_count:count}:{}),...(['recommended','price','price-desc','duration','duration-desc','name'].includes(params.get('sort')||'')?{sort_order:params.get('sort') as BehaviourProps['sort_order']}:{})};
}
