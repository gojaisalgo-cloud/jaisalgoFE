import Link from 'next/link';
import {IndianRupee,ShieldCheck,TicketCheck,SlidersHorizontal,Phone,FileText,ArrowUpRight,Check} from 'lucide-react';
import {config} from '@/lib/config';

const reasons=[
 {title:'₹99 counts towards your trip',text:'Your reservation token is part of the package total, with the remaining balance due at check-in or on your visit date.',icon:IndianRupee,tone:'sand'},
 {title:'Payment checked before a ticket',text:'A booking ticket is issued after payment verification. A checkout attempt alone is not a paid reservation.',icon:ShieldCheck,tone:'blue'},
 {title:'Your booking, easy to find',text:'Keep your private access link or booking key to view your reservation and ticket in My Bookings.',icon:TicketCheck,tone:'sage'},
 {title:'Compare before you commit',text:'See the group estimate, night plan, proposed inclusions and available options before checkout.',icon:SlidersHorizontal,tone:'plum'},
 {title:'A person to help you plan',text:`Call ${config.phone} for package questions, payment assistance and help with your booking.`,icon:Phone,tone:'peach'},
 {title:'Terms you can check first',text:'Review the cancellation terms before payment. Supplier arrangements and availability still need confirmation.',icon:FileText,tone:'rose'},
];
export function BookingConfidence(){return <section className="home-section booking-confidence" aria-labelledby="booking-confidence-title">
 <div className="premium-section-heading"><div><span className="overline">A LITTLE CLARITY. A LOT MORE CONFIDENCE.</span><h2 id="booking-confidence-title">Why book with JaisalGo?</h2><p>Know what you’re paying, what happens next and who to call.</p></div></div>
 <div className="confidence-banner">
  <div className="confidence-banner-copy"><span className="confidence-eyebrow"><ShieldCheck size={17} aria-hidden="true"/>BOOKING, CLEARLY EXPLAINED</span><h3>A small token.<br/>A clear next step.</h3><p>Reserve with ₹99, then keep your ticket and travel details together. Your token counts towards the selected package total.</p><ul><li><Check size={16} aria-hidden="true"/>Review your full group estimate</li><li><Check size={16} aria-hidden="true"/>Ticket after payment verification</li><li><Check size={16} aria-hidden="true"/>Travel desk for booking assistance</li></ul><a href={config.phoneHref}>Talk to the travel desk <ArrowUpRight size={17} aria-hidden="true"/></a></div>
  <div className="confidence-token"><span className="confidence-shield" aria-hidden="true"><ShieldCheck strokeWidth={1.2}/></span><div><strong>₹99</strong><span>reservation token</span><small>Part of your package total</small></div></div>
 </div>
 <div className="confidence-grid">{reasons.map(({title,text,icon:Icon,tone})=><article className={`confidence-card confidence-${tone}`} key={title}><span className="confidence-card-icon"><Icon size={26} strokeWidth={1.7} aria-hidden="true"/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
 <div className="confidence-footer"><p>Final services, supplier rates and availability require confirmation. Cancellation and refunds follow the terms accepted at checkout.</p><div><Link href="/cancellation-policy">Cancellation terms <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/my-bookings">My bookings <ArrowUpRight size={15} aria-hidden="true"/></Link></div></div>
 </section>}
