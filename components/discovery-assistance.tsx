'use client';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Phone,HelpCircle,FileText,MessageCircle,Compass,Tent,Heart,Users,Map,ChevronDown,BookOpen} from 'lucide-react';
import {Modal} from '@/components/ui/modal';
import {DirectionalIcon} from '@/components/directional-control';

const collections=[
 {title:'City & desert',description:'Heritage routes and unhurried escapes',href:'/packages?kind=tour',icon:Map},
 {title:'Desert stays',description:'Compare base camp and tent arrangements',href:'/packages?kind=camp',icon:Tent},
 {title:'Safaris & activities',description:'Short experiences, at your pace',href:'/packages?kind=activity',icon:Compass},
 {title:'For two',description:'Ideas for your own time together',href:'/packages?style=Couples',icon:Heart},
 {title:'Family & friends',description:'Find a route that suits your party',href:'/packages?style=Families%7CFriends',icon:Users},
 {title:'Culture & evenings',description:'Explore cultural evening packages',href:'/packages?kind=cultural',icon:BookOpen},
];
export function ExploreNavigation({onNavigate}:{onNavigate:()=>void}){
 const [open,setOpen]=useState(false);
 return <><button type="button" className="explore-navigation-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>Explore<ChevronDown size={16} aria-hidden="true"/></button>{open&&<Modal title="Explore Jaisalmer" onClose={()=>setOpen(false)} className="explore-modal"><p>Start with your kind of escape. Compare the details before you choose.</p><div className="explore-grid">{collections.map(c=><Link key={c.href} href={c.href} onClick={()=>{setOpen(false);onNavigate()}}><c.icon size={22} strokeWidth={1.6} aria-hidden="true"/><span><strong>{c.title}</strong><small>{c.description}</small></span><DirectionalIcon direction="right"/></Link>)}</div><div className="explore-footer"><Link className="text-button" href="/packages" onClick={()=>{setOpen(false);onNavigate()}}>All packages<DirectionalIcon direction="right"/></Link><Link className="text-button" href="/plan-your-trip" onClick={()=>{setOpen(false);onNavigate()}}>Plan a custom trip<DirectionalIcon direction="right"/></Link></div></Modal>}</>;
}
export function DiscoveryAssistance({phone,phoneHref,whatsapp}:{phone:string;phoneHref:string;whatsapp?:string}){
 const path=usePathname(),[open,setOpen]=useState(false);
 // Transaction screens already have inline support and sticky payment actions.
 if(/^\/(book|reservations|my-bookings|verify|admin)(\/|$)/.test(path))return null;
 return <><button type="button" className="discovery-help-launcher" aria-label="Booking help" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><HelpCircle size={21} aria-hidden="true"/><span>Need a hand?</span></button>{open&&<Modal title="A little help, whenever you need it" onClose={()=>setOpen(false)} className="discovery-help-modal"><p>Questions about a package, payment or your ticket? Call our assistance number. A call or trip brief does not confirm a reservation.</p><div className="discovery-help-links"><a href={phoneHref}><Phone aria-hidden="true"/><span><strong>Call {phone}</strong><small>Speak to booking assistance</small></span><DirectionalIcon direction="up-right"/></a>{whatsapp&&<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true"/><span><strong>Open WhatsApp</strong><small>Write and send your message in WhatsApp</small></span><DirectionalIcon direction="up-right"/></a>}<Link href="/plan-your-trip" onClick={()=>setOpen(false)}><FileText aria-hidden="true"/><span><strong>Plan a custom trip</strong><small>Save your dates and preferences in a trip brief</small></span><DirectionalIcon direction="right"/></Link><Link href="/my-bookings" onClick={()=>setOpen(false)}><Compass aria-hidden="true"/><span><strong>Find my ticket</strong><small>Open bookings saved on this device</small></span><DirectionalIcon direction="right"/></Link></div></Modal>}</>;
}
