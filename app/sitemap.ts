import type {MetadataRoute} from 'next';
import {tours} from '@/lib/booking/db';
import {collections} from '@/data/editorial';
import {config} from '@/lib/config';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const packages=await tours();const paths=['','packages','experiences','places','itineraries','travel-guide','about','contact','plan-your-trip','privacy-policy','terms','cancellation-policy','photo-credits',...packages.map(p=>'packages/'+p.slug),...Object.entries(collections).flatMap(([k,v])=>v.map(i=>k+'/'+i.slug))];return paths.map(path=>({url:config.url+'/'+path,lastModified:new Date('2026-11-02'),changeFrequency:'monthly',priority:path?0.7:1}))}
