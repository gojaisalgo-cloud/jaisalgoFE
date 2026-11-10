import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {db} from '@/lib/booking/db';
import {drainPaymentAlerts,whatsappSettings} from '@/lib/booking/whatsapp-alerts';
export const runtime='nodejs';
export async function GET(req:Request){
 const expected=process.env.CRON_SECRET;
 if(!expected)return NextResponse.json({error:'Retry service is not configured.'},{status:503});
 const a=Buffer.from(req.headers.get('authorization')||''),b=Buffer.from('Bearer '+expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:'Unauthorized.'},{status:401});
 if(!whatsappSettings())return NextResponse.json({error:'WhatsApp sender is not configured.'},{status:503});
 try{return NextResponse.json(await drainPaymentAlerts(await db()),{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Could not process pending alerts.'},{status:503})}
}
