import {cookies} from 'next/headers';
import {privateRobots} from '@/lib/seo';
import {customerForSession} from '@/lib/customer/auth';
import {MyBookings} from '@/components/booking/my-bookings';
export const metadata={title:'My bookings',robots:privateRobots};
export default async function Bookings(){
 const cookieStore=await cookies(),token=cookieStore.get(process.env.VERCEL==='1'?'__Host-jaisalgo_customer_session':'jaisalgo_customer_session')?.value||'';
 const user=await customerForSession(token).catch(()=>null);
 return <div className="wrap my-bookings-page">{user?<MyBookings/>:null}</div>;
}
