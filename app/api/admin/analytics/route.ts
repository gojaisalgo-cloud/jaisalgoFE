import {NextResponse} from 'next/server';
import {isAdmin,jsonBody,sameOrigin,limit} from '@/lib/booking/security';
import {analyticsOperation,loadReport} from '@/lib/analytics/admin';
export const runtime='nodejs';
export async function GET(req:Request){if(!await isAdmin())return NextResponse.json({error:'Sign in required.'},{status:401});try{const p=new URL(req.url).searchParams;return NextResponse.json(await loadReport({period:p.get('period')||'month',mode:p.get('mode')||'live'}),{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'Report unavailable. Retry; booking operations remain available.'},{status:503})}}
export async function POST(req:Request){if(!sameOrigin(req)||!await isAdmin())return NextResponse.json({error:'Sign in required.'},{status:403});try{limit('analytics-admin',60);await analyticsOperation(await jsonBody(req,2000));return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Could not save measurement.'},{status:400})}}
