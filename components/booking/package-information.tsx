'use client';
import dynamic from 'next/dynamic';
import {useEffect,useId,useRef,useState} from 'react';
import {Info,X} from 'lucide-react';
import {DirectionalIcon,IconButton} from '@/components/directional-control';
import {track} from '@/lib/analytics/client';
import type {Tour} from '@/data/catalog';
import type {Choices} from '@/lib/booking/pricing';
const PackageInformationContent=dynamic(()=>import('./package-information-content').then(m=>m.PackageInformationContent),{loading:()=> <p className="info-section" role="status">Loading package details…</p>});
export function PackageInformation({tour:t,options=false,initialChoices,initialDate}:{tour:Tour;options?:boolean;initialChoices?:Choices;initialDate?:string}){
 const [open,setOpen]=useState(false),dialog=useRef<HTMLDialogElement>(null),button=useRef<HTMLButtonElement>(null),id=useId();
 useEffect(()=>{if(!open)return;const el=dialog.current;if(!el)return;const trigger=button.current,previous=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=previous;trigger?.focus({preventScroll:true})}},[open]);
 return <><button ref={button} type="button" className={options?'package-options-button':'package-info-button'} aria-label={`${options?'Compare options':'Package details'}: ${t.title}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>(track('package_viewed',{packageId:t.slug}),track('package_info_opened',{packageId:t.slug}),setOpen(true))}>{options?<><span>Compare {t.nights?'stay & transfer':'group & transfer'} options</span><DirectionalIcon direction="right"/></>:<><Info size={19}/><span>Details</span></>}</button>{open&&<dialog ref={dialog} className="package-dialog" aria-labelledby={id} onCancel={e=>{e.preventDefault();setOpen(false)}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setOpen(false)}}}><div className="package-dialog-top"><span>{options?'CHOOSE YOUR ARRANGEMENT':'YOUR TRIP, IN DETAIL'}</span><IconButton autoFocus className="package-close" aria-label="Close package details" onClick={()=>setOpen(false)}><X aria-hidden="true"/></IconButton></div><div className="package-dialog-scroll"><PackageInformationContent tour={t} titleId={id} initialChoices={initialChoices} initialDate={initialDate} initialSection={options?'price':'overview'} compactPrice={options}/></div></dialog>}</>;
}
