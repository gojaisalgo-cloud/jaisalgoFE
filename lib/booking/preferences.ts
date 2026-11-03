import type {Tour} from '@/data/catalog';
import type {Choices} from './pricing';
import {bundledJeep} from './package-clarity';
import {packageDetails} from './package-details';
import {tripOccasions} from '@/data/travel-options';
export function defaultChoices(t:Tour):Choices {const d=packageDetails(t);return {travelers:d.chargeUnit==='vehicle'?d.unitCapacity:2,stay:'Comfort',transport:d.defaultTransport,jeep:false,guide:false,travelMode:'Private',rooming:'private',stayType:d.stayType,addons:[],occasion:'',dorm:'mixed'}}
export function normalizeChoices(t:Tour,c:Choices):Choices {
 const d=packageDetails(t),activity=d.kind==='activity'||d.kind==='cultural';
 return {...c,...(c.children?{children:c.children}:{}),stay:!t.nights?'Comfort':c.stay,stayType:t.nights?(c.stayType||d.stayType):'none',rooming:t.nights?(c.rooming||'private'):'private',travelMode:c.travelMode||'Private',jeep:activity||bundledJeep(t)?false:c.jeep,guide:activity?false:c.guide,addons:[...new Set(c.addons||[])].sort(),occasion:c.occasion||'',dorm:c.dorm||'mixed'};
}
export function choicesFromParams(t:Tour,params:Record<string,string|string[]|undefined>):Choices {
 const c=defaultChoices(t),get=(k:string)=>typeof params[k]==='string'?params[k] as string:'';
 const travelers=Number(get('travelers'));if(Number.isInteger(travelers)&&travelers>=1&&travelers<=12)c.travelers=travelers;
 if(['Private','Shared','Solo'].includes(get('travelMode')))c.travelMode=get('travelMode') as Choices['travelMode'];
 if(c.travelMode==='Solo')c.travelers=1;
 const children=Number(get('children'));if(Number.isInteger(children)&&children>0&&children<c.travelers)c.children=children;
 if(['private','single','shared'].includes(get('rooming')))c.rooming=get('rooming') as Choices['rooming'];
 if(packageDetails(t).stayOptions.includes(get('stayType')))c.stayType=get('stayType');
 if(['Budget','Comfort','Premium'].includes(get('stay')))c.stay=get('stay') as Choices['stay'];
 for(const key of ['transport','jeep','guide'] as const)if(['0','1'].includes(get(key)))c[key]=get(key)==='1';
 c.addons=get('addons').split(',').filter(id=>packageDetails(t).extras.some(e=>e.id===id));
 if(tripOccasions.includes(get('occasion')))c.occasion=get('occasion');
 if(['mixed','women','men'].includes(get('dorm')))c.dorm=get('dorm') as Choices['dorm'];
 return normalizeChoices(t,c);
}
export function bookingHref(t:Pick<Tour,'slug'>,c:Choices,date?:string){const p=new URLSearchParams();for(const k of ['travelers','children','stay','travelMode','rooming','stayType','dorm','occasion'] as const)if(c[k])p.set(k,String(c[k]));for(const k of ['transport','jeep','guide'] as const)p.set(k,c[k]?'1':'0');if(c.addons?.length)p.set('addons',c.addons.join(','));if(date&&/^\d{4}-\d{2}-\d{2}$/.test(date))p.set('date',date);return `/book/${t.slug}?${p}`}
export function pendingRequests(t:Tour,c:Choices){const d=packageDetails(t);return [c.transport&&d.travellerFacts?.transport?.arrangement&&(c.travelMode==='Shared'?'Shared':'Private')!==d.travellerFacts.transport.arrangement?'Different private / shared vehicle arrangement':null,c.transport&&d.travellerFacts?.transport?.seats&&d.travellerFacts.transport.seats!==4?'Vehicle-specific transfer pricing':null,(c.children??0)>0?'Child rates and activity eligibility':null,c.travelMode==='Shared'?'Shared group matching':null,c.rooming==='shared'?'Shared accommodation':null,c.stayType&&c.stayType!==d.stayType?'Different accommodation type':null,c.occasion||null,...d.extras.filter(e=>c.addons?.includes(e.id)&&e.amount===null).map(e=>e.name)].filter(Boolean) as string[]}

export function travelDateBounds(today:string){const add=(n:number)=>new Date(Date.parse(today+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);return {minDate:add(1),maxDate:add(365)}}
export function requestedDate(value:unknown,minDate:string,maxDate:string){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value&&value>=minDate&&value<=maxDate?value:undefined}
