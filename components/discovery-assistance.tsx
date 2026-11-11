'use client';
import {HelpMascot} from '@/components/help-mascot';
import {SupportPanel} from '@/components/support-panel';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {Compass,Tent,Heart,Users,Map,ChevronDown,BookOpen} from 'lucide-react';
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
export function DiscoveryAssistance({phone,phoneHref}:{phone:string;phoneHref:string;whatsapp?:string}){
 const path=usePathname(),[open,setOpen]=useState(false);
 if(/^\/(book|reservations|my-bookings|verify|admin)(\/|$)/.test(path))return null;
 return <><button type="button" className="discovery-help-launcher" aria-label="Booking help" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><HelpMascot/><span>Need a hand?</span></button>{open&&<SupportPanel phone={phone} phoneHref={phoneHref} onClose={()=>setOpen(false)}/>}</>;
}
