import {packageCollections} from '@/data/package-collections';
import type {MetadataRoute} from 'next';
import {tours} from '@/lib/booking/db';
import {collections} from '@/data/editorial';
import {config} from '@/lib/config';
import {publicStaticPaths} from '@/data/search-pages';
import {canonicalUrl} from '@/lib/site-url';
import {imageAsset} from '@/data/images';
import {publishedCityGuides,cityPath} from '@/lib/city-travel';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const packages=await tours();
  return [
    ...packageCollections.map(c=>({url:canonicalUrl('/packages/'+c.slug,config.url),lastModified:'2026-11-10',images:[canonicalUrl(imageAsset(c.image).src,config.url)]})),
    ...publicStaticPaths.map(path=>({url:canonicalUrl(path,config.url)})),
    ...publishedCityGuides(packages).map(g=>({url:canonicalUrl(cityPath(g.slug),config.url),lastModified:g.contentReviewedAt,images:[canonicalUrl(imageAsset(g.image).src,config.url)]})),
    ...packages.filter(p=>p.published).map(p=>({url:canonicalUrl('/packages/'+p.slug,config.url),...(p.contentModifiedAt?{lastModified:p.contentModifiedAt}:{}),images:[canonicalUrl(imageAsset(p.image).src,config.url)]})),
    ...Object.entries(collections).flatMap(([name,items])=>items.map(item=>({url:canonicalUrl(`/${name}/${item.slug}`,config.url),lastModified:item.updated,images:[canonicalUrl(imageAsset(item.image).src,config.url)]}))),
  ];
}
