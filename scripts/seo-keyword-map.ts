/** Refresh the editorial intent inventory; does not publish or alter any route. */
import {writeFileSync} from 'node:fs';
import {collections} from '../data/editorial';
import {searchPages,editorialTitle,editorialDescription} from '../data/search-pages';
import {seedTours} from '../data/catalog';
import {packageCollections} from '../data/package-collections';
import {cityGuides} from '../data/city-guides';
import {publishedCityGuides} from '../lib/city-travel';
import {tourSearchTitles,searchDescription} from '../data/seo-titles';
import {packageDescription} from '../lib/seo';
import {seoAliases} from '../data/seo-aliases';
const primary:Record<string,string>={
 '/':'Jaisalmer tourism','/packages':'Jaisalmer tour packages','/places':'places to visit in Jaisalmer','/experiences':'things to do in Jaisalmer','/itineraries':'Jaisalmer itinerary ideas','/travel-guide':'Jaisalmer travel guide topics','/jaisalmer-travel-from':'travel to Jaisalmer from Indian cities','/plan-your-trip':'custom Jaisalmer trip planning','/contact':'JaisalGo booking assistance','/about':'about JaisalGo','/photo-credits':'JaisalGo photography credits',
 '/travel-guide/first-time-jaisalmer':'first time Jaisalmer trip planning','/travel-guide/budget-planning':'Jaisalmer trip cost','/travel-guide/best-time-to-visit':'best time to visit Jaisalmer','/travel-guide/how-to-reach':'how to reach Jaisalmer','/travel-guide/international-visitors':'Jaisalmer India travel guide for international tourists','/travel-guide/local-transport':'getting around Jaisalmer','/travel-guide/sam-versus-khuri':'Sam vs Khuri sand dunes','/travel-guide/camel-or-jeep':'camel vs jeep safari in Jaisalmer','/travel-guide/desert-camp-checklist':'Jaisalmer desert camp booking checklist','/travel-guide/responsible-thar-travel':'responsible Jaisalmer travel','/travel-guide/packing-and-accessibility':'Jaisalmer packing and accessibility planning',
 '/experiences/desert-safari':'Jaisalmer desert safari options','/experiences/camel-safari':'Jaisalmer camel safari planning','/experiences/jeep-safari':'Jaisalmer jeep safari planning','/experiences/overnight-desert':'Jaisalmer desert camping guide','/experiences/desert-evening':'Jaisalmer sunset desert evening','/experiences/heritage-walk':'Jaisalmer heritage walking guide','/experiences/lake-photography':'Gadisar Lake photography','/experiences/food-and-craft':'Jaisalmer food and craft','/experiences/folk-culture':'Jaisalmer folk music and culture',
 '/places/jaisalmer-fort':'Jaisalmer Fort visiting guide','/places/gadisar-lake':'Gadisar Lake visiting guide','/places/sam-sand-dunes':'Sam Sand Dunes visiting guide','/places/khuri':'Khuri Sand Dunes visiting guide','/places/desert-national-park':'Desert National Park visiting guide',
};
const rows:{path:string;primary:string;intent:string;title:string;description:string}[]=[];
for(const [path,p] of Object.entries(searchPages))if(!p.noindex)rows.push({path,primary:primary[path]||p.title,intent:path==='/packages'?'Commercial comparison':path==='/plan-your-trip'?'Custom planning':'Destination / navigation',...p});
for(const [collection,entries] of Object.entries(collections))for(const item of entries){const path=`/${collection}/${item.slug}`;rows.push({path,primary:primary[path]||(collection==='itineraries'?`Jaisalmer ${item.slug.split('-')[0]} day itinerary`:`${item.title} Jaisalmer visiting guide`),intent:'Informational guide',title:editorialTitle(collection,item),description:editorialDescription(collection,item)})}
for(const c of packageCollections)rows.push({path:'/packages/'+c.slug,primary:c.intent,intent:'Commercial comparison',title:c.title,description:c.description});
for(const t of seedTours().filter(t=>t.published))rows.push({path:'/packages/'+t.slug,primary:t.title+' package details',intent:'Specific local product / booking',title:tourSearchTitles[t.slug]||t.title,description:packageDescription(t)});
for(const g of publishedCityGuides(seedTours()))rows.push({path:'/jaisalmer-travel-from/'+g.slug,primary:`Jaisalmer trip from ${g.slug[0].toUpperCase()+g.slug.slice(1)}`,intent:'Origin travel planning; transport separate',title:`Jaisalmer from ${g.slug[0].toUpperCase()+g.slug.slice(1)}: Travel & Packages`,description:g.seoDescription});
// Keep the publication gate authoritative rather than including research backlog cities.
if(!cityGuides.length||new Set(rows.map(r=>r.path)).size!==rows.length)throw new Error('Invalid canonical inventory');
const cell=(s:string)=>'"'+s.replaceAll('"','""')+'"';
const csv=[['Canonical URL','Primary search intent / keyword','Intent class','SEO title before brand suffix','Meta description'],...rows.sort((a,b)=>a.path.localeCompare(b.path)).map(r=>['https://www.jaisalgo.com'+(r.path==='/'?'/':r.path),r.primary,r.intent,r.title,searchDescription(r.description)])].map(r=>r.map(cell).join(',')).join('\n')+'\n';
writeFileSync('docs/SEO-PAGE-MAP.csv',csv);
writeFileSync('docs/SEO-REDIRECTS.csv',[['Alias path','Canonical path','HTTP status'],...Object.entries(seoAliases).map(([a,b])=>[a,b,'301'])].map(r=>r.map(cell).join(',')).join('\n')+'\n');
console.log(`Mapped ${rows.length} canonical pages and ${Object.keys(seoAliases).length} redirects.`);
