import {MyBookings} from '@/components/booking/my-bookings';
export const metadata={title:'My bookings',robots:{index:false,follow:false}};
export default function Bookings(){return <div className="wrap my-bookings-page"><MyBookings/></div>}
