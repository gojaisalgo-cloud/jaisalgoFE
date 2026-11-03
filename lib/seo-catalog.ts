import {cache} from 'react';
import {tours} from '@/lib/booking/db';

// Share a read between generateMetadata and rendering, only within this request.
export const publishedTours=cache(()=>tours());
export const publishedTour=cache(async(slug:string)=>(await publishedTours()).find(t=>t.slug===slug));
