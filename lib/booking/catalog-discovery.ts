import type {Tour} from '@/data/catalog';
import {packageDetails} from './package-details';
import {defaultChoices} from './preferences';
import {quote} from './pricing';

export const discoveryKeys=['q','days','sort','kind','style','category','desert','area','safari','tour','minNights','maxNights','minPrice','maxPrice','priceBand','place','stayType','transfer'] as const;
export const priceBands=[
 {value:'under-5000',label:'Under ₹5,000',min:0,max:5000},
 {value:'5000-10000',label:'₹5,000–₹9,999',min:5000,max:10000},
 {value:'10000-20000',label:'₹10,000–₹19,999',min:10000,max:20000},
 {value:'20000-plus',label:'₹20,000 and above',min:20000,max:Infinity},
];
export type Facet='category'|'style'|'place'|'stayType'|'transfer'|'tour'|'nights'|'price'|'kind';
export type CatalogRecord={tour:Tour;kind:string;stayType:string;places:string[];search:string;perPerson:number;total:number;travelers:number;transfer:string};
export function catalogRecords(tours:Tour[]):CatalogRecord[]{return tours.map(t=>{
 const d=packageDetails(t),c=defaultChoices(t),q=quote(t.costs,t.nights,c,d.extras);
 return {tour:t,kind:d.kind,stayType:!t.nights?'none':d.stayTypeSpecified?d.stayType:'not-specified',places:[...new Set(d.attractions)],search:[t.title,t.subtitle,t.category,t.area,d.location,d.kind,d.stayType,...d.attractions,...t.styles].join(' ').toLowerCase(),perPerson:q.perPerson,total:q.total,travelers:c.travelers,transfer:d.defaultTransport?'allowance':'own'};
})}
const array=(p:URLSearchParams,key:string)=>[...new Set((p.get(key)||'').split('|').filter(Boolean))];
const number=(p:URLSearchParams,key:string)=>{const value=p.get(key);if(value===null||value.trim()==='')return undefined;const n=Number(value);return Number.isSafeInteger(n)&&n>=0?n:undefined};
export function discoveryFilters(p:URLSearchParams){return {
 q:(p.get('q')||'').trim().toLowerCase(),days:number(p,'days'),sort:p.get('sort')||'recommended',kind:p.get('kind')||'',
 category:array(p,'category'),style:array(p,'style'),place:array(p,'place'),stayType:array(p,'stayType'),transfer:array(p,'transfer'),tour:array(p,'tour'),
 minNights:number(p,'minNights'),maxNights:number(p,'maxNights'),minPrice:number(p,'minPrice'),maxPrice:number(p,'maxPrice'),
 priceBand:array(p,'priceBand').filter(v=>priceBands.some(b=>b.value===v)),area:p.get('area')||'',safari:p.get('safari')||'',desert:!!p.get('desert'),
}}
export type DiscoveryFilters=ReturnType<typeof discoveryFilters>;
const selected=(values:string[],value:string)=>!values.length||values.includes(value);
/** OR within a facet, AND across facets. Facet counts exclude only their own selection. */
export function matchesDiscovery(r:CatalogRecord,f:DiscoveryFilters,omit?:Facet){
 const t=r.tour,price=r.perPerson/100;
 return (!f.q||r.search.includes(f.q))&&(!f.days||t.days===f.days)&&(!f.area||t.area===f.area)&&(!f.desert||t.area!=='City')&&(!f.safari||t.safari===f.safari)
  &&(omit==='kind'||!f.kind||r.kind===f.kind)
  &&(omit==='category'||selected(f.category,t.category))&&(omit==='style'||!f.style.length||t.styles.some(s=>f.style.includes(s)))
  &&(omit==='place'||!f.place.length||r.places.some(p=>f.place.includes(p)))&&(omit==='stayType'||selected(f.stayType,r.stayType))
  &&(omit==='transfer'||selected(f.transfer,r.transfer))&&(omit==='tour'||selected(f.tour,t.tour))
  &&(omit==='nights'||((f.minNights===undefined||t.nights>=f.minNights)&&(f.maxNights===undefined||t.nights<=f.maxNights)))
  &&(omit==='price'||((f.minPrice===undefined||price>=f.minPrice)&&(f.maxPrice===undefined||price<=f.maxPrice)&&(!f.priceBand.length||priceBands.some(b=>f.priceBand.includes(b.value)&&price>=b.min&&price<b.max))));
}
export function filterDiscovery(records:CatalogRecord[],f:DiscoveryFilters){return records.filter(r=>matchesDiscovery(r,f)).sort((a,b)=>{
 if(f.sort==='price')return a.perPerson-b.perPerson;
 if(f.sort==='price-desc')return b.perPerson-a.perPerson;
 if(f.sort==='duration'||f.sort==='duration-asc')return a.tour.days-b.tour.days;
 if(f.sort==='duration-desc')return b.tour.days-a.tour.days;
 if(f.sort==='name')return a.tour.title.localeCompare(b.tour.title);
 return 0;
})}
export function facetCount(records:CatalogRecord[],f:DiscoveryFilters,key:Facet,value:string){return records.filter(r=>matchesDiscovery(r,f,key)&&(
 key==='style'?r.tour.styles.some(s=>s===value):key==='place'?r.places.includes(value):key==='category'?r.tour.category===value:key==='tour'?r.tour.tour===value:key==='price'?priceBands.some(b=>b.value===value&&r.perPerson/100>=b.min&&r.perPerson/100<b.max):key==='kind'?r.kind===value:key==='stayType'?r.stayType===value:r.transfer===value
 )).length}
export function patchDiscovery(params:URLSearchParams,patch:Record<string,string>){const next=new URLSearchParams(params);for(const [key,value] of Object.entries(patch)){if(value)next.set(key,value);else next.delete(key)}return next}
export function clearDiscovery(params:URLSearchParams){const next=new URLSearchParams(params);for(const key of discoveryKeys)next.delete(key);return next}
export function toggleFacet(values:string[],value:string){return (values.includes(value)?values.filter(v=>v!==value):[...values,value]).join('|')}
