import {privateRobots} from '@/lib/seo';
import Link from 'next/link';
import {databaseConfigured} from '@/lib/booking/storage';
import {notFound} from 'next/navigation';
import {tour} from '@/lib/booking/db';
import {mode} from '@/lib/booking/payments';
import {today} from '@/lib/booking/security';
import {choicesFromParams,travelDateBounds,requestedDate} from '@/lib/booking/preferences';
import {ReservationForm} from '@/components/booking/reservation-form';
export const dynamic='force-dynamic';
export const metadata={title:'Customize your Jaisalmer escape',robots:privateRobots};
export default async function Book({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const {slug}=await params,t=await tour(slug);if(!t)notFound();if(!databaseConfigured())return <div className="wrap booking-checkout-page"><span className="overline">YOUR JAISALMER ESCAPE</span><h1>Booking will be back soon.</h1><p>Online booking is temporarily unavailable. No payment has been taken. You can still explore this package or create a trip brief.</p><div className="booking-mode-note"><strong>{t.title}</strong><p>Your dates and availability can be checked when online booking resumes.</p></div><div className="tour-card-actions"><Link className="button secondary" href={`/packages/${t.slug}`}>View package</Link><Link className="button" href="/plan-your-trip">Plan my trip</Link></div></div>;const bounds=travelDateBounds(today()),query=await searchParams,choices=choicesFromParams(t,query),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);return <div className="wrap booking-checkout-page"><ReservationForm key={JSON.stringify({choices,date})} tour={t} mode={mode()} {...bounds} initialDate={date} initialChoices={choices} restoreSelections={!Object.keys(query).length}/></div>}
