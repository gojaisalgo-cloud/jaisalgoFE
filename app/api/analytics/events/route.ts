import {NextResponse} from 'next/server';
import {sameOrigin,jsonBody,limit} from '@/lib/booking/security';
import {analyticsEnabled,ingest,withdraw} from '@/lib/analytics/server';
import {batchSchema} from '@/lib/analytics/schema';
import {z} from 'zod';
export const runtime='nodejs';
export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:'Same-origin request required.'},{status:403});if(!analyticsEnabled())return new Response(null,{status:204});try{limit('analytics:'+ (req.headers.get('x-forwarded-for')||'local'),120);const data=batchSchema.parse(await jsonBody(req,16000));await ingest(data.events);return new Response(null,{status:204})}catch{return NextResponse.json({error:'Invalid or unavailable measurement.'},{status:400})}}
export async function DELETE(req:Request){if(!sameOrigin(req))return new Response(null,{status:403});try{limit('analytics-withdraw:'+(req.headers.get('x-forwarded-for')||'local'),30);const data=z.object({sessionId:z.uuid()}).strict().parse(await jsonBody(req,1000));await withdraw(data.sessionId);return new Response(null,{status:204})}catch{return new Response(null,{status:400})}}
