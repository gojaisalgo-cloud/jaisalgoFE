import {HeritageWelcome} from '@/components/motion/heritage-welcome';
import {DesertHeroVideo} from '@/components/motion/desert-hero-video';
import {ScrollExperience} from '@/components/scroll-experience';
import {JaisalmerCollections,JaisalmerStays,JaisalmerExperiencePicks,type LocalExperiencePick} from '@/components/jaisalmer-discovery';
import {packageDetails,durationLabel} from '@/lib/booking/package-details';
import {webPageSchema} from '@/lib/geo';
import {BookingConfidence} from '@/components/booking-confidence';
import {HomeTravelGuide} from '@/components/home-travel-guide';
import {TravelSearch} from '@/components/travel-search';
import {travelDateBounds} from '@/lib/booking/preferences';
import {today} from '@/lib/booking/security';
import {config} from '@/lib/config';
import {bookingPaymentTerms} from '@/lib/booking/customer-copy';
import {CityDiscovery} from '@/components/city-discovery';
import {publishedCityGuides} from '@/lib/city-travel';
import {DirectionalIcon} from '@/components/directional-control';
import Link from 'next/link';
import {Phone,IndianRupee,Compass,ArrowUpRight,ShieldCheck,SlidersHorizontal} from 'lucide-react';
import {TourCatalog} from '@/components/booking/catalog';
import {tours} from '@/lib/booking/db';
import {mode} from '@/lib/booking/payments';
import {ExperienceGallery} from '@/components/experience-gallery';
import {pageMetadata,websiteSchema,destinationSchema} from '@/lib/seo';
import {searchPages} from '@/data/search-pages';
import {StructuredData} from '@/components/structured-data';
export const metadata={...pageMetadata({...searchPages['/'],path:'/'}),title:{absolute:`${searchPages['/'].title} | JaisalGo`}};
export const dynamic='force-dynamic';
export default async function Home(){
 const all=await tours(),featured=['golden-city-escape','city-and-dunes','royal-jaisalmer-holiday'].flatMap(s=>all.find(t=>t.slug===s)||[]),bounds=travelDateBounds(today());
 const pickSlugs=['sunset-desert-safari','jeep-dune-safari','desert-cultural-evening',...all.filter(t=>t.area==='City').slice(0,2).map(t=>t.slug),'short-camel-ride'];
 const picks:LocalExperiencePick[]=pickSlugs.flatMap(slug=>{const t=all.find(item=>item.slug===slug);if(!t)return [];const kind=packageDetails(t).kind;return [{slug:t.slug,title:t.title,description:t.subtitle,image:t.image,duration:durationLabel(t),category:kind==='cultural'?'Culture' as const:t.area==='City'?'City' as const:'Desert' as const}]});
 return <><ScrollExperience/><StructuredData data={websiteSchema()}/><StructuredData data={webPageSchema(searchPages['/'].title,searchPages['/'].description,'/')}/><StructuredData data={destinationSchema()}/>
 <section className="golden-hero"><DesertHeroVideo/><div className="golden-hero-shade"/><div className="wrap golden-hero-content"><HeritageWelcome/><h1>Jaisalmer tourism <br/><span>&amp; tour packages.</span></h1><p>Desert nights. Living heritage. Unforgettable days.<br/>Discover Jaisalmer at your own pace.</p><Link href="#discover" className="hero-discover">A place for every kind of explorer <ArrowUpRight size={19}/></Link></div></section>
 <div className="wrap premium-home"><div className="home-search"><TravelSearch {...bounds} suggestions={['Jaisalmer','Sam','Khuri','Camel','City',...all.map(t=>t.title)]}/></div>
 <div className="travel-promises"><span><IndianRupee/><span className="promise-full"><strong>A little now. More adventure later.</strong>Reserve with ₹99, deducted from your total.</span><span className="promise-compact" aria-hidden="true"><strong>₹99 to reserve</strong>Deducted from your total.</span></span><span><SlidersHorizontal/><span className="promise-full"><strong>Your trip, your choices.</strong>Compare stays, transfers and experiences.</span><span className="promise-compact" aria-hidden="true"><strong>Your choices</strong>Stays, transfers &amp; experiences.</span></span><a href={config.phoneHref}><Phone/><span><strong>A real person, a little local help.</strong><small>{config.phone} · booking assistance</small></span><DirectionalIcon direction="up-right"/></a></div>
 <JaisalmerCollections/>
 <section className="home-section package-first-section" id="book-packages"><div className="premium-section-heading"><div><span className="overline">LESS PLANNING. MORE LIVING.</span><h2>Good trips start right here.</h2><p>City discoveries, desert adventures and time to do a little of both.</p></div><Link href="/packages" className="underlink">View all packages <DirectionalIcon direction="right"/></Link></div><TourCatalog tours={[...featured,...all.filter(t=>!featured.some(f=>f.slug===t.slug))]} compact/><p className="catalog-price-note">Prices are provisional estimates, with the charging basis shown on each card. Supplier rates, taxes, services and availability require confirmation. {mode()==='demo'?'Demo checkout takes no real money or travel reservation.':mode()==='test'?'Gateway test checkout makes no real charge or travel reservation.':bookingPaymentTerms}</p></section>
 <BookingConfidence/>
 <JaisalmerStays/>
 <JaisalmerExperiencePicks picks={picks}/>
 <section className="home-section"><div className="premium-section-heading"><div><span className="overline">THE PLACES YOU’LL REMEMBER</span><h2>A thousand little reasons to go.</h2><p>Meet the places behind your next favourite memory.</p></div><Link className="underlink" href="/places">Discover Jaisalmer <DirectionalIcon direction="up-right"/></Link></div><ExperienceGallery/></section>
 <section className="custom-trip-banner"><div className="custom-trip-icon"><Compass size={42} strokeWidth={1.2}/></div><div><span className="overline">A LITTLE MORE YOU</span><h2>No two travellers. No two trips.</h2><p>Have a different idea? Bring your dates, your people and your wish list.</p></div><Link href="/plan-your-trip" className="button">Plan my own trip <DirectionalIcon direction="right"/></Link></section>
 <section className="home-section booking-steps"><div className="premium-section-heading"><div><span className="overline">SMALL STEPS. GREAT MEMORIES.</span><h2>From “let’s go” to good to go.</h2></div><span className="steps-token"><ShieldCheck size={19}/>₹99 counts towards your total</span></div><div>{[['01','Find your escape','Compare the route, proposed inclusions and full group estimate.'],['02','Make it yours','Choose your date, travellers and available package options.'],['03','Reserve with ₹99','Get your ticket after payment verification. Supplier confirmation is still required; pay the balance on arrival.']].map(([n,t,p])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div></section>
 <HomeTravelGuide/><CityDiscovery guides={publishedCityGuides(all)} compact/>
 </div></>;
}
