import {DirectionalIcon} from '@/components/directional-control';
import {bookingCta} from '@/lib/booking/customer-copy';
import Link from 'next/link';
import {Clock,MapPin,Hotel,Tent,ChevronDown} from 'lucide-react';
import {Photo} from '@/components/photo';
import {money,quote} from '@/lib/booking/pricing';
import {packageDetails,durationLabel} from '@/lib/booking/package-details';
import {choicesFromParams,bookingHref} from '@/lib/booking/preferences';
import {PackageHighlights} from './package-clarity';
import {PackageInformation} from './package-information';
import type {Tour} from '@/data/catalog';
export function TourCard({tour:t,selection={}}:{tour:Tour;selection?:Record<string,string|string[]|undefined>}){
 const d=packageDetails(t),c=choicesFromParams(t,selection),date=typeof selection.date==='string'?selection.date:undefined,q=quote(t.costs,t.nights,c,d.extras,date),unit=d.chargeUnit;
 const bookUrl=bookingHref(t,c,date),detailUrl=Object.keys(selection).some(k=>['date','travelers','children','stay','travelMode','rooming','stayType','transport','jeep','guide','addons','occasion','dorm'].includes(k))?bookUrl.replace('/book/','/packages/'):`/packages/${t.slug}`;
 const amount=unit==='person'?q.perPerson:q.total,peopleLabel=`${c.travelers} ${c.travelers===1?'traveler':'travelers'}`,roomLabel=c.rooming==='single'?'single rooming':c.rooming==='shared'?'shared rooming':'private rooming';
 const city=t.nights?(t.costs.cityNights??Math.max(0,t.nights-1)):0,desert=t.nights-city;
 return <article data-analytics-package={t.slug} className="tour-card compact-tour-card">
  <div className="tour-photo-container"><Link href={detailUrl} className="tour-card-photo" aria-label={`View ${t.title}`}><Photo id={t.image} sizes="(max-width:700px) 100vw, (max-width:1000px) 50vw, 33vw"/><span className="tour-duration"><Clock size={16} strokeWidth={1.9}/>{durationLabel(t)}</span><DirectionalIcon direction="up-right" className="tour-photo-arrow"/></Link><PackageInformation tour={t} initialChoices={c} initialDate={date}/></div>
  <div className="tour-card-body">
   <div className="tour-card-kicker"><MapPin size={11}/>JAISALMER · {d.kind==='activity'?'SAFARI & ACTIVITY':d.kind==='cultural'?'CULTURAL EVENING':d.kind==='camp'?'DESERT STAY':t.area==='Both'?'CITY & DESERT':t.area.toUpperCase()}</div>
   <h3><Link href={detailUrl}>{t.title}</Link></h3><p className="tour-card-description">{t.subtitle}</p>
   {t.nights>0&&<div className="tour-night-plan" aria-label="Base night allocation">{city>0&&<span><Hotel size={15} aria-hidden="true"/>{city}N city</span>}{city>0&&desert>0&&<span aria-hidden="true">+</span>}{desert>0&&<span><Tent size={15} aria-hidden="true"/>{desert}N desert</span>}<small>Base night plan</small></div>}
   <span className="card-availability"><span/>Dates checked at checkout</span>
   <div className="tour-card-price"><div><small>{unit==='person'?'Estimate / person · rounded':'Group estimate'}</small><strong>{money(amount)}</strong></div><span className="token-chip"><b>₹99 <span>now</span></b><small>Part of total</small></span></div>
   <p className="tour-price-basis">{unit==='vehicle'?`Up to ${d.unitCapacity} travelers / vehicle · no seat-share rate`:unit==='tent'?`${d.unitCapacity} guests / tent · 1 night`:t.nights?d.stayType==='open-sky'?`${peopleLabel} · open-sky sleeping`:`${peopleLabel} · ${roomLabel}`:`Based on ${peopleLabel}`}</p>
   <div className="tour-group-estimate"><span>Full group estimate<small>{c.travelers} {c.travelers===1?'traveler':'travelers'} · selected group</small></span><strong>{money(q.total)}</strong></div>
   <details className="tour-inclusions"><summary><span>Stay, meals &amp; package details</span><ChevronDown size={17} aria-hidden="true"/></summary><PackageHighlights tour={t} choices={c}/></details>
   <PackageInformation tour={t} options initialChoices={c} initialDate={date}/>
   <div className="tour-card-actions"><Link href={detailUrl} className="tour-detail-link">View package <DirectionalIcon direction="up-right"/></Link><Link href={bookUrl} className="button">{bookingCta} <DirectionalIcon direction="right"/></Link></div><p className="estimate-tag">{t.confirmed?'Reviewed model · check your date':'Provisional estimate · *supplier confirmation needed'}</p>
  </div>
 </article>
}
