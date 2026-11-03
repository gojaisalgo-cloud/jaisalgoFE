import type {Tour} from '@/data/catalog';
import type {PackageDetails} from '@/types/marketplace';
import {extraOptions} from '@/data/travel-options';
const awaiting='To be confirmed by the selected operator';
export function packageDetails(t:Tour):PackageDetails {
 if(t.details)return {...t.details,stayTypeSpecified:t.details.stayTypeSpecified??true,amenities:{...t.details.amenities,...(t.details.stayType==='open-sky'&&t.details.amenities.occupancy.startsWith('Estimate uses two')?{occupancy:'Per traveler. Mattress or charpai and blankets require confirmation; no private tent is promised.'}:{})},culture:{...t.details.culture,setting:t.details.culture.setting||'Indoor / outdoor setting to be confirmed by the operator.'}};
 const desert=t.area!=='City',overnight=t.nights>0;
 const stayType=!overnight?'none':t.area==='City'?'city-hotel':t.slug==='khuri-slow'?'mud-hut':t.category==='Premium'?'glamping':t.category==='Budget'?'budget-tent':'swiss-tent';
 return {
  stayTypeSpecified:false,kind:'tour',duration:durationLabel(t),chargeUnit:'person',unitCapacity:1,defaultTransport:true,
  stayType,stayOptions:overnight?['hostel','city-hotel','haveli','mud-hut','budget-tent','swiss-tent','glamping','family-cottage','pool-resort','private-pool','open-sky']:['none'],
  location:t.slug==='khuri-slow'?'Khuri, Jaisalmer':desert?'Jaisalmer & Sam / Khuri dunes':'Jaisalmer city',
  venue:{name:awaiting,address:'Exact property, address and meeting pin will be provided in the supplier quote.',mapUrl:'',confirmed:false,gallery:[]},
  amenities:{washroom:overnight?'Attached or shared bathroom and hot water to be confirmed.':'No stay. Ask the operator about toilets at the meeting point.',climate:overnight?'AC / heating not guaranteed; request written confirmation.':'Outdoor route; heat and weather can change the programme.',occupancy:overnight?'Estimate uses two travelers per room / tent. Odd group sizes round up.':'No accommodation included.',pool:'No swimming pool included or promised.',accessibility:'Steps, walking surfaces and vehicle access need individual confirmation.'},
  culture:{proposed:desert&&overnight,programme:desert&&overnight?'A folk programme is proposed. Dance styles, artists, DJ, fire show and bonfire are not confirmed.':'No cultural performance is included in this route.',setting:'Camp courtyard / stage proposed; indoor or outdoor setting to be confirmed.',seating:'Shared general seating is proposed if the programme is confirmed. Reserved, VIP or private dining requires a separate quote.',food:t.meals+' Vegetarian / non-vegetarian choices, buffet or fixed menu, included drinks and dietary options are unconfirmed.',reporting:awaiting,performance:awaiting,dinner:awaiting,returnTime:awaiting},
  pickup:t.transport,children:'Model pricing counts every traveler at the same rate. Ask for age-specific pricing, extra beds and activity suitability before a real booking.',
  safety:'Use authorized operators and routes. Confirm weather, seat belts, activity equipment, insurance and personal suitability. Riding is optional; request an alternative if needed.',
  attractions:t.slug==='tanot-longewala'?['Tanot Mata Temple','Longewala War Memorial']:t.slug==='khuri-slow'?['Khuri dunes & village']:t.area==='City'?['Jaisalmer Fort','Patwon Ki Haveli','Gadisar Lake']:t.area==='Both'?['Jaisalmer Fort','Patwon Ki Haveli','Kuldhara','Sam / Khuri dunes']:['Sam / Khuri dunes'],
  extras:extraOptions.filter(e=>desert||['heritage','photographer','boating','cooking','birthday','proposal'].includes(e.id)).map(e=>({...e})),marketReference:null
 };
}
export function durationLabel(t:Pick<Tour,'days'|'nights'|'details'>){return t.details?.duration||(t.nights===0?`${t.days} ${t.days===1?'day':'days'} · no stay`:`${t.nights} ${t.nights===1?'night':'nights'} · ${t.days} ${t.days===1?'day':'days'}`)}
