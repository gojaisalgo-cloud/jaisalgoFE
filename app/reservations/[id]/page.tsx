import {ReservationPortal} from '@/components/booking/reservation-portal';
import {today} from '@/lib/booking/security';
export const dynamic='force-dynamic';
export const metadata={title:'Your private reservation',robots:{index:false,follow:false}};
export default async function Receipt({params}:{params:Promise<{id:string}>}){const {id}=await params;return <div className="wrap receipt-page"><ReservationPortal id={id} today={today()}/></div>}
