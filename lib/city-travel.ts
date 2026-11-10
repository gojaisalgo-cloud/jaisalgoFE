import {destinationId} from './geo';
import type {Tour} from '@/data/catalog';
import {cityGuides,type CityTravelSEO} from '@/data/city-guides';
import {findMarket} from '@/data/india-markets';
import {cityGuideKeys} from '@/data/city-guide-keys';
import {articleSchema} from '@/lib/seo';

export const cityDirectoryPath='/jaisalmer-travel-from';
export const cityPath=(slug:string)=>`${cityDirectoryPath}/${slug}`;
export function cityPublicationIssues(guide:CityTravelSEO,packages:Pick<Tour,'slug'|'published'>[]):string[] {
  const issues:string[]=[];
  if(!guide.published||!guide.indexable)issues.push('Not approved for publication');
  if(guide.reviewStatus!=='source-checked'||!/^\d{4}-\d{2}-\d{2}$/.test(guide.contentReviewedAt)||!Number.isFinite(Date.parse(guide.contentReviewedAt))||new Date(guide.contentReviewedAt).toISOString().slice(0,10)!==guide.contentReviewedAt)issues.push('Source review required');
  if(!findMarket(guide.slug)||!cityGuideKeys.includes(guide.slug))issues.push('Unknown city guide');
  if(guide.intro.length<180||guide.seoTitle.length<25||guide.seoDescription.length<80||guide.budget.length<180||guide.arrivalTips.length<2||guide.groupAdvice.length<3)issues.push('Incomplete planning advice');
  const sourceIds=new Set(guide.sources.filter(s=>s.id&&s.title&&s.scope.length>30&&/^https:\/\//.test(s.url)).map(s=>s.id));
  if(sourceIds.size<2||guide.travelOptions.length<2||guide.travelOptions.some(o=>!sourceIds.has(o.source)||o.body.length<150||o.timing.length<40))issues.push('Incomplete transport research');
  if(guide.itinerarySuggestions.length<2||guide.itinerarySuggestions.some(i=>i.body.length<100)||guide.faqs.length<3||guide.faqs.some(f=>f.answer.length<70))issues.push('Incomplete itinerary or FAQs');
  if(!guide.relevantPackageIds.some(id=>packages.some(p=>p.slug===id&&p.published)))issues.push('No published local experience');
  return issues;
}
/** One gate feeds routes, directory, sitemap and canonical alias resolution. */
export function publishedCityGuides(packages:Pick<Tour,'slug'|'published'>[]) {
  return cityGuides.filter(guide=>cityPublicationIssues(guide,packages).length===0);
}
export function resolveCityGuide(slug:string,packages:Pick<Tour,'slug'|'published'>[]) {
  const market=findMarket(slug);
  return market?publishedCityGuides(packages).find(g=>g.slug===market.slug):undefined;
}
/** Contextual connections may only point to published canonical guides. */
export function relatedCityGuides(guide:CityTravelSEO,packages:Pick<Tour,'slug'|'published'>[]){
  const approved=publishedCityGuides(packages),market=findMarket(guide.slug)!;
  const preferred=guide.relatedOriginSlugs||approved.filter(g=>findMarket(g.slug)!.group===market.group).map(g=>g.slug);
  return [...new Set(preferred)].filter(slug=>slug!==guide.slug).flatMap(slug=>approved.find(g=>g.slug===slug)||[]).slice(0,4);
}
export function cityArticleSchema(guide:CityTravelSEO){
  const data=articleSchema({slug:guide.slug,title:guide.seoTitle,description:guide.seoDescription,image:guide.image,updated:guide.contentReviewedAt,source:guide.sources[0].url,eyebrow:'Origin travel planning',location:findMarket(guide.slug)!.city,duration:'Planning guide',sections:[]},cityPath(guide.slug),`Jaisalmer, from ${findMarket(guide.slug)!.city}.`);
  return {...data,citation:guide.sources.map(source=>source.url),about:{'@id':destinationId()},mentions:{'@type':'City',name:findMarket(guide.slug)!.city,containedInPlace:{'@type':'AdministrativeArea',name:findMarket(guide.slug)!.state,containedInPlace:{'@type':'Country',name:'India'}}},spatialCoverage:{'@type':'Place',name:'Jaisalmer, Rajasthan, India'}};
}
