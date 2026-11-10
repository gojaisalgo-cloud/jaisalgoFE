import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedTours} from '../data/catalog';
import {catalogRecords,discoveryFilters,filterDiscovery,facetCount,patchDiscovery,clearDiscovery,type CatalogRecord} from '../lib/booking/catalog-discovery';
import {packageDetails} from '../lib/booking/package-details';
import {defaultChoices,bookingHref,choicesFromParams} from '../lib/booking/preferences';
import {quote} from '../lib/booking/pricing';

const tours=seedTours(),records=catalogRecords(tours),filters=(query='')=>discoveryFilters(new URLSearchParams(query));
test('discovery retains legacy links and combines OR facets with AND constraints without changing inventory',()=>{
 const before=records.map(r=>r.tour.slug),f=filters('days=3&category=Comfort%7CPremium&style=Couples%7CFamilies&area=Both&tour=Private');
 const found=filterDiscovery(records,f);assert.ok(found.length);
 assert.ok(found.every(r=>r.tour.days===3&&['Comfort','Premium'].includes(r.tour.category)&&r.tour.styles.some(s=>['Couples','Families'].includes(s))&&r.tour.area==='Both'&&r.tour.tour==='Private'));
 assert.deepEqual(records.map(r=>r.tour.slug),before);
 assert.ok(filterDiscovery(records,filters('desert=1&safari=Camel')).every(r=>r.tour.area!=='City'&&r.tour.safari==='Camel'));
});
test('facet counts ignore their own selection but respect every other filter',()=>{
 const f=filters('category=Budget&kind=tour&style=Couples');
 const expected=records.filter(r=>r.kind==='tour'&&r.tour.styles.includes('Couples')&&r.tour.category==='Premium').length;
 assert.ok(expected>0);assert.equal(facetCount(records,f,'category','Premium'),expected);
 assert.equal(filterDiscovery(records,{...f,category:['Premium']}).length,expected);
 assert.equal(facetCount(records,filters('q=nonexistentjourney'),'category','Premium'),0);
});
test('budget presets do not double-count boundaries and custom ranges include both endpoints',()=>{
 const base=records[0],priced:CatalogRecord[]=[4999,5000,9999,10000,19999,20000].map((rupees,i)=>({...base,tour:{...base.tour,slug:String(i)},perPerson:rupees*100}));
 assert.deepEqual(filterDiscovery(priced,filters('priceBand=under-5000')).map(r=>r.perPerson/100),[4999]);
 assert.deepEqual(filterDiscovery(priced,filters('priceBand=5000-10000%7C10000-20000')).map(r=>r.perPerson/100),[5000,9999,10000,19999]);
 assert.deepEqual(filterDiscovery(priced,filters('minPrice=5000&maxPrice=10000')).map(r=>r.perPerson/100),[5000,9999,10000]);
 assert.equal(filterDiscovery(priced,filters('minPrice=20000&maxPrice=10000')).length,0);
});
test('night and price boundaries, invalid numeric input and zero matches are safe',()=>{
 assert.ok(filterDiscovery(records,filters('minNights=0&maxNights=0')).every(r=>r.tour.nights===0));
 assert.equal(filterDiscovery(records,filters('q=nonexistentjourney')).length,0);
 assert.equal(filterDiscovery(records,filters('maxPrice=0')).length,0);
 assert.equal(filterDiscovery(records,filters('minPrice=NaN&minNights=-1&maxNights=Infinity')).length,records.length);
 const sorted=filterDiscovery(records,filters('sort=price'));assert.ok(sorted.every((r,i)=>!i||r.perPerson>=sorted[i-1].perPerson));
 assert.equal(new Set(filterDiscovery(records,filters('category=Budget%7CComfort%7CPremium')).map(r=>r.tour.slug)).size,records.length);
});
test('prices use the existing calculator across person, tent and vehicle units; unspecified stays remain unknown',()=>{
 for(const r of records){const t=r.tour,d=packageDetails(t),c=defaultChoices(t),q=quote(t.costs,t.nights,c,d.extras);assert.equal(r.total,q.total);assert.equal(r.perPerson,q.perPerson);if(t.nights&&!d.stayTypeSpecified)assert.equal(r.stayType,'not-specified')}
 const vehicle=records.find(r=>packageDetails(r.tour).chargeUnit==='vehicle')!;assert.equal(vehicle.travelers,4);assert.notEqual(vehicle.total,vehicle.perPerson);
 const tent=records.find(r=>packageDetails(r.tour).chargeUnit==='tent')!;assert.equal(tent.total,quote(tent.tour.costs,tent.tour.nights,defaultChoices(tent.tour)).total);
});
test('filter patches and resets preserve attribution and unrelated booking choices',()=>{
 const original=new URLSearchParams('utm_source=reference&travelers=3&date=2026-12-01&kind=camp&category=Premium&sort=price');
 const next=patchDiscovery(original,{place:'Sam / Khuri dunes|Khuri dunes & village',kind:''});
 assert.equal(next.get('utm_source'),'reference');assert.equal(next.get('travelers'),'3');assert.equal(original.get('kind'),'camp');
 const cleared=clearDiscovery(next);assert.equal(cleared.toString(),'utm_source=reference&travelers=3&date=2026-12-01');
});
test('compared group, room, transfer and add-on choices round-trip into checkout without repricing drift',()=>{
 const t=tours.find(t=>t.slug==='golden-city-escape')!,c={...defaultChoices(t),travelers:5,rooming:'single' as const,transport:false,jeep:true,guide:true};
 const href=bookingHref(t,c,'2026-12-01'),url=new URL(href,'http://localhost'),restored=choicesFromParams(t,Object.fromEntries(url.searchParams));
 assert.equal(url.pathname,'/book/golden-city-escape');assert.equal(url.searchParams.get('date'),'2026-12-01');
 assert.equal(restored.travelers,5);assert.equal(restored.rooming,'single');assert.equal(restored.transport,false);
 assert.equal(quote(t.costs,t.nights,restored).total,quote(t.costs,t.nights,c).total);
});
