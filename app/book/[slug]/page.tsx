import {privateRobots} from '@/lib/seo';
import Link from 'next/link';
import {ShieldCheck} from 'lucide-react';
import {Photo} from '@/components/photo';
import {BookingProgress} from '@/components/booking/booking-progress';
import {quote,money} from '@/lib/booking/pricing';
import {durationLabel} from '@/lib/booking/package-details';
import {databaseConfigured} from '@/lib/booking/storage';
import {notFound} from 'next/navigation';
import {tour} from '@/lib/booking/db';
import {mode,paymentReady} from '@/lib/booking/payments';
import {config} from '@/lib/config';
import {bookingPaymentTerms} from '@/lib/booking/customer-copy';
import {BookingAssistance} from '@/components/booking/booking-assistance';
import {today} from '@/lib/booking/security';
import {choicesFromParams,travelDateBounds,requestedDate,bookingHref} from '@/lib/booking/preferences';
import {ReservationForm} from '@/components/booking/reservation-form';
export const dynamic='force-dynamic';
export const metadata={title:'Customize your Jaisalmer escape',robots:privateRobots};
export default async function Book({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params,t=await tour(slug);if(!t)notFound();

 const bounds=travelDateBounds(today()),query=await searchParams,choices=choicesFromParams(t,query),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);
 if(!databaseConfigured()||!paymentReady()){const q=quote(t.costs,t.nights,choices,t.details?.extras||[],date);return <div className="wrap booking-checkout-page booking-assisted"><BookingProgress step={1}/><div className="assisted-booking-layout"><section><span className="overline">YOUR JAISALMER ESCAPE</span><h1>Let’s help you book.</h1><p>Everything you need for your next Jaisalmer chapter, with a little help from our travel desk.</p><div className="assisted-status"><ShieldCheck size={21}/><div><strong>Online payment is temporarily unavailable.</strong><p>Call {config.phone} for booking assistance. No online payment has been taken.</p></div></div><BookingAssistance/><div className="tour-card-actions"><Link className="button secondary" href={bookingHref(t,choices,date).replace('/book/','/packages/')}>View package</Link><a className="button" href={config.phoneHref}>Call to book</a></div></section><aside className="assisted-package-card"><Photo id={t.image}/><div><h2>{t.title}</h2><p>{durationLabel(t)} · {choices.travelers} travelers</p><dl><div><dt>Group estimate</dt><dd>{money(q.total)}</dd></div><div><dt>Reservation amount</dt><dd>₹99</dd></div><div><dt>Balance on arrival</dt><dd>{money(q.balance)}</dd></div></dl><p className="fine">{bookingPaymentTerms} Prices and availability require confirmation before payment.</p></div></aside></div></div>}
 return <div className="wrap booking-checkout-page"><ReservationForm key={JSON.stringify({choices,date})} tour={t} mode={mode()} {...bounds} initialDate={date} initialChoices={choices} restoreSelections={!Object.keys(query).length}/></div>
}
