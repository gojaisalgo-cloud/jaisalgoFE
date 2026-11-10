'use client';
import {captureBehaviour} from '@/lib/analytics/posthog-client';
import {useState} from 'react';
import {Images,MapPin} from 'lucide-react';
import {Photo} from '@/components/photo';
import {Modal} from '@/components/ui/modal';
import type {Tour} from '@/data/catalog';
export function PackageGallery({tour}:{tour:Tour}){
 const [open,setOpen]=useState(false),photos=[...new Set([tour.image,...(tour.area==='City'?['haveli','lake','fort-day']:tour.area==='Desert'?['sam','khuri','sunset']:['sam','haveli','lake'])])];
 const show=(position=0)=>{captureBehaviour('package_gallery_interacted',{package_slug:tour.slug,position,section:'gallery',cta_location:'gallery'});setOpen(true)};
 return <div className="package-gallery"><div className="package-gallery-grid">{photos.slice(0,3).map((id,i)=><button key={id} type="button" onClick={()=>show(i)} aria-label={`View destination photo ${i+1} for ${tour.title}`}><Photo id={id} priority={i===0} sizes={i===0?'(max-width:700px) 100vw, 65vw':'(max-width:700px) 50vw, 30vw'}/></button>)}<button type="button" className="gallery-view-all" onClick={()=>show()}><Images size={17}/>View photos</button></div><p><MapPin size={13} aria-hidden="true"/>Destination photographs · accommodation is confirmed separately</p>{open&&<Modal title="Explore the destination" onClose={()=>setOpen(false)} className="destination-gallery-modal"><p className="fine">Documentary destination views, not photographs of contracted accommodation.</p><div className="destination-gallery-photos">{photos.map(id=><Photo key={id} id={id} sizes="(max-width:700px) 100vw, 800px"/>)}</div></Modal>}</div>;
}
