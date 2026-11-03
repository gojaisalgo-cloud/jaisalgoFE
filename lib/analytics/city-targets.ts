import {cityGuideKeys} from '@/data/city-guide-keys';
import {findMarket} from '@/data/india-markets';
import type {AnalyticsEvent} from './schema';
import type {LedgerBooking} from './report';

/** Targets describe content, never the visitor's location. First measured session entry, no URL or IP storage. */
export function cityTargetReport(events:AnalyticsEvent[],bookings:LedgerBooking[]){
  const entries=new Map<string,AnalyticsEvent>();
  for(const event of [...events].sort((a,b)=>a.at-b.at))if(event.name==='website_visit'&&event.session&&!entries.has(event.session))entries.set(event.session,event);
  const summarize=(keys:readonly string[])=>{
    const views=events.filter(e=>e.session&&e.name==='city_guide_viewed'&&keys.includes(String(e.props.cityGuideId)));
    const viewed=new Set(views.map(e=>e.session));
    const clicks=new Set(events.filter(e=>e.session&&e.name==='city_package_clicked'&&keys.includes(String(e.props.cityGuideId))&&views.some(v=>v.session===e.session&&v.props.cityGuideId===e.props.cityGuideId&&v.at<=e.at)).map(e=>e.session));
    const landings=new Map([...entries].filter(([,e])=>keys.includes(String(e.props.cityGuideId))&&e.props.source==='search'));
    const afterEntry=(session:string|null,at:number)=>!!session&&landings.has(session)&&landings.get(session)!.at<=at;
    const packageViews=new Set(events.filter(e=>e.name==='package_info_opened'&&afterEntry(e.session,e.at)).map(e=>e.session));
    const starts=new Set(events.filter(e=>e.name==='checkout_started'&&afterEntry(e.session,e.at)).map(e=>e.session));
    const verified=bookings.filter(b=>afterEntry(b.session,b.created)&&b.paid>=9900&&b.ledgerPaid>=9900);
    const paid=verified.filter(b=>b.status==='paid'&&b.paid-b.refunded>=b.total&&b.ledgerPaid-b.ledgerRefunded>=b.total);
    const completed=paid.filter(b=>!!b.tripCompletedAt);
    const converted=new Set(verified.map(b=>b.session));
    return {guideSessions:viewed.size,guideToPackageSessions:clicks.size,guideToPackageRate:viewed.size?clicks.size/viewed.size:null,organicLandingSessions:landings.size,organicPackageDetailSessions:packageViews.size,organicReservationStartSessions:starts.size,verifiedReservations:verified.length,fullyPaidBookings:paid.length,completedTrips:completed.length,netCollectedPaise:verified.reduce((sum,b)=>sum+b.ledgerPaid-b.ledgerRefunded,0),completedTripNetCollectedPaise:completed.reduce((sum,b)=>sum+b.ledgerPaid-b.ledgerRefunded,0),organicLandingConversion:landings.size?converted.size/landings.size:null};
  };
  const city=cityGuideKeys.map(slug=>{const market=findMarket(slug)!;return {slug,city:market.city,state:market.state,group:market.group,...summarize([slug])}});
  const groups=[...new Set(city.map(row=>row.group))].map(group=>({group,...summarize(city.filter(row=>row.group===group).map(row=>row.slug))}));
  return {city,groups};
}
