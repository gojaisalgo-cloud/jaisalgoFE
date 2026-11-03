import {AdminWorkspace} from '@/components/booking/admin-workspace';
import {adminConfigured,isAdmin} from '@/lib/booking/security';
export const dynamic='force-dynamic';
export const metadata={title:'JaisalGo Travel Desk',robots:{index:false,follow:false}};
export default async function Admin(){return <div className="wrap admin-page"><AdminWorkspace configured={adminConfigured()} signedIn={await isAdmin()}/></div>}
