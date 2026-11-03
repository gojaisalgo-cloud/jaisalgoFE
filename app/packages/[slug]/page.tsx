import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {tour} from '@/lib/booking/db';
import {choicesFromParams,travelDateBounds,requestedDate} from '@/lib/booking/preferences';
import {today} from '@/lib/booking/security';
import {config} from '@/lib/config';
import {PackageInformationContent} from '@/components/booking/package-information';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,t=await tour(slug);return {title:t?.title||'Package unavailable',description:t?.subtitle,alternates:{canonical:'/packages/'+slug}}}
export default async function Details({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params,t=await tour(slug);if(!t)notFound();const query=await searchParams,choices=choicesFromParams(t,query),bounds=travelDateBounds(today()),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);
 const breadcrumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:config.url},{'@type':'ListItem',position:2,name:'Jaisalmer packages',item:config.url+'/packages'},{'@type':'ListItem',position:3,name:t.title,item:config.url+'/packages/'+slug}]};
 return <div className="wrap standalone-package"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs).replace(/</g,'\\u003c')}}/><nav className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/packages">Packages</Link> / <span>{t.title}</span></nav><PackageInformationContent key={JSON.stringify({choices,date})} tour={t} standalone initialChoices={choices} initialDate={date} initialSection={query.section==='price'?'price':'overview'}/></div>;
}
