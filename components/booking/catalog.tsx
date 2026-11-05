'use client';
import {DirectionalIcon} from '@/components/directional-control';
import {Dropdown} from '@/components/dropdown';
import Link from 'next/link';
import {useMemo} from 'react';
import {useSearchParams} from 'next/navigation';
import {Search,Heart,Users,Tent,Compass,Sun,Info} from 'lucide-react';
import type {Tour} from '@/data/catalog';
import {TourCard} from './tour-card';
import {quote} from '@/lib/booking/pricing';
import {defaultChoices} from '@/lib/booking/preferences';
import {packageDetails} from '@/lib/booking/package-details';
const categories=[{name:'All packages',icon:Sun,value:''},{name:'Safaris & activities',icon:Compass,value:'activity'},{name:'Desert stays',icon:Tent,value:'camp'},{name:'Cultural evenings',icon:Users,value:'cultural'},{name:'For two',icon:Heart,value:'couples'}];
export function TourCatalog({tours,compact=false}:{tours:Tour[];compact?:boolean}){
 const params=useSearchParams(),search=params.get('q')||'',days=params.get('days')||'',sort=params.get('sort')||'recommended',kind=params.get('kind')||'',style=params.get('style')||'',budget=params.get('category')||'';
 const active=style==='Couples'?'couples':kind;
 function update(patch:Record<string,string>){const p=new URLSearchParams(location.search);for(const [k,v] of Object.entries(patch)){if(v)p.set(k,v);else p.delete(k)}history.replaceState(null,'',location.pathname+(p.size?'?'+p:''))}
 const list=useMemo(()=>tours.filter(t=>{
  const d=packageDetails(t);
  return (!kind||d.kind===kind)&&(!style||t.styles.some(s=>s===style))&&(!budget||t.category===budget)&&(!params.get('desert')||t.area!=='City')&&(!params.get('area')||t.area===params.get('area'))&&(!params.get('safari')||t.safari===params.get('safari'))&&(!params.get('tour')||t.tour===params.get('tour'))&&(!days||t.days===Number(days))&&[t.title,t.subtitle,t.category,t.area,d.kind,d.stayType,...d.attractions,...t.styles].join(' ').toLowerCase().includes(search.toLowerCase());
 }).sort((a,b)=>sort==='price'?quote(a.costs,a.nights,defaultChoices(a)).perPerson-quote(b.costs,b.nights,defaultChoices(b)).perPerson:sort==='duration'||sort==='duration-asc'?a.days-b.days:sort==='duration-desc'?b.days-a.days:sort==='name'?a.title.localeCompare(b.title):0),[tours,kind,search,days,sort,style,budget,params]);
 return <><div className="escape-categories marketplace-categories" role="group" aria-label="Choose a package type">{categories.map(cat=><button key={cat.value} aria-pressed={active===cat.value} onClick={()=>update({kind:cat.value==='couples'?'':cat.value,style:cat.value==='couples'?'Couples':'',desert:'',area:''})}><cat.icon size={18}/><span>{cat.name}</span></button>)}</div>{!compact&&<><div className="catalog-tools marketplace-tools"><label className="catalog-search"><Search size={18}/><input aria-label="Search packages" placeholder="Try camel, Khuri or a city escape…" value={search} onChange={e=>update({q:e.target.value})}/></label><label><Dropdown aria-label="Package duration" value={days} onValueChange={value=>update({days:value})}><option value="">Any duration</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n===1?'Day trips & short activities':`${n-1} ${n===2?'night':'nights'} / ${n} days`}</option>)}</Dropdown></label><label><Dropdown aria-label="Package budget" value={budget} onValueChange={value=>update({category:value})}><option value="">Every budget</option><option>Budget</option><option>Comfort</option><option>Premium</option></Dropdown></label><label><Dropdown aria-label="Sort packages" value={sort} onValueChange={value=>update({sort:value})}><option value="recommended">Recommended</option><option value="price">Per-person estimate: low first</option><option value="duration">Shortest first</option></Dropdown></label></div><div className="marketplace-results"><span aria-live="polite">{list.length} {list.length===1?'experience':'experiences'}</span><p>Tap <strong><Info size={14} aria-hidden="true"/>Details</strong> for stays, venues, inclusions and the full estimate.</p>{params.size>0&&<button type="button" onClick={()=>history.replaceState(null,'',location.pathname)}>Clear filters</button>}</div></>}
 <div className="tour-grid">{(compact?list.slice(0,3):list).map(t=><TourCard key={t.slug} tour={t}/>)}</div>{compact&&list.length>3&&<div className="catalog-continue"><span>Showing 3 of {list.length} matching escapes</span><Link className="underlink" href={"/packages"+(params.size?"?"+params.toString():"")}>Explore all {list.length} <DirectionalIcon direction="right"/></Link></div>}{!list.length&&<div className="empty"><h3>A different path, perhaps?</h3><p>Try fewer filters to find your escape.</p><button className="button" onClick={()=>history.replaceState(null,'',location.pathname)}>Reset filters</button></div>}</>;
}
