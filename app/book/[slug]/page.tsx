import {privateRobots} from '@/lib/seo';
import Link from 'next/link';
import {databaseConfigured} from '@/lib/booking/storage';
import {notFound} from 'next/navigation';
import {tour} from '@/lib/booking/db';
import {mode,paymentReady} from '@/lib/booking/payments';
import {config} from '@/lib/config';
import {bookingPaymentTerms} from '@/lib/booking/customer-copy';
import {BookingAssistance} from '@/components/booking/booking-assistance';
import {today} from '@/lib/booking/security';
import {choicesFromParams,travelDateBounds,requestedDate} from '@/lib/booking/preferences';
import {ReservationForm} from '@/components/booking/reservation-form';
export const dynamic='force-dynamic';
export const metadata={title:'Customize your Jaisalmer escape',robots:privateRobots};
export default async function Book({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params,t=await tour(slug);if(!t)notFound();
 if(!databaseConfigured()||!paymentReady())return <div className="wrap booking-checkout-page booking-assisted"><span className="overline">YOUR JAISALMER ESCAPE</span><h1>Let’s help you book.</h1><p>Online payment is temporarily unavailable. Call {config.phone} for booking assistance. No online payment has been taken.</p><div className="booking-mode-note"><strong>{t.title}</strong><p>{bookingPaymentTerms}</p></div><BookingAssistance/><div className="tour-card-actions"><Link className="button secondary" href={`/packages/${t.slug}`}>View package</Link><a className="button" href={config.phoneHref}>Call to book</a></div></div>;
 const bounds=travelDateBounds(today()),query=await searchParams,choices=choicesFromParams(t,query),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);return <div className="wrap booking-checkout-page"><ReservationForm key={JSON.stringify({choices,date})} tour={t} mode={mode()} {...bounds} initialDate={date} initialChoices={choices} restoreSelections={!Object.keys(query).length}/></div>
}
