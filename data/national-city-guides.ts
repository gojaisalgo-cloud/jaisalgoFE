import type {CityTravelSEO,TravelOption} from './city-guides';
import {findMarket} from './india-markets';
import west from './city-manuscripts/west.json';
import central from './city-manuscripts/central-north.json';
import south from './city-manuscripts/south.json';
import east from './city-manuscripts/east-himalaya.json';
import {nationalCityGuideKeys} from './national-city-guide-keys';

type CityManuscript={
  slug:string;title:string;description:string;intro:string;source:string;sourceNote:string;
  routes:[TravelOption['mode'],string,string][];planning:[string,string];budget:string;
  arrival:[string,string];group:[string,string];question:string;answer:string;related:string[];
};
const railwayContext:Record<string,{url:string;scope:string}>={
  mangaluru:{url:'https://dk.nic.in/en/public-utility-category/railway-stations/',scope:'District directory identifies Mangaluru Central and Junction as separate reporting locations. Dated services and fares still need railway enquiry.'},
  guwahati:{url:'https://www.aai.aero/en/airports/transport-details/Guwahati/Rail-Transport',scope:'Airport authority identifies Guwahati and Kamakhya as distinct rail-access points. Published road distances are not used as a journey-time guarantee.'},
};
const timing:Record<TravelOption['mode'],string>={
  Road:'Plan from the current road route, rest stops and the written vehicle agreement; no fixed driving duration is verified.',
  Rail:'Check running days, every interchange and the arrival calendar date in the dated timetable; no through service is assumed.',
  Air:'Use the complete dated airline itinerary, including airport access, baggage and layovers; no nonstop service is assumed.',
};

/** Shared booking facts stay consistent; each origin has its own planning manuscript. */
export const nationalCityGuides:CityTravelSEO[]=([...west,...central,...south,...east] as CityManuscript[]).map(manuscript=>{
  const market=findMarket(manuscript.slug);
  if(!market||!nationalCityGuideKeys.includes(manuscript.slug as typeof nationalCityGuideKeys[number]))throw new Error('Unknown manuscript '+manuscript.slug);
  const railSource=railwayContext[manuscript.slug];
  return {
    slug:manuscript.slug as typeof nationalCityGuideKeys[number],
    seoTitle:manuscript.title,seoDescription:manuscript.description,intro:manuscript.intro,
    image:['jodhpur','udaipur','bikaner','ajmer','kota'].includes(manuscript.slug)?'fort-day':'sam',
    contentReviewedAt:'2026-11-10',reviewStatus:'source-checked',published:true,indexable:true,
    travelOptions:manuscript.routes.map(([mode,title,body],index)=>({
      mode,title,body,timing:timing[mode],source:index===0?'origin':mode==='Rail'?(railSource?'origin-rail':'rail'):'tourism',
    })),
    itinerarySuggestions:[
      {title:'A focused city-and-desert stay',body:manuscript.planning[0],path:'/itineraries/3-day-jaisalmer'},
      {title:'More local time or a wider Rajasthan circuit',body:manuscript.planning[1],path:'/itineraries/4-day-jaisalmer'},
    ],
    groupAdvice:[
      {title:'Departure planning for your group',body:manuscript.group[0]},
      {title:'Comfort and the first local night',body:manuscript.group[1]},
      {title:'Compare the actual arrangement',body:'Count all travellers, including children, then compare the same room occupancy, meals and transfer choices. Ask for named accommodation and written inclusions. Shared travel, special meals and accessibility arrangements need supplier confirmation.'},
    ],
    budget:manuscript.budget,arrivalTips:manuscript.arrival,
    faqs:[
      {question:manuscript.question,answer:manuscript.answer},
      {question:`Do Jaisalmer packages include travel from ${market.city}?`,answer:'The displayed packages cover selected local Jaisalmer arrangements. Origin flights, railway tickets and intercity transfers are booked separately unless an accepted written quote explicitly includes them. Compare the complete journey budget.'},
      {question:'What does the ₹99 reservation token cover?',answer:'₹99 is credited toward the selected local package total. It is not the full holiday price or an origin transport fare. Review the package estimate, balance timing and cancellation terms; final services and availability require supplier confirmation.'},
    ],
    relevantPackageIds:['golden-city-escape','city-and-dunes','jaisalmer-unhurried'],relatedOriginSlugs:manuscript.related,
    sources:[
      {id:'origin',title:`${market.city}: official gateway and travel context`,url:manuscript.source,scope:manuscript.sourceNote},
      ...(railSource?[{id:'origin-rail',title:`${market.city}: official railway locations`,...railSource}]:[]),
      {id:'rail',title:'Indian Railways: dated train enquiry',url:'https://enquiry.indianrail.gov.in/mntes/',scope:'Use the exact boarding station, operating day and complete route. This live enquiry reference does not establish a direct service or fare.'},
      {id:'tourism',title:'Rajasthan Tourism: Jaisalmer',url:'https://www.tourism.rajasthan.gov.in/jaisalmer.html',scope:'Destination context and Rajasthan connections. Historical transport lists are not adopted as current timetables.'},
    ],
  };
});
