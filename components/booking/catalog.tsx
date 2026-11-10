'use client';
import {DirectionalIcon,IconButton} from '@/components/directional-control';
import {Dropdown} from '@/components/dropdown';
import {Modal} from '@/components/ui/modal';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Search,Heart,Users,Tent,Compass,Sun,Info,SlidersHorizontal,X,ArrowLeft,ArrowRight,Map} from 'lucide-react';
import type {Tour} from '@/data/catalog';
import {stayName} from '@/data/travel-options';
import {catalogRecords,discoveryFilters,filterDiscovery,clearDiscovery,patchDiscovery,priceBands} from '@/lib/booking/catalog-discovery';
import {CatalogFilters} from './catalog-filters';
import {TourCard} from './tour-card';

const categories=[{name:'All packages',icon:Sun,value:''},{name:'City & desert tours',icon:Map,value:'tour'},{name:'Safaris & activities',icon:Compass,value:'activity'},{name:'Desert stays',icon:Tent,value:'camp'},{name:'Cultural evenings',icon:Users,value:'cultural'},{name:'For two',icon:Heart,value:'couples'}];
export function TourCatalog({tours,compact=false}:{tours:Tour[];compact?:boolean}){
 const params=useSearchParams(),[filtersOpen,setFiltersOpen]=useState(false),strip=useRef<HTMLDivElement>(null),[scroll,setScroll]=useState({previous:false,next:false});
 const query=new URLSearchParams(params.toString()),records=catalogRecords(tours),f=discoveryFilters(query),list=filterDiscovery(records,f);
 const active=f.style.includes('Couples')?'couples':f.kind;
 function navigate(next:URLSearchParams,replace=false){const url=location.pathname+(next.size?'?'+next:'')+location.hash;if(replace)history.replaceState(null,'',url);else history.pushState(null,'',url)}
 function update(patch:Record<string,string>,replace=false){navigate(patchDiscovery(new URLSearchParams(location.search),patch),replace)}
 function clear(){navigate(clearDiscovery(new URLSearchParams(location.search)))}
 useEffect(()=>{const el=strip.current;if(!el)return;const measure=()=>setScroll({previous:el.scrollLeft>2,next:el.scrollLeft+el.clientWidth<el.scrollWidth-2});const observer=new ResizeObserver(measure);observer.observe(el);el.addEventListener('scroll',measure,{passive:true});measure();return()=>{observer.disconnect();el.removeEventListener('scroll',measure)}},[]);
 const categoryBase={...f,kind:'',style:f.style.filter(s=>s!=='Couples')};
 const countCategory=(value:string)=>filterDiscovery(records,{...categoryBase,kind:value==='couples'?'':value,style:value==='couples'?['Couples']:categoryBase.style}).length;
 const chips:{label:string;patch:Record<string,string>}[]=[];
 if(f.q)chips.push({label:`Search: ${query.get('q')}`,patch:{q:''}});
 if(f.kind)chips.push({label:categories.find(c=>c.value===f.kind)?.name||f.kind,patch:{kind:''}});
 for(const key of ['category','style','place','stayType','transfer','tour','priceBand'] as const)for(const value of f[key]){
  const label=key==='stayType'?(value==='not-specified'?'Stay not specified':stayName(value)):key==='transfer'?(value==='allowance'?'Transfer allowance':'Own arrival'):key==='priceBand'?priceBands.find(b=>b.value===value)?.label||value:value;
  chips.push({label,patch:{[key]:f[key].filter(v=>v!==value).join('|')}});
 }
 for(const key of ['days','area','safari','desert'] as const)if(query.get(key))chips.push({label:key==='days'?`${query.get(key)} days`:key==='desert'?'Desert routes':`${key}: ${query.get(key)}`,patch:{[key]:''}});
 if(f.minNights!==undefined||f.maxNights!==undefined)chips.push({label:`Nights: ${f.minNights??0}–${f.maxNights??'any'}`,patch:{minNights:'',maxNights:''}});
 if(f.minPrice!==undefined||f.maxPrice!==undefined)chips.push({label:`Estimate: ₹${f.minPrice??0}–${f.maxPrice??'any'}`,patch:{minPrice:'',maxPrice:''}});
 const filterProps={records,filters:f,update,clear};
 const categoryStrip=<div className="discovery-collections"><IconButton className="collection-scroll" aria-label="Previous package categories" disabled={!scroll.previous} onClick={()=>strip.current?.scrollBy({left:-Math.max(180,strip.current.clientWidth*.7),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><ArrowLeft aria-hidden="true"/></IconButton><div ref={strip} className="escape-categories marketplace-categories" role="group" aria-label="Choose a package type">{categories.map(cat=>{const count=countCategory(cat.value);return <button type="button" key={cat.value} aria-pressed={active===cat.value} disabled={!count&&active!==cat.value} onClick={()=>update({kind:cat.value==='couples'?'':cat.value,style:cat.value==='couples'?'Couples':f.style.filter(s=>s!=='Couples').join('|'),desert:'',area:''})}><cat.icon size={18} aria-hidden="true"/><span>{cat.name}</span><small>{count}</small></button>})}</div><IconButton className="collection-scroll" aria-label="Next package categories" disabled={!scroll.next} onClick={()=>strip.current?.scrollBy({left:Math.max(180,strip.current.clientWidth*.7),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><ArrowRight aria-hidden="true"/></IconButton></div>;
 if(compact)return <>{categoryStrip}<div className="tour-grid">{list.slice(0,3).map(r=><TourCard key={r.tour.slug} tour={r.tour} selection={Object.fromEntries(query)}/>)}</div>{list.length>3&&<div className="catalog-continue"><span>Showing 3 of {list.length} matching escapes</span><Link className="underlink" href={'/packages'+(query.size?'?'+query:'')}>Explore all {list.length}<DirectionalIcon direction="right"/></Link></div>}{!list.length&&<div className="empty"><h3>A different path, perhaps?</h3><p>Try fewer filters to find your escape.</p><button className="button" onClick={clear}>Reset filters</button></div>}</>;
 return <section className="discovery-catalog" aria-label="Find your Jaisalmer package">
  {categoryStrip}
  <div className="discovery-toolbar"><label className="discovery-search"><Search size={19} aria-hidden="true"/><input aria-label="Search packages" placeholder="Try camel, Khuri or a city escape…" value={query.get('q')||''} onChange={e=>update({q:e.target.value},true)}/>{query.get('q')&&<IconButton aria-label="Clear package search" onClick={()=>update({q:''})}><X aria-hidden="true"/></IconButton>}</label><button className="button secondary discovery-mobile-filter" type="button" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={18} aria-hidden="true"/>Filters{chips.length>0&&<small>{chips.length}</small>}</button><label className="discovery-sort"><span>Sort by</span><Dropdown aria-label="Sort packages" value={f.sort} onValueChange={value=>update({sort:value})}><option value="recommended">Recommended</option><option value="price">Per-person estimate: low first</option><option value="price-desc">Per-person estimate: high first</option><option value="duration">Shortest first</option><option value="duration-desc">Longest first</option><option value="name">Package name</option></Dropdown></label></div>
  <div className="discovery-layout"><aside className="discovery-sidebar" aria-label="Package filters"><CatalogFilters {...filterProps}/></aside><div className="discovery-results">
   <div className="discovery-result-heading"><strong role="status">{list.length} {list.length===1?'package':'packages'} found</strong><span><Info size={15} aria-hidden="true"/>Details in one tap. Your choices, before payment.</span></div>
   {!!chips.length&&<div className="discovery-active-filters" aria-label="Active package filters">{chips.map((chip,i)=><button key={chip.label+i} type="button" aria-label={`Remove filter: ${chip.label}`} onClick={()=>update(chip.patch)}>{chip.label}<X size={14} aria-hidden="true"/></button>)}<button type="button" className="discovery-clear" onClick={clear}>Clear all</button></div>}
   <div className="tour-grid">{list.map(r=><TourCard key={r.tour.slug} tour={r.tour} selection={Object.fromEntries(query)}/>)}</div>
   {!list.length&&<div className="empty"><Search size={25} aria-hidden="true"/><h3>No packages match those choices.</h3><p>Remove a filter or reset to see every escape. Your booking details are unaffected.</p><button type="button" className="button" onClick={clear}>Reset filters</button><Link href="/plan-your-trip" className="text-button">Plan a custom trip<DirectionalIcon direction="right"/></Link></div>}
  </div></div>
  {filtersOpen&&<Modal title="Package filters" onClose={()=>setFiltersOpen(false)} className="discovery-filter-modal" footer={<button type="button" className="button" onClick={()=>setFiltersOpen(false)}>Show {list.length} {list.length===1?'package':'packages'}<DirectionalIcon direction="right"/></button>}><p className="discovery-filter-note">Results update as you choose. Selections stay when you close this panel.</p><CatalogFilters {...filterProps}/></Modal>}
 </section>;
}
