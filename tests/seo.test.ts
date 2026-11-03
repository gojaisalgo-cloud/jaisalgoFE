import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedTours} from '../data/catalog';
import {collections} from '../data/editorial';
import {imageAsset,images} from '../data/images';
import {searchPages,editorialTitle,publicStaticPaths,guideLinks} from '../data/search-pages';
import {siteOrigin,canonicalUrl} from '../lib/site-url';
import {pageMetadata,packageMetadata,serializeJsonLd,tripSchema,articleSchema,breadcrumbSchema,hasSelection} from '../lib/seo';
import {catalogueContentDate} from '../lib/catalog-content-date';
import {hydrateTour} from '../lib/booking/db';
import {organicReport} from '../lib/analytics/organic';
import type {AnalyticsEvent} from '../lib/analytics/schema';
import type {LedgerBooking} from '../lib/analytics/report';

test('production origin stays on the canonical HTTPS host and rejects leaked or local configuration',()=>{
  for(const value of [undefined,'','https://jaisalgo.com','https://jaisalgo.com/','https://www.jaisalgo.com/','http://localhost:3001','https://localhost','https://127.0.0.1','http://www.jaisalgo.com','https://user:secret@example.com','https://example.com/path','https://example.com?token=secret','not a URL'])assert.equal(siteOrigin(value),'https://www.jaisalgo.com',value);
  assert.equal(siteOrigin('https://travel.example.com/'),'https://travel.example.com');
  assert.equal(canonicalUrl('/packages/city-and-dunes/?utm_source=google#price'),'https://www.jaisalgo.com/packages/city-and-dunes');
  assert.equal(canonicalUrl('/'),'https://www.jaisalgo.com/');
  for(const path of ['https://evil.invalid','//evil.invalid','/\\evil.invalid'])assert.throws(()=>canonicalUrl(path));
});

test('tracking parameters consolidate to the canonical; actual catalogue and trip variants stay noindex',()=>{
  assert.equal(hasSelection({utm_source:'google',utm_campaign:'winter',gclid:'123',fbclid:'456'}),false);
  assert.equal(hasSelection({sort:'',days:undefined}),false);
  for(const query of [{days:'3'},{sort:'price'},{q:'camel'},{section:'price'},{date:'2027-01-10'},{children:'1'},{rooming:'single'}])assert.equal(hasSelection(query),true);
});

test('every public page has unique metadata, canonical and matching page-specific social previews',()=>{
  const all=[...Object.entries(searchPages).filter(([,p])=>!p.noindex).map(([path,p])=>pageMetadata({...p,path})),...seedTours().filter(t=>t.published).map(t=>packageMetadata(t)),...Object.entries(collections).flatMap(([name,items])=>items.map(item=>pageMetadata({title:editorialTitle(name,item),description:item.description,path:`/${name}/${item.slug}`,image:item.image,article:item})))];
  const titles=new Set(),descriptions=new Set(),urls=new Set();
  for(const metadata of all){
    assert.ok(typeof metadata.title==='string'&&metadata.title.length>12);
    assert.ok(metadata.description&&metadata.description.length>45);
    assert.equal(titles.has(metadata.title),false,`duplicate title: ${metadata.title}`);titles.add(metadata.title);
    assert.equal(descriptions.has(metadata.description),false,`duplicate description: ${metadata.description}`);descriptions.add(metadata.description);
    const url=metadata.alternates?.canonical;assert.equal(typeof url,'string');assert.ok(String(url).startsWith('https://www.jaisalgo.com/'));assert.equal(urls.has(url),false);urls.add(url);
    assert.equal(metadata.openGraph?.title,`${metadata.title} | JaisalGo`);assert.equal(metadata.openGraph?.description,metadata.description);assert.equal(metadata.openGraph?.url,url);
    assert.equal(metadata.twitter?.title,metadata.openGraph?.title);
    assert.equal(String(metadata.description).includes('₹99'),false,'Unavailable live reservations must not be advertised in search snippets.');
  }
});

test('JSON-LD cannot close its script element and retains the original data after parsing',()=>{
  const input={name:'</script><script>alert("x")</script> & > \u2028 \u2029'};
  const serialized=serializeJsonLd(input);
  assert.ok(!serialized.includes('<')&&!serialized.includes('>')&&!serialized.includes('&'));
  assert.deepEqual(JSON.parse(serialized),input);
});

test('trip schema describes the real itinerary without invented offers, ratings, supplier identity or deposit prices',()=>{
  for(const tour of seedTours()){
    const data=tripSchema(tour);assert.equal(data['@type'],'TouristTrip');assert.equal(data.name,tour.title);assert.equal(data.subTrip.length,tour.itinerary.length);assert.equal(data.subTrip[0].description,tour.itinerary[0].body);assert.equal('offers'in data,false);assert.equal('aggregateRating'in data,false);assert.equal('provider'in data,false);assert.ok(data.url.endsWith('/packages/'+tour.slug));
  }
});

