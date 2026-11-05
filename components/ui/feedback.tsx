import type {ReactNode} from 'react';
import {CheckCircle2,AlertCircle,Clock3,Info,MinusCircle,LoaderCircle} from 'lucide-react';

export type FeedbackTone='success'|'error'|'warning'|'info'|'neutral';
const icons={success:CheckCircle2,error:AlertCircle,warning:Clock3,info:Info,neutral:MinusCircle};

/** Presentation only: payment and booking states remain owned by the booking service. */
export function bookingTone(status:string):FeedbackTone{
 if(['paid','reserved','captured'].includes(status))return 'success';
 if(['failed','rejected'].includes(status))return 'error';
 if(['pending','authorized','creating','cancellation_requested','refund_requested','partially_refunded','refund_required','payment_review','order_unknown','order_claimed'].includes(status))return 'warning';
 if(status==='refunded')return 'info';
 return 'neutral';
}

export function StatusBadge({tone,children,className=''}:{tone:FeedbackTone;children:ReactNode;className?:string}){
 const Icon=icons[tone];
 return <span className={`status-badge ${className}`} data-tone={tone}><Icon size={14} strokeWidth={1.75} aria-hidden="true"/>{children}</span>;
}

export function Feedback({tone='info',children,className=''}:{tone?:FeedbackTone;children:ReactNode;className?:string}){
 const Icon=icons[tone];
 return <div className={`feedback ${className}`} data-tone={tone} role={tone==='error'?'alert':'status'}><Icon size={18} strokeWidth={1.75} aria-hidden="true"/><div>{children}</div></div>;
}

export function LoadingIcon(){return <LoaderCircle className="loading-icon" size={18} strokeWidth={1.75} aria-hidden="true"/>}

export function BookingListLoading(){
 return <div className="booking-list-loading" role="status" aria-label="Finding your tickets"><span className="sr-only">Finding your tickets…</span>{[0,1].map(n=><div className="ticket-skeleton" key={n} aria-hidden="true"><span className="skeleton skeleton-photo"/><div><span className="skeleton skeleton-label"/><span className="skeleton skeleton-title"/><span className="skeleton skeleton-copy"/></div></div>)}</div>;
}
