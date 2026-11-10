import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seoAliases} from '../data/seo-aliases';
import {collections} from '../data/editorial';
import {packageCollections,collectionTours} from '../data/package-collections';
import {publicStaticPaths,editorialTitle,editorialDescription} from '../data/search-pages';
import {seedTours} from '../data/catalog';
import {cityGuideKeys} from '../data/city-guide-keys';
import publicPaths from '../data/analytics-public-paths.json';
import {pageType} from '../lib/analytics/posthog-schema';
import {packageCollectionKeys} from '../data/package-collection-keys';
import {ga4Configured,ga4PagePayload,googleCommandQueue} from '../lib/analytics/ga4';
import {pageMetadata,destinationSchema,hasSelection} from '../lib/seo';
const canonicalPaths=new Set([...publicStaticPaths,...Object.entries(collections).flatMap(([k,v])=>v.map(e=>`/${k}/${e.slug}`)),...seedTours().map(t=>'/packages/'+t.slug),...packageCollections.map(c=>'/packages/'+c.slug),...cityGuideKeys.map(c=>'/jaisalmer-travel-from/'+c)]);
test('requested synonyms resolve to existing canonical content without chains or shadowing pages',()=>{
 assert.equal(Object.keys(seoAliases).length,13);
 for(const [alias,target] of Object.entries(seoAliases)){assert.ok(!canonicalPaths.has(alias));assert.ok(canonicalPaths.has(target),target);assert.ok(!seoAliases[target]);assert.ok(!/[?#]/.test(target))}
 assert.equal(seoAliases['/travel-guide/jaisalmer-3-day-itinerary'],'/itineraries/3-day-jaisalmer');
});
test('audience pages have distinct guidance and matching real inventory, without invented travel products',()=>{
 assert.deepEqual(packageCollections.map(c=>c.slug),[...packageCollectionKeys]);
 const slugs=seedTours().map(t=>t.slug),titles=new Set(),descriptions=new Set();
 for(const c of packageCollections){assert.ok(!slugs.includes(c.slug));assert.ok(!titles.has(c.title));titles.add(c.title);assert.ok(!descriptions.has(c.description));descriptions.add(c.description);assert.ok(c.sections.length>=3&&c.sections.every(s=>s.body.length>200));const selected=collectionTours(c,seedTours());assert.ok(selected.length>0);assert.ok(selected.every(t=>t.published));if(c.days)assert.ok(selected.every(t=>t.days===c.days));if(c.category)assert.ok(selected.every(t=>t.category===c.category));assert.equal(pageType('/packages/'+c.slug),'package_list');assert.equal(collectionTours(c,seedTours().map(t=>({...t,published:false}))).length,0)}
});
test('article and collection metadata remain unique with one English canonical and no speculative translations',()=>{
 const rows=[...Object.entries(collections).flatMap(([k,v])=>v.map(e=>pageMetadata({title:editorialTitle(k,e),description:editorialDescription(k,e),path:`/${k}/${e.slug}`,article:e}))),...packageCollections.map(c=>pageMetadata({...c,path:'/packages/'+c.slug}))];
 const titles=new Set(),descriptions=new Set();for(const m of rows){assert.ok(!titles.has(m.title));titles.add(m.title);assert.ok(!descriptions.has(m.description));descriptions.add(m.description);assert.ok(String(m.title).length+11<=70);assert.ok(String(m.description).length>=130&&String(m.description).length<=160);assert.equal(m.alternates?.languages?.['en-IN'],m.alternates?.canonical);assert.equal(m.alternates?.languages?.['hi-IN'],undefined)}
 assert.equal(destinationSchema()['@type'],'TouristDestination');assert.ok(!('aggregateRating' in destinationSchema()));
 for(const q of [{occasion:'birthday'},{dorm:'women'},{page:'2'}])assert.ok(hasSelection(q));
});
test('optional GA4 is disabled by default and strips query/referrer/private paths from public payloads',()=>{
 const enabled=process.env.NEXT_PUBLIC_GA4_ENABLED;delete process.env.NEXT_PUBLIC_GA4_ENABLED;assert.equal(ga4Configured(),false);if(enabled!==undefined)process.env.NEXT_PUBLIC_GA4_ENABLED=enabled;
 assert.deepEqual(new Set(publicPaths),canonicalPaths);
 assert.deepEqual(ga4PagePayload('/experiences/camel-safari?phone=secret#key=private'),{page_path:'/experiences/camel-safari',page_location:'https://www.jaisalgo.com/experiences/camel-safari',page_referrer:''});
 for(const path of ['/book/golden-city-escape','/reservations/private','/verify/private','/api/booking','/admin','/my-bookings','/unknown-personal-value'])assert.equal(ga4PagePayload(path),undefined);
});

test('GA4 queues commands using the documented Google Arguments protocol',()=>{
 const queue:unknown[]=[];const gtag=googleCommandQueue(queue);
 gtag('config','G-EXAMPLE',{send_page_view:false});
 assert.equal(Object.prototype.toString.call(queue[0]),'[object Arguments]');
 assert.deepEqual(Array.from(queue[0] as IArguments),['config','G-EXAMPLE',{send_page_view:false}]);
});
