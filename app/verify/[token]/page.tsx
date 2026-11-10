import {notFound} from 'next/navigation';
import {ShieldCheck,Ticket} from 'lucide-react';
import {publicVerification} from '@/lib/booking/verification';
import {databaseConfigured} from '@/lib/booking/storage';
import {privateRobots} from '@/lib/seo';
import {ticketDate} from '@/lib/booking/ticket';
import {money} from '@/lib/booking/pricing';
import {StatusBadge,bookingTone} from '@/components/ui/feedback';
import {BookingAssistance} from '@/components/booking/booking-assistance';
export const dynamic='force-dynamic';
export const metadata={title:'Verify a JaisalGo ticket',robots:privateRobots};
export default async function Verify({params}:{params:Promise<{token:string}>}){
 if(!databaseConfigured())return <div className="wrap ticket-verification"><h1>Ticket verification is unavailable.</h1><p>Please contact the travel desk. This page does not confirm admission or payment.</p><BookingAssistance/></div>;
 const b=await publicVerification((await params).token);if(!b)notFound();
 const active=['reserved','paid'].includes(b.status);
 return <div className="wrap ticket-verification"><span className="verification-seal"><ShieldCheck size={26}/></span><span className="overline">JAISALGO · TICKET CHECK</span><h1>{active?'Booking record verified.':'Booking requires review.'}</h1><p>{b.mode==='live'?'Current status from the booking ledger.':`${b.mode.toUpperCase()} record only. No real payment or travel reservation.`}</p><article className="verification-card"><Ticket size={22}/><h2>{b.title}</h2><dl><div><dt>Booking ID</dt><dd>{b.id}</dd></div><div><dt>Travel date</dt><dd>{ticketDate(b.date)}</dd></div><div><dt>Travelers</dt><dd>{b.travelers}</dd></div><div><dt>Booking status</dt><dd><StatusBadge tone={bookingTone(b.status)}>{b.status==='reserved'&&b.confirmationPending?'Supplier confirmation pending':b.status.replaceAll('_',' ')}</StatusBadge></dd></div><div><dt>Payment status</dt><dd>{b.refunded?`Refunded ${money(b.refunded)}`:b.paid>=b.total?'Fully paid':`Reserved · ${money(b.paid)} paid`}</dd></div></dl></article><p className="fine">This limited check does not show traveler or contact details. Verify the travel date and current status with the operator before admission.</p><BookingAssistance/></div>;
}
