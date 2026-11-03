import {privateRobots} from '@/lib/seo';
import {databaseConfigured} from '@/lib/booking/storage';
import {AdminWorkspace} from '@/components/booking/admin-workspace';
import {adminConfigured,isAdmin} from '@/lib/booking/security';
export const dynamic='force-dynamic';
export const metadata={title:'JaisalGo Travel Desk',robots:privateRobots};
export default async function Admin(){return <div className="wrap admin-page">{!databaseConfigured()&&<div className="booking-mode-note" role="status"><strong>Connect a persistent database to enable online bookings.</strong><p>In Vercel → Project Settings → Environment Variables, add DATABASE_URL (a hosted libSQL database URL) and DATABASE_AUTH_TOKEN, then redeploy. Local file databases and temporary storage cannot safely hold bookings on Vercel. Public packages remain available for browsing.</p></div>}<AdminWorkspace configured={adminConfigured()} signedIn={await isAdmin()}/></div>}
