import Link from 'next/link';
import type {CityTravelSEO} from '@/data/city-guides';
import {findMarket} from '@/data/india-markets';
import {cityDirectoryPath,cityPath} from '@/lib/city-travel';
import {DirectionalIcon} from '@/components/directional-control';

export function CityDiscovery({guides,compact=false}:{guides:CityTravelSEO[];compact?:boolean}){
  if(!guides.length)return null;
  const groups=[...new Set(guides.map(g=>findMarket(g.slug)!.group))];
  return <section className={`city-discovery ${compact?'city-discovery-compact':''}`} aria-labelledby="city-discovery-title">
    <div className="city-discovery-heading"><div><div className="overline">FROM YOUR CITY TO THE GOLDEN CITY</div><h2 id="city-discovery-title">Your journey starts a little closer to home.</h2><p>Plan how to get here, then choose your local escape. Travel to Jaisalmer is booked separately.</p></div>{compact&&<Link className="underlink" href={cityDirectoryPath}>All city guides <DirectionalIcon direction="right"/></Link>}</div>
    <div className="city-region-grid">{groups.map(group=><section key={group}><h3>{group}</h3><ul>{guides.filter(g=>findMarket(g.slug)!.group===group).map(guide=>{const market=findMarket(guide.slug)!;return <li key={guide.slug}><Link href={cityPath(guide.slug)}><span>{market.city}{!compact&&<small>{guide.slug==='bengaluru'?'Also known as Bangalore':guide.slug==='vadodara'?'Also known as Baroda':guide.slug==='delhi'?'Includes NCR connection advice':'Travel planning & local packages'}</small>}</span><DirectionalIcon direction="up-right"/></Link></li>})}</ul></section>)}</div>
  </section>;
}
