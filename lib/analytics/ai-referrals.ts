import type {AnalyticsEvent} from './schema';
import type {LedgerBooking} from './report';
/** Identifiable, consented AI referral sessions; never a measure of AI mentions or impressions. */
export function aiReferralReport(events:AnalyticsEvent[],bookings:LedgerBooking[]){
 const entries=new Map<string,AnalyticsEvent>();for(const e of [...events].sort((a,b)=>a.at-b.at))if(e.name==='website_visit'&&e.session&&!entries.has(e.session))entries.set(e.session,e);
 const sessions=new Map([...entries].filter(([,e])=>e.props.source==='ai'));
 const afterEntry=(s:string|null,at:number)=>!!s&&sessions.has(s)&&sessions.get(s)!.at<=at;
 const verified=bookings.filter(b=>afterEntry(b.session,b.created)&&b.paid>=9900&&b.ledgerPaid>=9900);
 const converted=new Set(verified.map(b=>b.session));
 return {sessions:sessions.size,packageDetailSessions:new Set(events.filter(e=>e.name==='package_info_opened'&&afterEntry(e.session,e.at)).map(e=>e.session)).size,verifiedReservations:verified.length,convertedSessions:converted.size,conversionRate:sessions.size?converted.size/sessions.size:null,netCollectedPaise:verified.reduce((sum,b)=>sum+b.ledgerPaid-b.ledgerRefunded,0)};
}
