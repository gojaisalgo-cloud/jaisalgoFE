import type {Extra} from '@/types/marketplace';
export type CostKind='cityStay'|'desertStay'|'transport'|'activities'|'meals'|'operations'|'jeep'|'guide';
export type DepartureRate={date:string;roomNight?:number;campNight?:number;transport?:number;activities?:number;meals?:number;operations?:number};
export type Costs={roomNight:number;campNight:number;transport:number;activities:number;meals:number;operations:number;supplierTaxBps:number;gatewayBps:number;marginBps:number;cityNights?:number;activityUnit?:'person'|'vehicle';activityCapacity?:number;taxRates?:Partial<Record<CostKind,number>>;departureRates?:DepartureRate[]};
export type Choices={travelers:number;children?:number;stay:'Budget'|'Comfort'|'Premium';transport:boolean;jeep:boolean;guide:boolean;travelMode?:'Private'|'Shared'|'Solo';rooming?:'private'|'single'|'shared';stayType?:string;addons?:string[];occasion?:string;dorm?:'mixed'|'women'|'men'};
export const money=(paise:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(paise/100);
export function quote(original:Costs,nights:number,choices:Choices,extras:Extra[]=[],date?:string){
 const dated=original.departureRates?.find(rate=>rate.date===date),cost={...original,...dated};
 if(!Number.isInteger(choices.travelers)||choices.travelers<1||choices.travelers>12)throw Error('Choose 1–12 travelers.');
 if(!Number.isInteger(nights)||nights<0||nights>4)throw Error('Invalid stay duration.');
 if(!['Budget','Comfort','Premium'].includes(choices.stay))throw Error('Choose a valid stay allowance.');
 if(!Number.isInteger(choices.children??0)||(choices.children??0)<0||(choices.children??0)>=choices.travelers)throw Error('Include at least one adult and count children within the traveler total.');
 const values=[cost.roomNight,cost.campNight,cost.transport,cost.activities,cost.meals,cost.operations,cost.supplierTaxBps,cost.gatewayBps,cost.marginBps];
 if(cost.marginBps<1000||cost.marginBps>5000||values.some(v=>!Number.isSafeInteger(v)||v<0||v>50000000))throw Error('Costs must be non-negative integer paise; margin must be 10–50%.');
 const capacity=cost.activityCapacity??4;
 if(!Number.isInteger(capacity)||capacity<1||capacity>12)throw Error('Invalid vehicle capacity.');
 const people=choices.travelers,rooms=choices.rooming==='single'?people:Math.ceil(people/2),factor=choices.stay==='Budget'?.8:choices.stay==='Premium'?1.8:1;
 const cityNights=cost.cityNights??Math.max(0,nights-1);if(!Number.isInteger(cityNights)||cityNights<0||cityNights>nights)throw Error('Invalid city-night allocation.');
 const sharing=choices.rooming==='single'?'single occupancy':'two per room / tent';
 const line=(kind:CostKind,label:string,amount:number)=>({label,amount,taxBps:cost.taxRates?.[kind]??cost.supplierTaxBps});
 const lines=[line('cityStay',`City stay · ${sharing}`,Math.round(cost.roomNight*cityNights*rooms*factor)),line('desertStay',`Desert stay · ${sharing}`,Math.round(cost.campNight*(nights-cityNights)*rooms*factor)),line('transport','Transport allowance · up to 4 per vehicle',choices.transport?cost.transport*Math.ceil(people/4):0),line('activities',cost.activityUnit==='vehicle'?`Safari · ${Math.ceil(people/capacity)} vehicle(s), up to ${capacity} each`:'Sightseeing & activity allowance',cost.activities*(cost.activityUnit==='vehicle'?Math.ceil(people/capacity):people)),line('meals','Meals allowance',cost.meals*people),line('operations','Trip operations allowance',cost.operations),line('jeep','Optional jeep safari · per vehicle',choices.jeep?180000*Math.ceil(people/4):0),line('guide','Optional private city guide',choices.guide?150000:0)];
 for(const e of extras.filter(e=>choices.addons?.includes(e.id)&&e.amount!==null)){
  if(!Number.isInteger(e.amount)||(e.amount??0)<0)throw Error('Invalid extra price.');
  const units=['person','ride','flight / person'].includes(e.unit)?people:e.unit==='vehicle'?Math.ceil(people/capacity):e.unit==='tent'?rooms:1;
  lines.push({label:`${e.name} · ${units} × ${money(e.amount!)} / ${e.unit}`,amount:e.amount!*units,taxBps:e.taxBps});
 }
 if(lines.some(l=>!Number.isInteger(l.taxBps)||l.taxBps<0||l.taxBps>3000)||cost.gatewayBps>1000)throw Error('Invalid tax or gateway allowance.');
 const base=lines.reduce((s,l)=>s+l.amount,0),supplierTax=lines.reduce((s,l)=>s+Math.ceil(l.amount*l.taxBps/10000),0),operating=base+supplierTax;
 const denominator=1-cost.marginBps/10000-cost.gatewayBps/10000;
 if(denominator<=0)throw Error('Invalid tax or gateway allowance.');
 const total=Math.ceil((operating+2)/denominator/100)*100,gateway=Math.ceil(total*cost.gatewayBps/10000),profit=total-operating-gateway;
 if(total<9900)throw Error('Package total must cover the ₹99 token.');
 if(!Number.isSafeInteger(total))throw Error('This group needs a custom quote.');
 return {lines,supplierTax,operating,gateway,profit,total,token:9900,balance:total-9900,margin:profit/total,perPerson:Math.ceil(total/people/100)*100,...(dated?{dateRate:dated.date}:{})};
}
