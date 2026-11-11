import Link from 'next/link';
import type {CityTravelSEO} from '@/data/city-guides';
import {indiaMarkets} from '@/data/india-markets';
import {cityDirectoryPath,cityPath} from '@/lib/city-travel';
import {DirectionalIcon} from '@/components/directional-control';

const unionTerritories=new Set(['Delhi','Chandigarh','Jammu and Kashmir','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Ladakh','Lakshadweep','Puducherry']);
const regionAnchor=(group:string)=>'origin-region-'+group.toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'');

export function CityDiscovery({guides,compact=false}:{guides:CityTravelSEO[];compact?:boolean}){
  if(!guides.length)return null;
  const states=[...new Set(indiaMarkets.map(m=>m.state))].filter(s=>!unionTerritories.has(s)).sort();
  const groups=[...states,...[...unionTerritories].filter(s=>indiaMarkets.some(m=>m.state===s))];
  return <section className={`city-discovery ${compact?'city-discovery-compact':''}`} aria-labelledby="city-discovery-title">
    <div className="city-discovery-heading"><div><div className="overline">FROM YOUR CITY TO THE GOLDEN CITY</div><h2 id="city-discovery-title">Your journey starts a little closer to home.</h2><p>{!compact&&`${guides.length} city guides, with source notes and practical arrival advice. `}Explore origins across all 28 states and the union territories. Cities without a published guide open custom trip planning. Travel to Jaisalmer is booked separately.</p></div>{compact&&<Link className="underlink" href={cityDirectoryPath}>All city guides <DirectionalIcon direction="right"/></Link>}</div>
    {!compact&&<nav className="city-region-nav" aria-label="Find guides by region">{groups.map(group=><a key={group} href={'#'+regionAnchor(group)}>{group}</a>)}</nav>}
    <div className="city-region-grid">{groups.map(group=><section key={group} id={!compact?regionAnchor(group):undefined}><h3>{group}{unionTerritories.has(group)&&<small> · Union territory</small>}</h3><ul>{indiaMarkets.filter(m=>m.state===group).slice(0,5).map(market=>{const guide=guides.find(g=>g.slug===market.slug);return <li key={market.slug}><Link href={guide?cityPath(guide.slug):`/plan-your-trip?origin=${encodeURIComponent(market.city+', '+market.state)}`}><span>{market.city}{!compact&&<small>{guide?'Travel guide & local packages':'Plan a custom Jaisalmer trip'}</small>}</span><DirectionalIcon direction="up-right"/></Link></li>})}</ul></section>)}</div>
  </section>;
}
