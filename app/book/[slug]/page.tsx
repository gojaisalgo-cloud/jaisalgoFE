import {notFound} from 'next/navigation';
import {tour} from '@/lib/booking/db';
import {mode} from '@/lib/booking/payments';
import {today} from '@/lib/booking/security';
import {choicesFromParams,travelDateBounds,requestedDate} from '@/lib/booking/preferences';
import {ReservationForm} from '@/components/booking/reservation-form';
export const dynamic='force-dynamic';
export const metadata={title:'Customize your Jaisalmer escape',robots:{index:false,follow:false}};
export default async function Book({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){const {slug}=await params,t=await tour(slug);if(!t)notFound();const bounds=travelDateBounds(today()),query=await searchParams,choices=choicesFromParams(t,query),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);return <div className="wrap booking-checkout-page"><ReservationForm key={JSON.stringify({choices,date})} tour={t} mode={mode()} {...bounds} initialDate={date} initialChoices={choices} restoreSelections={!Object.keys(query).length}/></div>}
