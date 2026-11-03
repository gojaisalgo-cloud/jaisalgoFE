import type {AnalyticsEvent} from './schema';
import type {LedgerBooking} from './report';

/** Same-window, consented search traffic matched to the verified payment ledger. */
export function organicReport(events:AnalyticsEvent[],bookings:LedgerBooking[]) {
  const sessions=new Set(events.filter(e=>e.name==='website_visit'&&e.props.source==='search').map(e=>e.session).filter((s):s is string=>!!s));
  const details=events.filter(e=>e.name==='package_info_opened'&&e.session&&sessions.has(e.session));
  const detailSessions=new Set(details.map(e=>e.session));
  const verified=bookings.filter(b=>b.session&&sessions.has(b.session)&&b.paid>=9900&&b.ledgerPaid>=9900);
  const converted=new Set(verified.map(b=>b.session));
  const detailConversions=new Set(verified.filter(b=>details.some(e=>e.session===b.session&&e.at<=b.created)).map(b=>b.session));
  const fullyPaid=verified.filter(b=>b.status==='paid'&&b.paid-b.refunded>=b.total&&b.ledgerPaid-b.ledgerRefunded>=b.total);
  const completed=fullyPaid.filter(b=>!!b.tripCompletedAt);
  return {
    sessions:sessions.size,packageDetailSessions:detailSessions.size,verifiedReservations:verified.length,
    convertedSessions:converted.size,sessionToReservationRate:sessions.size?converted.size/sessions.size:null,
    detailToReservationRate:detailSessions.size?detailConversions.size/detailSessions.size:null,
    fullyPaidBookings:fullyPaid.length,completedTrips:completed.length,
    netCollectedPaise:verified.reduce((sum,b)=>sum+b.ledgerPaid-b.ledgerRefunded,0),
    completedTripNetCollectedPaise:completed.reduce((sum,b)=>sum+b.ledgerPaid-b.ledgerRefunded,0),
  };
}
