import {recordAcceptedEnquiry} from '@/lib/analytics/customer';
import {schedulePosthogDelivery} from '@/lib/analytics/posthog-after';
import {NextRequest,NextResponse} from 'next/server';
import {enquirySchema} from '@/lib/enquiry';
const attempts=new Map<string,{count:number;until:number}>();
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');let sameOrigin=false;try{const parsed=new URL(origin||'');sameOrigin=['http:','https:'].includes(parsed.protocol)&&parsed.host===request.headers.get('host')}catch{}
 if(!sameOrigin)return NextResponse.json({error:'Please send the enquiry from this website.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return NextResponse.json({error:'JSON request required.'},{status:415});
 // Bounded process-local protection; use a trusted reverse-proxy IP and distributed limiter at launch.
 const key=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';const now=Date.now();
 for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
 const state=attempts.get(key)||{count:0,until:now+60000};if(state.count>=5)return NextResponse.json({error:'Too many attempts. Please wait one minute.'},{status:429});state.count++;if(attempts.size<10000||attempts.has(key))attempts.set(key,state);
 try{
 const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:'Request body required.'},{status:400});let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();return NextResponse.json({error:'Enquiry is too large.'},{status:413})}chunks.push(value)}
 const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));const {measurement,analyticsAttempt,...enquiry}=body;const result=enquirySchema.safeParse(enquiry);if(!result.success||!result.data.phone)return NextResponse.json({error:'Check your contact details, dates and privacy consent.'},{status:400});
 const endpoint=process.env.ENQUIRY_WEBHOOK_URL;if(!endpoint)return NextResponse.json({error:'Online enquiries are not connected yet. Download your trip brief; no enquiry has been sent.'},{status:503});
 const url=new URL(endpoint);if(url.protocol!=='https:')return NextResponse.json({error:'Enquiry delivery is unavailable. Please save your trip brief.'},{status:503});
 const response=await fetch(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(process.env.ENQUIRY_WEBHOOK_TOKEN?{Authorization:`Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({...result.data,source:'jaisalgo',submittedAt:new Date().toISOString()}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)return NextResponse.json({error:'The enquiry service could not accept your request. Please save your brief and retry later.'},{status:502});
 await recordAcceptedEnquiry(measurement,analyticsAttempt);schedulePosthogDelivery();
 return NextResponse.json({accepted:true,message:'Accepted for delivery. No booking has been confirmed.'});
 }catch{return NextResponse.json({error:'Could not process this enquiry. Save your brief and retry later.'},{status:400})}
}
