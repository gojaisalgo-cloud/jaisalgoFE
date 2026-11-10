'use client';
import {useId,useState} from 'react';
import {DatePicker} from '@/components/date-picker';
import {calendarAllowed} from '@/lib/calendar';
import {useRouter,useSearchParams} from 'next/navigation';
import {MapPin,CalendarDays,Users,Search,Compass,Tent,Landmark,Sun,Palmtree} from 'lucide-react';

const collections=[{label:'All escapes',kind:'',area:'',icon:Palmtree},{label:'Desert stays',kind:'camp',area:'',icon:Tent},{label:'Safaris',kind:'activity',area:'',icon:Compass},{label:'City tours',kind:'tour',area:'City',icon:Landmark},{label:'Culture',kind:'cultural',area:'',icon:Sun}];
type Props={minDate:string;maxDate:string;suggestions:string[];compact?:boolean};
export function TravelSearch(props:Props){const params=useSearchParams();return <SearchForm key={params.toString()} {...props} query={params.toString()}/>}
function SearchForm({minDate,maxDate,suggestions,compact,query}:Props&{query:string}){
 const router=useRouter(),params=new URLSearchParams(query),id=useId();
 const [kind,setKind]=useState(params.get('kind')||''),[area,setArea]=useState(params.get('area')||''),[date,setDate]=useState(calendarAllowed(params.get('date')||'',minDate,maxDate)?params.get('date')!:'');
 function search(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const fd=new FormData(e.currentTarget),next=new URLSearchParams(query);for(const [key,value] of Object.entries({q:String(fd.get('q')||'').trim(),date:String(fd.get('date')||''),travelers:String(fd.get('travelers')||'2'),kind,area})){if(value)next.set(key,value);else next.delete(key)}next.delete('desert');router.push('/packages?'+next.toString())}
 return <section className={`travel-search ${compact?'travel-search-compact':''}`} aria-label="Search Jaisalmer trips">
  <div className="travel-search-types" role="group" aria-label="Trip collection">{collections.map(({label,kind:k,area:a,icon:Icon})=><button key={label} type="button" aria-pressed={kind===k&&area===a} onClick={()=>{setKind(k);setArea(a)}}><Icon size={21} aria-hidden="true"/><span>{label}</span></button>)}</div>
  <form className="travel-search-fields" onSubmit={search}>
   <label className="travel-destination"><span><MapPin size={16} aria-hidden="true"/>Where would you like to go?</span><input name="q" aria-label="Destination or package" list={id} defaultValue={params.get('q')||''} placeholder="Jaisalmer, Sam, Khuri…" autoComplete="off"/><datalist id={id}>{suggestions.map(s=><option key={s} value={s}/>)}</datalist><small>Destinations, experiences & packages</small></label>
   <label><span><CalendarDays size={16} aria-hidden="true"/>Travel date</span><DatePicker name="date" label="Travel date" min={minDate} max={maxDate} value={date} onValueChange={setDate}/><small>Choose your departure</small></label>
   <label><span><Users size={16} aria-hidden="true"/>Travellers</span><select name="travelers" aria-label="Search travellers" defaultValue={String(Math.max(1,Math.min(12,Number(params.get('travelers'))||2)))}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{i+1} {i?'travellers':'traveller'}</option>)}</select><small>Your whole travel group</small></label>
   <button className="button search-trips" type="submit"><Search size={20} aria-hidden="true"/>Search trips</button>
  </form>
  <div className="search-reassurance"><span><strong>₹99</strong> to reserve · counts towards your total</span><span>Final services & availability require supplier confirmation</span></div>
 </section>;
}
