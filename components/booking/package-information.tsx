'use client';
import {track} from '@/lib/analytics/client';
import {DirectionalIcon,IconButton} from '@/components/directional-control';
import {useEffect,useId,useRef,useState} from 'react';
import Link from 'next/link';
import {Info,X,Clock,MapPin,Check,BedDouble,ChevronDown} from 'lucide-react';
import type {Tour} from '@/data/catalog';
import {Photo} from '@/components/photo';
import {Dropdown} from '@/components/dropdown';
import {packageDetails,durationLabel} from '@/lib/booking/package-details';
import {defaultChoices,normalizeChoices,bookingHref,pendingRequests} from '@/lib/booking/preferences';
import {money,quote,type Choices} from '@/lib/booking/pricing';
import {packageClarity} from '@/lib/booking/package-clarity';
import {ClarityOverview,ClarityDetails,StayRoute,SelectedPackageClarity} from './package-clarity';
import {TripPreferences} from './trip-preferences';
export function PackageInformation({tour:t}:{tour:Tour}){
 const [open,setOpen]=useState(false),dialog=useRef<HTMLDialogElement>(null),button=useRef<HTMLButtonElement>(null),id=useId();
 useEffect(()=>{if(!open)return;const el=dialog.current;if(!el)return;const trigger=button.current,previous=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=previous;trigger?.focus({preventScroll:true})}},[open]);
 return <><button ref={button} type="button" className="package-info-button" aria-label={`Package details: ${t.title}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>(track('package_viewed',{packageId:t.slug}),track('package_info_opened',{packageId:t.slug}),setOpen(true))}><Info size={19}/><span>Details</span></button>{open&&<dialog ref={dialog} className="package-dialog" aria-labelledby={id} onCancel={e=>{e.preventDefault();setOpen(false)}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setOpen(false)}}}><div className="package-dialog-top"><span>YOUR TRIP, IN DETAIL</span><IconButton autoFocus className="package-close" aria-label="Close package details" onClick={()=>setOpen(false)}><X aria-hidden="true"/></IconButton></div><div className="package-dialog-scroll"><PackageInformationContent tour={t} titleId={id}/></div></dialog>}</>;
}
export function PackageInformationContent({tour:t,titleId,standalone=false,initialChoices,initialDate,initialSection='overview'}:{tour:Tour;titleId?:string;standalone?:boolean;initialChoices?:Choices;initialDate?:string;initialSection?:string}){
 const d=packageDetails(t),[c,setChoices]=useState<Choices>(()=>normalizeChoices(t,initialChoices||defaultChoices(t))),[tab,setTab]=useState(initialSection);
 const sectionId=useId();
 const q=quote(t.costs,t.nights,c,d.extras,initialDate),clarity=packageClarity(t,c,q),requests=pendingRequests(t,c);
 const tabs=[['overview','Overview'],['itinerary','Itinerary'],['stay','Stay & venue'],['price','Price & extras']];
 const change=(next:Choices)=>setChoices(normalizeChoices(t,next));
 const title=<><span className="overline">{d.kind==='activity'?'DESERT ACTIVITY':d.kind==='cultural'?'CULTURAL EVENING':d.kind==='camp'?'DESERT STAY':`${t.category} · JAISALMER`}</span>{standalone?<h1 id={titleId}>{t.title}</h1>:<h2 id={titleId}>{t.title}</h2>}<p>{t.subtitle}</p><div className="info-meta"><span><Clock size={14}/>{durationLabel(t)}</span><span><MapPin size={14}/>{d.location}</span></div></>;
 return <div className={`package-information ${standalone?'information-page':''}`}>
  <div className="info-hero"><Photo id={t.image} priority={standalone} sizes="(max-width:700px) 100vw, 850px"/><span>Destination photograph · not a confirmed property</span></div>
  <div className="info-heading">{title}<div className="info-status"><span className="status-dot"/>{t.confirmed?'Reviewed package · check your selected date':'Provisional itinerary · supplier confirmation required'}</div></div>
  <nav className="info-tabs" aria-label="Package detail sections">{tabs.map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} aria-controls={`${sectionId}-${id}`} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  <div>
   <section className="info-section" id={`${sectionId}-overview`} hidden={tab!=='overview'} aria-label="Overview">
    <ClarityOverview data={clarity}/>
    <details className="clarity-accordion"><summary><span><strong>Operator inclusions & exclusions</strong><small>Original package notes, without adding promises</small></span><ChevronDown size={18} aria-hidden="true"/></summary><div className="info-inclusions"><section><h4>Listed / proposed inclusions</h4><ul>{t.inclusions.map(s=><li key={s}><Check size={14} aria-hidden="true"/><span>{s}</span></li>)}</ul></section><section><h4>Optional or excluded</h4><ul>{t.exclusions.map(s=><li key={s}><span>{s}</span></li>)}</ul></section></div></details>
    <details className="clarity-accordion"><summary><span><strong>Children, accessibility & safety</strong><small>Eligibility, facilities and optional riding</small></span><ChevronDown size={18} aria-hidden="true"/></summary><h4>Children</h4><p>{d.children}</p><h4>Accessibility</h4><p>{d.amenities.accessibility}</p><h4>Activity safety</h4><p>{d.safety}</p></details>
    <details className="clarity-accordion"><summary><span><strong>Cancellation & payment</strong><small>₹99 is deducted from the package total</small></span><ChevronDown size={18} aria-hidden="true"/></summary><p>{t.policy}</p><p>The balance is due on your travel date. A demo ticket confirms no travel or real payment.</p></details>
    {!!t.faq.length&&<details className="clarity-accordion"><summary><span><strong>Package questions</strong><small>Answers from the published package notes</small></span><ChevronDown size={18} aria-hidden="true"/></summary>{t.faq.map(f=><section key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></section>)}</details>}
    {(t.slug.includes('tanot')||t.slug==='desert-border-circuit'||t.days===5)&&<p className="request-note">Tanot &amp; Longewala need a separate excursion day. Forward border posts are excluded; current access and identity rules must be checked.</p>}
   </section>
   <section className="info-section" id={`${sectionId}-itinerary`} hidden={tab!=='itinerary'} aria-label="Itinerary">
    <h3>Your time, well spent.</h3><p className="fine">Exact reporting, departure and return times are shown only when supplied. Day-wise planning durations remain estimates. Mentioning a meal, ride or stay in the route does not include it; use the inclusion statuses above.</p>
    <StayRoute data={clarity}/><ClarityDetails data={clarity} only={['timing']}/>
    <div className="information-timeline">{t.itinerary.map((item,i)=><section key={i}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{item.title}</h4><p>{item.body}</p></div></section>)}</div>
   </section>
   <section className="info-section" id={`${sectionId}-stay`} hidden={tab!=='stay'} aria-label="Stay & venue">
    <h3>{t.nights?'Your stay. Every detail.':'Know your meeting point.'}</h3><StayRoute data={clarity}/>
    <div className="venue-card"><span className="overline">{d.venue.confirmed?'CONFIRMED VENUE':t.nights?'PROPERTY NOT SPECIFIED':'MEETING VENUE NOT SPECIFIED'}</span><h4>{d.venue.confirmed?d.venue.name:t.nights?'No assigned property yet':'Meeting point not specified'}</h4><p>{d.venue.address}</p>{d.venue.confirmed&&d.venue.mapUrl?<a href={d.venue.mapUrl} target="_blank" rel="noreferrer" className="underlink">Open exact venue pin <DirectionalIcon direction="up-right"/></a>:<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.location)}`} target="_blank" rel="noreferrer" className="underlink">Explore the area · not a venue pin <DirectionalIcon direction="up-right"/></a>}</div>
    <ClarityDetails data={clarity} only={['stay','transport','meals']}/>
    {d.venue.gallery.length>0&&d.venue.confirmed?<div className="venue-gallery">{d.venue.gallery.map(photo=><Photo key={photo} id={photo}/>)}</div>:<div className="venue-photo-pending"><BedDouble size={20} aria-hidden="true"/><p>Property / room photos: not specified. Destination photos illustrate the area.</p></div>}
    <details className="clarity-accordion"><summary><span><strong>Property & programme notes</strong><small>Pool, seating, venue and food specifications</small></span><ChevronDown size={18} aria-hidden="true"/></summary>{!d.travellerFacts?.stay&&<p>{t.accommodation}</p>}{!d.travellerFacts?.stay?.bathroom&&<p>{d.amenities.washroom}</p>}{!d.travellerFacts?.stay?.climate&&<p>{d.amenities.climate}</p>}<p>{d.amenities.pool}</p><p>{d.amenities.accessibility}</p><h4>{d.culture.proposed?'Proposed cultural evening':'Programme notes'}</h4><p>{d.travellerFacts?.experiences?'See individual activity inclusions above. A venue’s general programme does not add services to your package.':d.culture.programme}</p>{d.culture.proposed&&<dl className="amenity-list">{[['Setting',d.culture.setting],['Seating',d.culture.seating],['Food notes',d.travellerFacts?.meals?clarity.groups.find(g=>g.id==='meals')!.summary:d.culture.food],['Reporting / entry',d.culture.reporting],['Performance',d.culture.performance],['Dinner',d.culture.dinner],['Return / departure',d.culture.returnTime]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}</details>
   </section>
   <section className="info-section" id={`${sectionId}-price`} hidden={tab!=='price'} aria-label="Price & extras">
    <h3>A clear view of the total.</h3><label className="info-travelers">Travelers<Dropdown aria-label="Estimate travelers" value={c.travelers} onValueChange={v=>change({...c,travelers:Number(v),children:Math.min(c.children||0,Number(v)-1),travelMode:Number(v)>1&&c.travelMode==='Solo'?'Private':c.travelMode})}>{Array.from({length:12},(_,i)=><option value={i+1} key={i}>{i+1} {i?'travelers':'traveler'}</option>)}</Dropdown></label>
    <TripPreferences tour={t} choices={c} onChange={change}/><SelectedPackageClarity data={clarity}/>
    <div className="info-costs">{q.lines.filter(l=>l.amount>0).map(l=><div key={l.label}><span>{l.label}</span><strong>{money(l.amount)}</strong></div>)}<div><span>Configured supplier tax allowance</span><strong>{money(q.supplierTax)}</strong></div><div><span>Service &amp; payment processing allowance</span><strong>{money(q.total-q.operating)}</strong></div><div className="info-grand-total"><span>Full group estimate<small>{c.travelers} {c.travelers===1?'traveler':'travelers'} · {money(q.perPerson)} / person, rounded up</small></span><strong>{money(q.total)}</strong></div><div><span>₹99 token deducted</span><strong>{money(q.balance)} balance</strong></div></div>
    {!!requests.length&&<p className="request-note"><strong>Awaiting a quote:</strong> {requests.join(', ')}. Unpriced requests are excluded. Changing a stay preference does not price an unavailable property, new night split, vehicle or pool.</p>}
    <p className="fine">{clarity.priceNote} This estimate is not a tax invoice. Priced options update immediately; unpriced changes require a dated supplier quote before real payment.</p>
    {d.marketReference&&<div className="market-reference"><strong>{d.marketReference.label}</strong><p>{d.marketReference.note}</p><a href={d.marketReference.source} target="_blank" rel="noreferrer">View operator reference <DirectionalIcon direction="up-right"/></a></div>}
   </section>
  </div>
  <div className="info-booking-footer"><div><span>Group estimate · {c.travelers} {c.travelers===1?'person':'people'}</span><strong>{money(q.total)} <small>₹99 token</small></strong></div><Link className="button" href={bookingHref(t,c,initialDate)}>Choose date <DirectionalIcon direction="right"/></Link><p>₹99 is part of the total · check supplier availability</p></div>
 </div>;
}
