import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {publishedTour,publishedTours} from '@/lib/seo-catalog';
import {choicesFromParams,travelDateBounds,requestedDate} from '@/lib/booking/preferences';
import {today} from '@/lib/booking/security';
import {PackageInformationContent} from '@/components/booking/package-information';
import {StructuredData} from '@/components/structured-data';
import {TourCard} from '@/components/booking/tour-card';
import {breadcrumbSchema,tripSchema,packageMetadata,hasSelection,privateRobots,type Query} from '@/lib/seo';
import {guideLinks} from '@/data/search-pages';
export const dynamic='force-dynamic';
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Query>}):Promise<Metadata>{const {slug}=await params,t=await publishedTour(slug);return t?packageMetadata(t,hasSelection(await searchParams)):{title:'Package not found',robots:privateRobots}}
export default async function Details({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params,t=await publishedTour(slug);if(!t)notFound();const query=await searchParams,choices=choicesFromParams(t,query),bounds=travelDateBounds(today()),date=requestedDate(query.date,bounds.minDate,bounds.maxDate);
 const related=(await publishedTours()).filter(p=>p.slug!==slug&&p.area===t.area).sort((a,b)=>Math.abs(a.days-t.days)-Math.abs(b.days-t.days)).slice(0,3);
 return <div className="wrap standalone-package">
  <StructuredData data={breadcrumbSchema([{name:'Home',path:'/'},{name:'Jaisalmer packages',path:'/packages'},{name:t.title,path:`/packages/${slug}`}])}/>
  <StructuredData data={tripSchema(t)}/>
  <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/packages">Packages</Link> / <span aria-current="page">{t.title}</span></nav>
  <PackageInformationContent key={JSON.stringify({choices,date})} tour={t} standalone dateBounds={bounds} initialChoices={choices} initialDate={date} initialSection={query.section==='price'?'price':'overview'}/>
  <nav className="search-context-links" aria-label="Plan around this package"><h2>Know the destination before you go.</h2>{guideLinks(t.area!=='City').map(link=><Link key={link.path} href={link.path}>{link.title}</Link>)}<Link href="/cancellation-policy">Cancellation and refund guidance</Link></nav>
  {!!related.length&&<section className="related-packages"><h2>A few other ways to go.</h2><div className="tour-grid">{related.map(p=><TourCard key={p.slug} tour={p} selection={query}/>)}</div></section>}
 </div>;
}
