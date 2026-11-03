import type {Metadata} from 'next';
import {mode} from '@/lib/booking/payments';
import Link from 'next/link';
import {publishedTours} from '@/lib/seo-catalog';
import {PackageGuide} from '@/components/booking/package-guide';
import {TourCatalog} from '@/components/booking/catalog';
import {StructuredData} from '@/components/structured-data';
import {hasSelection,listSchema,pageMetadata,type Query} from '@/lib/seo';
import {searchPages,guideLinks} from '@/data/search-pages';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<Query>}):Promise<Metadata>{
  return pageMetadata({...searchPages['/packages'],path:'/packages',noindex:hasSelection(await searchParams)});
}
export default async function Packages({searchParams}:{searchParams:Promise<Query>}){
  const all=await publishedTours(),query=await searchParams;
  return <div className="wrap booking-list-page">
    {!hasSelection(query)&&<StructuredData data={listSchema('Jaisalmer tour packages','/packages',all.map(t=>({title:t.title,path:`/packages/${t.slug}`})))}/>}
    <div className="overline">JAISALMER, YOUR WAY</div>
    <h1>Jaisalmer tour packages.<br/><em>Your kind of escape.</em></h1>
    <p>From a short camel ride to a private desert escape. Compare the itinerary, stay, meals and full estimate, then find your pace.</p>
    <div className="booking-mode-note">Compare the charging basis: per person, tent or vehicle. All prices are provisional. ₹99 is part of the total. {mode()==='demo'?'Demo checkout: no money or real reservation is taken.':mode()==='test'?'Gateway test checkout: no real charge or travel reservation.':'Review the confirmed departure and accepted terms before paying.'}</div>
    <TourCatalog tours={all}/><PackageGuide/>
    <nav className="search-context-links" aria-label="Jaisalmer planning guides"><h2>A little clarity before you choose.</h2>{guideLinks().map(link=><Link key={link.path} href={link.path}>{link.title}</Link>)}<Link href="/travel-guide">All Jaisalmer travel guides</Link></nav>
  </div>;
}
