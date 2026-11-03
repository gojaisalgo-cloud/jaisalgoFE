import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedTours} from '../data/catalog';
import {cityGuides} from '../data/city-guides';
import {cityGuideKeys,cityGuideAtPath} from '../data/city-guide-keys';
import {indiaMarkets,findMarket} from '../data/india-markets';
import {cityPublicationIssues,publishedCityGuides,resolveCityGuide,cityPath,cityArticleSchema} from '../lib/city-travel';
import {pageMetadata} from '../lib/seo';
import {batchSchema} from '../lib/analytics/schema';
import {cityTargetReport} from '../lib/analytics/city-targets';
import type {AnalyticsEvent} from '../lib/analytics/schema';
import type {LedgerBooking} from '../lib/analytics/report';
import {randomUUID} from 'node:crypto';

test('market coverage is a research backlog, with all 36 states and UTs and no duplicate aliases',()=>{
  assert.equal(new Set(indiaMarkets.map(m=>m.state)).size,36);
  const names=indiaMarkets.flatMap(m=>[m.city,...m.aliases].map(name=>name.toLowerCase()));
  assert.equal(names.length,new Set(names).size);
  assert.equal(findMarket('Gurgaon')?.slug,'gurugram');assert.equal(findMarket('Bangalore')?.slug,'bengaluru');assert.equal(findMarket('Baroda')?.slug,'vadodara');
  assert.ok(indiaMarkets.length>100);assert.equal(resolveCityGuide('mumbai',seedTours()),undefined);assert.equal(resolveCityGuide('noida',seedTours()),undefined);
});
test('six separately researched guides pass publication checks and contain only real local experience references',()=>{
  const tours=seedTours(),approved=publishedCityGuides(tours),paths=new Set(),titles=new Set(),descriptions=new Set(),intros=new Set();
  assert.deepEqual(approved.map(g=>g.slug),[...cityGuideKeys]);
  for(const guide of cityGuides){
    assert.deepEqual(cityPublicationIssues(guide,tours),[],guide.slug);
    assert.ok(guide.relevantPackageIds.every(id=>tours.some(t=>t.slug===id&&t.published)));
    for(const [set,value] of [[paths,cityPath(guide.slug)],[titles,guide.seoTitle],[descriptions,guide.seoDescription],[intros,guide.intro]] as const){assert.equal(set.has(value),false);set.add(value)}
    const meta=pageMetadata({title:guide.seoTitle,description:guide.seoDescription,path:cityPath(guide.slug),image:guide.image});assert.equal(meta.alternates?.canonical,`https://www.jaisalgo.com${cityPath(guide.slug)}`);
    assert.ok(guide.intro.includes('separate'));assert.ok(guide.sources.every(s=>s.url.startsWith('https://')));
    const schema=cityArticleSchema(guide);assert.equal(schema['@type'],'Article');assert.equal(schema.dateModified,guide.contentReviewedAt);assert.equal(schema.citation.length,guide.sources.length);assert.equal('offers'in schema,false);assert.equal('aggregateRating'in schema,false);
  }
});
test('a city name, flags or a partial draft alone can never publish a guide',()=>{
  const guide=cityGuides[0],tours=seedTours();
  for(const changed of [{published:false},{indexable:false},{reviewStatus:'draft' as const},{contentReviewedAt:''},{intro:'Delhi'},{travelOptions:[]},{sources:[]},{faqs:[]},{budget:''},{relevantPackageIds:['not-a-real-package']}])assert.ok(cityPublicationIssues({...guide,...changed},tours).length>0,JSON.stringify(changed));
  assert.ok(cityPublicationIssues(guide,tours.map(t=>({...t,published:false}))).length>0);
  assert.ok(publishedCityGuides(tours.filter(t=>t.slug!=='city-and-dunes')).some(g=>g.slug==='delhi'),'other published local options keep a useful guide available');
});
test('aliases resolve to one canonical guide; unknown, typo and unsupported city paths stay absent',()=>{
  const tours=seedTours();for(const [alias,target] of [['new-delhi','delhi'],['delhi-ncr','delhi'],['baroda','vadodara'],['bangalore','bengaluru']])assert.equal(resolveCityGuide(alias,tours)?.slug,target);
  for(const value of ['jaiselmer','gurgaon','unknown','../../delhi','delhi/extra'])assert.equal(resolveCityGuide(value,tours),undefined);
  assert.equal(cityGuideAtPath('/jaisalmer-travel-from/delhi'),'delhi');
  for(const path of ['/jaisalmer-travel-from/bangalore','/jaisalmer-travel-from/noida','/packages/delhi','/jaisalmer-travel-from/delhi/private'])assert.equal(cityGuideAtPath(path),undefined);
});
test('city measurement accepts only guide identifiers, never personal geography or arbitrary URLs',()=>{
  const event={id:randomUUID(),name:'city_guide_viewed',context:{consent:true,sessionId:randomUUID(),device:'mobile',source:'search',campaign:'unassigned'},props:{cityGuideId:'delhi'}};
  assert.ok(batchSchema.safeParse({events:[event]}).success);
  for(const props of [{cityGuideId:'mumbai'},{cityGuideId:'https://example.com'},{cityGuideId:'delhi',visitorCity:'Delhi'},{cityGuideId:'delhi',url:'/private?access=secret'}])assert.equal(batchSchema.safeParse({events:[{...event,props}]}).success,false);
});
test('target reports separate guide interest from organic entry, reject late attribution, deduplicate clicks and verify money',()=>{
  const e=(name:string,session:string,at:number,props:Record<string,unknown>={}):AnalyticsEvent=>({id:randomUUID(),name,session,at,mode:'live',origin:'client',attempt:null,props});
  const events=[e('website_visit','s1',1,{source:'search',cityGuideId:'delhi'}),e('website_visit','s1',2,{source:'search',cityGuideId:'ahmedabad'}),e('city_guide_viewed','s1',3,{cityGuideId:'delhi'}),e('city_package_clicked','s1',4,{cityGuideId:'delhi'}),e('city_package_clicked','s1',5,{cityGuideId:'delhi'}),e('package_info_opened','s1',6),e('checkout_started','s1',7),e('website_visit','s2',1,{source:'direct',cityGuideId:'delhi'}),e('city_guide_viewed','s2',3,{cityGuideId:'delhi'}),e('city_package_clicked','s2',2,{cityGuideId:'delhi'}),e('website_visit','s3',20,{source:'search',cityGuideId:'delhi'}),e('website_visit','s4',1,{source:'search'})];
  const book:LedgerBooking={id:'b',draftId:'d',packageId:'city-and-dunes',date:'2026-11-03',created:10,mode:'live',status:'paid',total:100000,paid:100000,refunded:0,ledgerPaid:100000,ledgerRefunded:0,actualExpenses:null,actualGatewayFees:null,tripCompletedAt:'2026-11-03',attempt:'a',session:'s1'};
  const r=cityTargetReport(events,[book,{...book,id:'pending',paid:0,ledgerPaid:0},{...book,id:'too-early',session:'s3'},{...book,id:'no-consent',session:null},{...book,id:'not-entry',session:'s4'},{...book,id:'direct',session:'s2'}]);
  const delhi=r.city.find(c=>c.slug==='delhi')!,ahmedabad=r.city.find(c=>c.slug==='ahmedabad')!;
  assert.equal(delhi.guideSessions,2);assert.equal(delhi.guideToPackageSessions,1);assert.equal(delhi.guideToPackageRate,.5);assert.equal(delhi.organicLandingSessions,2);assert.equal(delhi.organicPackageDetailSessions,1);assert.equal(delhi.organicReservationStartSessions,1);assert.equal(delhi.verifiedReservations,1);assert.equal(delhi.fullyPaidBookings,1);assert.equal(delhi.completedTrips,1);assert.equal(delhi.netCollectedPaise,100000);assert.equal(delhi.organicLandingConversion,.5);assert.equal(ahmedabad.organicLandingSessions,0);
  const refunded=cityTargetReport(events,[{...book,status:'refunded',refunded:100000,ledgerRefunded:100000}]).city[0];assert.equal(refunded.netCollectedPaise,0);assert.equal(refunded.completedTrips,0);
  assert.equal(cityTargetReport([],[]).city[0].organicLandingConversion,null);
});
