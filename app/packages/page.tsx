import {packageCollections} from '@/data/package-collections';
import {TravelSearch} from '@/components/travel-search';
import {travelDateBounds} from '@/lib/booking/preferences';
import {today} from '@/lib/booking/security';
import {bookingPaymentTerms} from '@/lib/booking/customer-copy';
import type {Metadata} from 'next';
import {mode} from '@/lib/booking/payments';
import Link from 'next/link';
import {publishedTours} from '@/lib/seo-catalog';
import {PackageGuide} from '@/components/booking/package-guide';
import {TourCatalog} from '@/components/booking/catalog';
import {StructuredData} from '@/components/structured-data';
import {hasSelection,listSchema,breadcrumbSchema,pageMetadata,type Query} from '@/lib/seo';
import {searchPages,guideLinks} from '@/data/search-pages';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<Query>}):Promise<Metadata>{
  return pageMetadata({...searchPages['/packages'],path:'/packages',noindex:hasSelection(await searchParams)});
}
export default async function Packages({searchParams}:{searchParams:Promise<Query>}){
  const all=await publishedTours(),query=await searchParams;
  return <div className="wrap booking-list-page">
    {!hasSelection(query)&&<StructuredData data={listSchema('Jaisalmer tour packages','/packages',all.map(t=>({title:t.title,path:`/packages/${t.slug}`})))}/>}
    <StructuredData data={breadcrumbSchema([{name:'Home',path:'/'},{name:'Jaisalmer packages',path:'/packages'}])}/><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <span aria-current="page">Packages</span></nav>
    <header className="package-list-heading"><div><span className="overline">JAISALMER, YOUR WAY</span><h1>Jaisalmer tour packages.</h1><p>Find your perfect mix of golden streets, desert skies and a little adventure.</p></div><span className="listing-destination">Rajasthan, India · Jaisalmer</span></header>
    <TravelSearch {...travelDateBounds(today())} suggestions={['Jaisalmer','Sam','Khuri','Camel',...all.map(t=>t.title)]} compact/>
    <div className="booking-mode-note">Compare the charging basis: per person, tent or vehicle. All prices are provisional. {bookingPaymentTerms} ₹99 is part of the total. {mode()==='demo'?'Demo checkout: no money or real reservation is taken.':mode()==='test'?'Gateway test checkout: no real charge or travel reservation.':'Review the confirmed departure and accepted terms before paying.'}</div>
    <nav className="seo-inline-links" aria-label="Package collections">{packageCollections.map(c=><Link key={c.slug} href={'/packages/'+c.slug}>{c.title}</Link>)}</nav><TourCatalog tours={all}/><PackageGuide/>
    <nav className="search-context-links" aria-label="Jaisalmer planning guides"><h2>A little clarity before you choose.</h2>{guideLinks().map(link=><Link key={link.path} href={link.path}>{link.title}</Link>)}<Link href="/travel-guide">All Jaisalmer travel guides</Link></nav>
  </div>;
}
