import {Phone} from 'lucide-react';
import {config} from '@/lib/config';

export function BookingAssistance(){return <aside className="booking-assistance" aria-label="Booking assistance"><div><strong>Need a hand with your booking?</strong><span>Call us for package, payment or ticket assistance.</span></div><a href={config.phoneHref}><Phone size={17} strokeWidth={1.75} aria-hidden="true"/>{config.phone}</a></aside>}
