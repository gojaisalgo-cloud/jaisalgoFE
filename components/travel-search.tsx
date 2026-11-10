'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {DatePicker} from '@/components/date-picker';
import {calendarAllowed} from '@/lib/calendar';
import {useRouter,useSearchParams} from 'next/navigation';
import {MapPin,CalendarDays,Users,Search,Compass,Tent,Landmark,Sun,Palmtree,Check,ChevronDown} from 'lucide-react';

const collections=[{label:'All escapes',shortLabel:'All',description:'Compare all Jaisalmer packages in one search.',kind:'',area:'',icon:Palmtree},{label:'Desert stays',shortLabel:'Stays',description:'Find camp and tent-stay packages around Jaisalmer.',kind:'camp',area:'',icon:Tent},{label:'Safaris',shortLabel:'Safaris',description:'Explore safari and activity packages.',kind:'activity',area:'',icon:Compass},{label:'City tours',shortLabel:'City',description:'Browse tours focused on Jaisalmer city.',kind:'tour',area:'City',icon:Landmark},{label:'Culture',shortLabel:'Culture',description:'Explore cultural experiences and evenings.',kind:'cultural',area:'',icon:Sun}];
type Props={minDate:string;maxDate:string;suggestions:string[];compact?:boolean};
export function TravelSearch(props:Props){const params=useSearchParams();return <SearchForm key={params.toString()} {...props} query={params.toString()}/>}
function SearchForm({minDate,maxDate,suggestions,compact,query}:Props&{query:string}){
 const router=useRouter(),params=new URLSearchParams(query),id=useId();
 const [kind,setKind]=useState(params.get('kind')||''),[area,setArea]=useState(params.get('area')||''),[date,setDate]=useState(calendarAllowed(params.get('date')||'',minDate,maxDate)?params.get('date')!:'');
 const selectedCollection=collections.find(collection=>collection.kind===kind&&collection.area===area);
 function search(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const fd=new FormData(e.currentTarget),next=new URLSearchParams(query);for(const [key,value] of Object.entries({q:String(fd.get('q')||'').trim(),date:String(fd.get('date')||''),travelers:String(fd.get('travelers')||'2'),kind,area})){if(value)next.set(key,value);else next.delete(key)}next.delete('desert');router.push('/packages?'+next.toString())}
 return <section className={`travel-search ${compact?'travel-search-compact':''}`} aria-label="Search Jaisalmer trips">
  <div className="travel-search-types" role="group" aria-label="Trip collection">{collections.map(({label,shortLabel,kind:k,area:a,icon:Icon})=><button key={label} type="button" aria-label={label} aria-pressed={kind===k&&area===a} onClick={()=>{setKind(k);setArea(a)}}><Icon size={21} aria-hidden="true"/><span className="search-label-full">{label}</span><span className="search-label-short" aria-hidden="true">{shortLabel}</span>{kind===k&&area===a&&<Check className="travel-collection-check" size={14} aria-hidden="true"/>}</button>)}</div>
  <div className="travel-search-selection" role="status" aria-live="polite" aria-atomic="true"><Check size={17} aria-hidden="true"/><div><strong>{selectedCollection?`${selectedCollection.label} selected`:'Custom search selected'}</strong><p>{selectedCollection?.description||'Your current search preferences are kept.'} Choose your trip details, then search.</p></div></div>
  <form className="travel-search-fields" onSubmit={search}>
   <label className="travel-destination"><span><MapPin size={16} aria-hidden="true"/><span className="search-label-full">Where would you like to go?</span><span className="search-label-short">Where to?</span></span><DestinationInput id={id} initialValue={params.get('q')||''} suggestions={suggestions}/><small>Destinations, experiences & packages</small></label>
   <label><span><CalendarDays size={16} aria-hidden="true"/>Travel date</span><DatePicker name="date" label="Travel date" min={minDate} max={maxDate} value={date} onValueChange={setDate}/><small>Choose your departure</small></label>
   <label><span><Users size={16} aria-hidden="true"/>Travellers</span><select name="travelers" aria-label="Search travellers" defaultValue={String(Math.max(1,Math.min(12,Number(params.get('travelers'))||2)))}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{i+1} {i?'travellers':'traveller'}</option>)}</select><small>Your whole travel group</small></label>
   <button className="button search-trips" type="submit"><Search size={20} aria-hidden="true"/> {selectedCollection?.kind?`Search ${selectedCollection.label.toLowerCase()}`:'Search trips'}</button>
  </form>
  <div className="search-reassurance"><span><strong>₹99</strong><span className="search-label-full"> to reserve · counts towards your total</span><span className="search-label-short"> · part of total</span></span><span className="search-booking-note">Final services &amp; availability require supplier confirmation</span><details className="search-mobile-terms"><summary>Booking terms <ChevronDown size={13} aria-hidden="true"/></summary><p>₹99 to reserve, credited towards your package total. Final services &amp; availability require supplier confirmation.</p></details></div>
 </section>;
}

/** Editable suggestions retain free-text search and keep keyboard focus on the input. */
function DestinationInput({id,initialValue,suggestions}:{id:string;initialValue:string;suggestions:string[]}){
 const [value,setValue]=useState(initialValue),[open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null);
 const matches=[...new Set(suggestions)].filter(option=>option.toLowerCase().includes(value.trim().toLowerCase()));
 const listId=`${id}-destinations`;
 useEffect(()=>{if(open&&active>=0)list.current?.children[active]?.scrollIntoView({block:'nearest'})},[open,active]);
 function choose(option:string){setValue(option);setOpen(false);setActive(-1)}
 function move(next:number){setOpen(true);setActive(next)}
 return <div className="destination-combobox">
  <div className="destination-input-row">
   <input ref={input} name="q" value={value} role="combobox" aria-label="Destination or package" aria-autocomplete="list" aria-expanded={open} aria-controls={open?listId:undefined} aria-activedescendant={open&&active>=0?`${listId}-${active}`:undefined} placeholder="Jaisalmer, Sam, Khuri…" autoComplete="off"
    onFocus={()=>{setOpen(true);setActive(-1)}} onBlur={()=>setOpen(false)}
    onChange={event=>{setValue(event.target.value);setOpen(true);setActive(-1)}}
    onKeyDown={event=>{
     if(event.key==='ArrowDown'&&matches.length){event.preventDefault();move(active<0?0:(active+1)%matches.length)}
     else if(event.key==='ArrowUp'&&matches.length){event.preventDefault();move(active<=0?matches.length-1:active-1)}
     else if(event.key==='Enter'&&open&&active>=0&&matches[active]){event.preventDefault();choose(matches[active])}
     else if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);setActive(-1)}
    }}/>
   <button type="button" className="destination-toggle" aria-label={open?'Close destination suggestions':'Show destination suggestions'} aria-expanded={open} aria-controls={open?listId:undefined}
    onMouseDown={event=>event.preventDefault()} onClick={()=>{if(open)setOpen(false);else{input.current?.focus();setOpen(true);setActive(-1)}}}><ChevronDown size={18} aria-hidden="true"/></button>
  </div>
  {open&&<div className="destination-suggestions">
   <ul id={listId} ref={list} role="listbox" aria-label="Destination and package suggestions">
    {matches.map((option,index)=><li key={option} id={`${listId}-${index}`} role="option" aria-selected={active===index} onMouseEnter={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(option)}><MapPin size={16} aria-hidden="true"/><span>{option}</span>{option===value&&<Check size={16} aria-hidden="true"/>}</li>)}
   </ul>
   {!matches.length&&<p className="destination-no-match">No matching suggestions. You can still search what you typed.</p>}
  </div>}
 </div>;
}
