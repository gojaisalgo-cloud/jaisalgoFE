import {DirectionalIcon} from '@/components/directional-control';
import Link from 'next/link';
import {Clock,MapPin} from 'lucide-react';
import {Photo} from '@/components/photo';
import {money,quote} from '@/lib/booking/pricing';
import {packageDetails,durationLabel} from '@/lib/booking/package-details';
import {defaultChoices} from '@/lib/booking/preferences';
import {PackageHighlights} from './package-clarity';
import {PackageInformation} from './package-information';
import type {Tour} from '@/data/catalog';
export function TourCard({tour:t}:{tour:Tour}){
 const d=packageDetails(t),c=defaultChoices(t),q=quote(t.costs,t.nights,c),unit=d.chargeUnit;
 const amount=unit==='person'?q.perPerson:q.total;
 return <article data-analytics-package={t.slug} className="tour-card compact-tour-card">
  <div className="tour-photo-container"><Link href={`/packages/${t.slug}`} className="tour-card-photo" aria-label={`View ${t.title}`}><Photo id={t.image} sizes="(max-width:700px) 100vw, (max-width:1000px) 50vw, 33vw"/><span className="tour-duration"><Clock size={16} strokeWidth={1.9}/>{durationLabel(t)}</span><DirectionalIcon direction="up-right" className="tour-photo-arrow"/></Link><PackageInformation tour={t}/></div>
  <div className="tour-card-body">
   <div className="tour-card-kicker"><MapPin size={11}/>JAISALMER · {d.kind==='activity'?'SAFARI & ACTIVITY':d.kind==='cultural'?'CULTURAL EVENING':d.kind==='camp'?'DESERT STAY':t.area==='Both'?'CITY & DESERT':t.area.toUpperCase()}</div>
   <h3><Link href={`/packages/${t.slug}`}>{t.title}</Link></h3><p className="tour-card-description">{t.subtitle}</p>
   <PackageHighlights tour={t} choices={c}/>
   <div className="tour-card-price"><div><small>Estimate / {unit}</small><strong>{money(amount)}</strong></div><span className="token-chip"><b>₹99 <span>token</span></b><small>Part of total</small></span></div>
   <p className="tour-price-basis">{unit==='vehicle'?`Up to ${d.unitCapacity} travelers / vehicle · no seat-share rate`:unit==='tent'?`${d.unitCapacity} guests / tent · 1 night`:t.nights?d.stayType==='open-sky'?'2 travelers · open-sky sleeping':'2 travelers · private twin sharing':'Based on 2 travelers'}</p>
   <div className="tour-card-actions"><Link href={`/packages/${t.slug}`} className="tour-detail-link">View package <DirectionalIcon direction="up-right"/></Link><Link href={`/book/${t.slug}`} className="button">Book for ₹99 <DirectionalIcon direction="right"/></Link></div><p className="estimate-tag">{t.confirmed?'Reviewed model · check your date':'Provisional estimate · *supplier confirmation needed'}</p>
  </div>
 </article>
}
