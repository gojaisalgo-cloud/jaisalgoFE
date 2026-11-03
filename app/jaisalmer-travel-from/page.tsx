import type {Metadata} from 'next';
import Link from 'next/link';
import {publishedTours} from '@/lib/seo-catalog';
import {publishedCityGuides,cityDirectoryPath,cityPath} from '@/lib/city-travel';
import {pageMetadata,hasSelection,breadcrumbSchema,listSchema,type Query} from '@/lib/seo';
import {searchPages} from '@/data/search-pages';
import {findMarket} from '@/data/india-markets';
import {CityDiscovery} from '@/components/city-discovery';
import {StructuredData} from '@/components/structured-data';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<Query>}):Promise<Metadata>{return pageMetadata({...searchPages[cityDirectoryPath],path:cityDirectoryPath,noindex:hasSelection(await searchParams)})}
export default async function CityDirectory(){
  const guides=publishedCityGuides(await publishedTours());
  return <div className="wrap city-directory">
    <StructuredData data={breadcrumbSchema([{name:'Home',path:'/'},{name:'Travel from your city',path:cityDirectoryPath}])}/>
    <StructuredData data={listSchema('Jaisalmer travel from Indian cities',cityDirectoryPath,guides.map(g=>({title:`Jaisalmer from ${findMarket(g.slug)!.city}`,path:cityPath(g.slug)})))}/>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <span aria-current="page">Travel from your city</span></nav>
    <header className="listing-header"><div className="overline">A LITTLE PLANNING. A BETTER JOURNEY.</div><h1>Jaisalmer,<br/><em>from your city.</em></h1><p>Find your connection, make time for the desert and understand the full trip budget. Start with a practical city guide.</p></header>
    <CityDiscovery guides={guides}/>
    {!guides.length&&<p>City guides are being reviewed. <Link href="/travel-guide/how-to-reach">See how to reach Jaisalmer</Link>.</p>}
    <nav className="search-context-links" aria-label="More planning options"><h2>A clear plan, wherever you start.</h2><Link href="/travel-guide/how-to-reach">How to reach Jaisalmer</Link><Link href="/packages">Compare local Jaisalmer packages</Link><Link href="/travel-guide/budget-planning">Plan your complete trip budget</Link><Link href="/plan-your-trip">Create a travel brief</Link></nav>
  </div>;
}