test('editorial schema uses recorded content dates and honest organization attribution',()=>{
  for(const [name,items] of Object.entries(collections))for(const item of items){const data=articleSchema(item,`/${name}/${item.slug}`);assert.equal(data.dateModified,item.updated);assert.equal('datePublished'in data,false);assert.equal(data.author.name,'JaisalGo');assert.equal(data.citation,item.source)}
  const data=breadcrumbSchema([{name:'Home',path:'/'},{name:'Packages',path:'/packages'}]);assert.deepEqual(data.itemListElement.map(i=>i.position),[1,2]);assert.equal(data.itemListElement[1].item,'https://www.jaisalgo.com/packages');
});

test('only real catalogue content changes advance the sitemap date',()=>{
  const original=hydrateTour({...seedTours()[0],contentModifiedAt:'2026-10-25T10:00:00.000Z'}),now='2026-11-03T10:00:00.000Z';
  assert.equal(catalogueContentDate(original,{...original,revision:100,contentModifiedAt:now},now),original.contentModifiedAt);
  assert.equal(catalogueContentDate(original,{...original,costs:{...original.costs,meals:original.costs.meals+100}},now),now);
  assert.equal(catalogueContentDate(original,{...original,subtitle:'A genuinely different itinerary summary.'},now),now);
  assert.equal(catalogueContentDate(undefined,original,now),now);
  const {contentModifiedAt:unknownDate,...legacy}=original;void unknownDate;
  assert.equal(catalogueContentDate(legacy,{...legacy,revision:2},now),undefined);
});

test('public routes, linked guides, package slugs and image sources remain complete and distinct',()=>{
  const tours=seedTours(),slugs=tours.map(t=>t.slug),assets=new Set(images.map(i=>i.id));assert.equal(slugs.length,new Set(slugs).size);
  assert.ok(tours.every(t=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug)&&t.itinerary.length===t.days&&t.itinerary.every(day=>day.body.length>50)));
  const paths=new Set([...publicStaticPaths,...Object.entries(collections).flatMap(([name,items])=>items.map(item=>`/${name}/${item.slug}`))]);
  for(const link of [...guideLinks(),...guideLinks(true)])assert.ok(paths.has(link.path),link.path);
  for(const entry of [...tours,...Object.values(collections).flat()]){assert.ok(assets.has(entry.image),entry.image);assert.ok(imageAsset(entry.image).alt.length>20)}
  for(const privatePath of ['/book/city-and-dunes','/reservations/example','/admin','/my-bookings','/terms','/privacy-policy'])assert.ok(!publicStaticPaths.includes(privatePath));
});

test('organic conversions count only consented search sessions and verified money; card views and pending payments are separate',()=>{
  const event=(name:string,session:string,at:number,source='search'):AnalyticsEvent=>({id:name+session+at,name,session,at,mode:'live',origin:'client',attempt:null,props:{source}});
  const events=[event('website_visit','search-1',1),event('website_visit','search-1',1),event('website_visit','search-2',1),event('website_visit','direct-1',1,'direct'),event('package_viewed','search-1',2),event('package_info_opened','search-1',3),event('package_info_opened','search-2',20)];
  const book:LedgerBooking={id:'b',draftId:'d',packageId:'city-and-dunes',date:'2026-11-03',created:10,mode:'live',status:'paid',total:100000,paid:100000,refunded:0,ledgerPaid:100000,ledgerRefunded:0,actualExpenses:null,actualGatewayFees:null,tripCompletedAt:'2026-11-03',attempt:'a',session:'search-1'};
  const r=organicReport(events,[book,{...book,id:'pending',session:'search-2',paid:0,ledgerPaid:0,status:'pending'},{...book,id:'nonconsenting',session:null},{...book,id:'direct',session:'direct-1'}]);
  assert.equal(r.sessions,2);assert.equal(r.verifiedReservations,1);assert.equal(r.sessionToReservationRate,.5);assert.equal(r.packageDetailSessions,2);assert.equal(r.detailToReservationRate,.5);assert.equal(r.completedTrips,1);assert.equal(r.netCollectedPaise,100000);
  const refunded=organicReport(events,[{...book,status:'refunded',refunded:100000,ledgerRefunded:100000}]);assert.equal(refunded.netCollectedPaise,0);assert.equal(refunded.fullyPaidBookings,0);assert.equal(refunded.completedTrips,0);
  const late=organicReport(events,[{...book,session:'search-2'}]);assert.equal(late.detailToReservationRate,0);
  assert.equal(organicReport([],[]).sessionToReservationRate,null);
});
