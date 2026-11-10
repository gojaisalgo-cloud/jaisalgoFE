import {tourSearchTitles,searchDescription} from '@/data/seo-titles';
import type {Metadata} from 'next';
import type {Tour} from '@/data/catalog';
import type {EditorialEntry} from '@/types';
import {config} from '@/lib/config';
import {imageAsset} from '@/data/images';
import {canonicalUrl} from '@/lib/site-url';
import {durationLabel,packageDetails} from '@/lib/booking/package-details';

export const searchIndexable = () => !['preview','development'].includes(process.env.VERCEL_ENV || '');
export const privateRobots = {index:false,follow:false,noarchive:true,nosnippet:true,noimageindex:true} as const;
export type Query = Record<string,string|string[]|undefined>;
const selectionParams = new Set(['q','days','sort','kind','style','category','desert','area','safari','tour','date','travelers','travellers','children','stay','rooming','travelMode','stayType','transport','jeep','guide','addons','section','minNights','maxNights','minPrice','maxPrice','priceBand','place','transfer','page','occasion','dorm']);
export function hasSelection(query:Query):boolean {
  return Object.keys(query).some(key => selectionParams.has(key) && query[key] !== undefined && query[key] !== '');
}

export function pageMetadata({title,description,path,image='fort',noindex=false,article}:{title:string;description:string;path:string;image?:string;noindex?:boolean;article?:Pick<EditorialEntry,'updated'>}):Metadata {
  description=searchDescription(description);
  const url=canonicalUrl(path,config.url),asset=imageAsset(image),fullTitle=`${title} | ${config.name}`;
  const preview={url:canonicalUrl(asset.src,config.url),alt:asset.alt};
  return {
    title,description,alternates:{canonical:url,languages:{'en-IN':url,'x-default':url}},
    robots:{index:searchIndexable()&&!noindex,follow:true},
    openGraph:{type:article?'article':'website',locale:'en_IN',siteName:config.name,title:fullTitle,description,url,images:[preview],...(article?{modifiedTime:article.updated,authors:[canonicalUrl('/about',config.url)]}:{})},
    twitter:{card:'summary_large_image',title:fullTitle,description,images:[preview]},
  };
}

export function packageDescription(t:Tour):string {
 return searchDescription(`${t.title}: ${durationLabel(t)}. Review the proposed stay, meals, transport, inclusions and full group estimate. Supplier confirmation required.`);
}
export function packageMetadata(t:Tour,noindex=false):Metadata {
 const name=/jaisalmer/i.test(t.title)?t.title:`${t.title} · Jaisalmer`;
 return pageMetadata({title:tourSearchTitles[t.slug]||`${name} · ${durationLabel(t)}`,description:packageDescription(t),path:`/packages/${t.slug}`,image:t.image,noindex});
}

export function serializeJsonLd(value:unknown):string {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
}
export function breadcrumbSchema(crumbs:{name:string;path:string}[]) {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:canonicalUrl(c.path,config.url)}))};
}
export function listSchema(name:string,path:string,items:{title:string;path:string}[]) {
  return {'@context':'https://schema.org','@type':'ItemList','@id':`${canonicalUrl(path,config.url)}#list`,name,numberOfItems:items.length,itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.title,url:canonicalUrl(item.path,config.url)}))};
}
export function destinationSchema(){return {'@context':'https://schema.org','@type':'TouristDestination','@id':`${config.url}/#jaisalmer`,name:'Jaisalmer',description:'Jaisalmer in Rajasthan, India: living sandstone heritage, desert landscapes and city-and-dunes travel planning.',url:canonicalUrl('/',config.url),touristType:['Heritage travellers','Families','Couples','Desert travellers'],containedInPlace:{'@type':'AdministrativeArea',name:'Rajasthan, India'}}}
export function websiteSchema() {
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':`${config.url}/#organization`,name:config.name,url:canonicalUrl('/',config.url)},
    {'@type':'WebSite','@id':`${config.url}/#website`,name:config.name,url:canonicalUrl('/',config.url),inLanguage:'en-IN',publisher:{'@id':`${config.url}/#organization`}},
  ]};
}
export function tripSchema(t:Tour) {
  const d=packageDetails(t),url=canonicalUrl(`/packages/${t.slug}`,config.url);
  return {'@context':'https://schema.org','@type':'TouristTrip','@id':`${url}#trip`,name:t.title,url,description:packageDescription(t),image:canonicalUrl(imageAsset(t.image).src,config.url),touristType:t.styles,
    itinerary:{'@type':'ItemList',itemListOrder:'https://schema.org/ItemListOrderAscending',itemListElement:d.attractions.map((name,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Place',name}}))},
    subTrip:t.itinerary.map(day=>({'@type':'Trip',name:day.title,description:day.body})),
  };
}
export function articleSchema(item:EditorialEntry,path:string,headline=item.title) {
  const url=canonicalUrl(path,config.url);
  return {'@context':'https://schema.org','@type':'Article','@id':`${url}#article`,headline,description:item.description,url,mainEntityOfPage:{'@type':'WebPage','@id':url},image:canonicalUrl(imageAsset(item.image).src,config.url),inLanguage:'en-IN',dateModified:item.updated,
    author:{'@type':'Organization',name:config.name,url:canonicalUrl('/about',config.url)},publisher:{'@type':'Organization','@id':`${config.url}/#organization`,name:config.name,url:canonicalUrl('/',config.url)},citation:item.source,
  };
}
