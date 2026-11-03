import type {Metadata} from 'next';
import {mode} from '@/lib/booking/payments';
import {tours} from '@/lib/booking/db';
import {PackageGuide} from '@/components/booking/package-guide';
import {TourCatalog} from '@/components/booking/catalog';
export const dynamic='force-dynamic';
const metadata:Metadata={title:'Jaisalmer Tour Packages · Desert Safaris & Royal Stays',description:'Compare Jaisalmer tour packages, Sam desert camping, couples and family escapes. Transparent provisional estimates and a ₹99 token reservation flow.',alternates:{canonical:'/packages'}};
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{return {...metadata,robots:Object.keys(await searchParams).length?{index:false,follow:true}:undefined}}
export default async function Packages(){return <div className="wrap booking-list-page"><div className="overline">JAISALMER, YOUR WAY</div><h1>Small adventures.<br/><em>Extraordinary escapes.</em></h1><p>From a short camel ride to a private desert escape. Find your pace, then see every detail.</p><div className="booking-mode-note">Compare the charging basis: per person, tent or vehicle. All prices are provisional. ₹99 is part of the total. {mode()==='demo'?'Demo checkout: no money or real reservation is taken.':mode()==='test'?'Gateway test checkout: no real charge or travel reservation.':'Review the confirmed departure and accepted terms before paying.'}</div><TourCatalog tours={await tours()}/><PackageGuide/></div>}
