import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import Link from 'next/link';
import {Plane,TrainFront,Car,Check} from 'lucide-react';
import {publishedTours} from '@/lib/seo-catalog';
import {cityDirectoryPath,cityPath,resolveCityGuide,cityArticleSchema} from '@/lib/city-travel';
import {findMarket} from '@/data/india-markets';
import {pageMetadata,hasSelection,breadcrumbSchema,type Query} from '@/lib/seo';
import {Photo} from '@/components/photo';
import {TourCard} from '@/components/booking/tour-card';
import {StructuredData} from '@/components/structured-data';
import {DirectionalIcon} from '@/components/directional-control';
export const dynamic='force-dynamic';
type Props={params:Promise<{city:string}>;searchParams:Promise<Query>};
async function resolve(city:string){const packages=await publishedTours(),guide=resolveCityGuide(city,packages);if(!guide)notFound();if(city!==guide.slug)permanentRedirect(cityPath(guide.slug));return {guide,packages}}
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const {guide}=await resolve((await params).city);return pageMetadata({title:guide.seoTitle,description:guide.seoDescription,path:cityPath(guide.slug),image:guide.image,article:{updated:guide.contentReviewedAt},noindex:hasSelection(await searchParams)})}
const icons={Air:Plane,Rail:TrainFront,Road:Car};
export default async function CityGuide({params}:Props){
  const {guide,packages}=await resolve((await params).city),market=findMarket(guide.slug)!,related=guide.relevantPackageIds.flatMap(id=>packages.find(p=>p.slug===id)||[]);
  return <div className="wrap city-guide" data-city-guide={guide.slug}>
    <StructuredData data={breadcrumbSchema([{name:'Home',path:'/'},{name:'Travel from your city',path:cityDirectoryPath},{name:market.city,path:cityPath(guide.slug)}])}/>
    <StructuredData data={cityArticleSchema(guide)}/>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href={cityDirectoryPath}>Travel from your city</Link> / <span aria-current="page">{market.city}</span></nav>
    <header className="city-guide-hero"><div><div className="overline">{market.group.toUpperCase()} · JAISALMER PLANNING</div><h1>Jaisalmer, <br/><em>{`from ${market.city}.`}</em></h1><p>{guide.intro}</p><a href="#local-packages" className="underlink">Explore local packages <DirectionalIcon direction="right"/></a></div><Photo id={guide.image} priority sizes="(max-width: 800px) 100vw, 42vw"/></header>
    <p className="article-byline"><Link href="/about">JaisalGo planning notes</Link><span>Sources checked <time dateTime={guide.contentReviewedAt}>{new Date(guide.contentReviewedAt+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time></span></p>
    <div className="article-layout city-reading"><article className="prose">
      <nav className="article-toc" aria-label="On this page"><strong>In this guide</strong><a href="#travel-options">Travel options</a><a href="#local-itinerary">How long to stay</a><a href="#your-group">Your group &amp; comfort</a><a href="#trip-budget">The full trip budget</a><a href="#arrival">Arrival &amp; pickup</a><a href="#questions">Common questions</a><a href="#local-packages">Local package ideas</a></nav>
      <section id="travel-options"><h2>Getting here from {market.city}.</h2><p>Use these options to plan, then confirm the live timetable with the provider. No origin transport is included in the linked local estimates.</p><div className="city-transport-options">{guide.travelOptions.map(option=>{const Icon=icons[option.mode],source=guide.sources.find(s=>s.id===option.source)!;return <section key={option.mode}><h3><Icon size={19} aria-hidden="true"/>{option.title}</h3><p>{option.body}</p><p className="city-timing">{option.timing}</p><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></section>})}</div></section>
      <section id="local-itinerary"><h2>Count days in Jaisalmer, then add travel.</h2>{guide.itinerarySuggestions.map(item=><section key={item.title}><h3>{item.title}</h3><p>{item.body}</p><Link href={item.path}>See the suggested local itinerary</Link></section>)}</section>
      <section id="your-group"><h2>Plan around your people.</h2>{guide.groupAdvice.map(item=><section key={item.title}><h3>{item.title}</h3><p>{item.body}</p></section>)}</section>
      <section id="trip-budget"><h2>The complete trip budget.</h2><p>{guide.budget}</p><Link href="/travel-guide/budget-planning">Build your Jaisalmer trip budget</Link></section>
      <section id="arrival"><h2>Arrive with a clear plan.</h2><ul className="city-arrival-list">{guide.arrivalTips.map(tip=><li key={tip}><Check size={17} aria-hidden="true"/>{tip}</li>)}</ul></section>
      <section id="questions"><h2>A few questions before you go.</h2>{guide.faqs.map(faq=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
      <section className="source-note"><h2>Sources &amp; planning context</h2><p>Source review: {guide.contentReviewedAt}. These are our planning suggestions, not dated transport offers. We have not verified live fares or fixed journey durations. Confirm both directions before committing to a local activity.</p><ul>{guide.sources.map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.scope}</p></li>)}</ul><Link href="/photo-credits">Destination image sources &amp; licences</Link></section>
    </article><aside><div className="quote-panel"><div className="overline">YOUR TIME IN THE GOLDEN CITY</div><h2>Choose your local escape.</h2><p>Compare the stay, meals, vehicle, activities and full group estimate. Travel from {market.city} is separate.</p><Link className="button" href="#local-packages">See local packages <DirectionalIcon direction="right"/></Link><Link className="underlink" href="/travel-guide/how-to-reach">Arrival planning <DirectionalIcon direction="up-right"/></Link></div></aside></div>
    <section id="local-packages" className="related-packages"><div className="overline">LOCAL JAISALMER EXPERIENCES</div><h2>A few ways to spend your time here.</h2><p>Proposed local itineraries and estimates. Confirmed inclusions and availability are shown by the package. These are not departures from {market.city}.</p><div className="tour-grid" data-city-package-links={guide.slug}>{related.map(tour=><TourCard key={tour.slug} tour={tour}/>)}</div></section>
    <nav className="search-context-links" aria-label="More Jaisalmer planning"><Link href={cityDirectoryPath}>Explore all city travel guides</Link><Link href="/packages">All local Jaisalmer packages</Link><Link href="/travel-guide/best-time-to-visit">Best time to visit</Link><Link href="/travel-guide/desert-camp-checklist">What to check before choosing a camp</Link></nav>
  </div>;
}
