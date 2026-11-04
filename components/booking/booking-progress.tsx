import {Check} from 'lucide-react';
export function BookingProgress({step}:{step:1|2|3}){
 return <ol className="booking-progress" aria-label="Booking progress">{['Trip & details','Payment','Your ticket'].map((label,index)=><li key={label} aria-current={index+1===step?'step':undefined} data-complete={index+1<step}><span>{index+1<step?<Check size={13} aria-hidden="true"/>:index+1}</span>{label}</li>)}</ol>;
}
