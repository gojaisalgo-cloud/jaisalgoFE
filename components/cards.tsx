import {DirectionalIcon} from '@/components/directional-control';
import {seedTours} from '@/data/catalog';
import {TourCard} from '@/components/booking/tour-card';
import Link from 'next/link';

import {Photo} from './photo';
import type {Package,EditorialEntry} from '@/types';
export function PackageCard({item}:{item:Package}){const tour=seedTours().find(t=>t.slug===item.slug);return tour?<TourCard tour={tour}/>:null}
export function EditorialCard({item,collection}:{item:EditorialEntry;collection:string}){return <article className="editorial-card"><Link href={`/${collection}/${item.slug}`}><Photo id={item.image} sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw"/><div className="overline">{item.eyebrow}</div><h3>{item.title} <DirectionalIcon direction="up-right"/></h3><p>{item.description}</p><small>{item.location} · {item.duration}</small></Link></article>}
