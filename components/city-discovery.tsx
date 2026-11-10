import Link from 'next/link';
import type {CityTravelSEO} from '@/data/city-guides';
import {findMarket} from '@/data/india-markets';
import {cityDirectoryPath,cityPath} from '@/lib/city-travel';
import {DirectionalIcon} from '@/components/directional-control';

// Keep homepage discovery concise; the directory contains every published guide.
const featuredOrigins=new Set(['delhi','ahmedabad','surat','vadodara','jaipur','bengaluru','mumbai','hyderabad','chennai','kolkata','pune','jodhpur','indore','kochi','chandigarh','guwahati']);
const regionAnchor=(group:string)=>'origin-region-'+group.toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'');

export function CityDiscovery({guides,compact=false}:{guides:CityTravelSEO[];compact?:boolean}){
  if(!guides.length)return null;
  const visible=compact?guides.filter(guide=>featuredOrigins.has(guide.slug)):guides;
  const groups=[...new Set(visible.map(guide=>findMarket(guide.slug)!.group))];
  return <section className={`city-discovery ${compact?'city-discovery-compact':''}`} aria-labelledby="city-discovery-title">
    <div className="city-discovery-heading"><div><div className="overline">FROM YOUR CITY TO THE GOLDEN CITY</div><h2 id="city-discovery-title">Your journey starts a little closer to home.</h2><p>{!compact&&`${guides.length} city guides, with source notes and practical arrival advice. `}Plan how to get here, then choose your local escape. Travel to Jaisalmer is booked separately.</p></div>{compact&&<Link className="underlink" href={cityDirectoryPath}>All city guides <DirectionalIcon direction="right"/></Link>}</div>
    {!compact&&<nav className="city-region-nav" aria-label="Find guides by region">{groups.map(group=><a key={group} href={'#'+regionAnchor(group)}>{group}</a>)}</nav>}
    <div className="city-region-grid">{groups.map(group=><section key={group} id={!compact?regionAnchor(group):undefined}><h3>{group}</h3><ul>{visible.filter(guide=>findMarket(guide.slug)!.group===group).map(guide=>{const market=findMarket(guide.slug)!;return <li key={guide.slug}><Link href={cityPath(guide.slug)}><span>{market.city}{!compact&&<small>{market.aliases.length?`Also covers ${market.aliases.join(' / ')}`:'Travel planning & local packages'}</small>}</span><DirectionalIcon direction="up-right"/></Link></li>})}</ul></section>)}</div>
  </section>;
}
