import {schedulePosthogDelivery} from '@/lib/analytics/posthog-after';
import {StorageUnavailableError} from '@/lib/booking/storage';
import {recordFinancialMilestones} from '@/lib/analytics/server';
import {NextResponse} from 'next/server';
import {bookingError,BookingIssue} from '@/lib/booking/errors';
import {createDraft,draftFor,settle,startBalance,viewDraft,inspectDeparture,preparePayment,abandonDraft,assertPayment,resumeDraft} from '@/lib/booking/service';
import {sameOrigin,jsonBody,limit} from '@/lib/booking/security';
import {mode,provider,verifyCheckout} from '@/lib/booking/payments';
export const runtime='nodejs';
export async function POST(req:Request){schedulePosthogDelivery();if(!sameOrigin(req))return NextResponse.json({error:'Use this website to book.'},{status:403});try{limit(req.headers.get('x-forwarded-for')||'local',60);const b=await jsonBody(req);if(!b||typeof b!=='object'||Array.isArray(b))throw Error('Invalid booking request.');
 if(b.action==='create')return NextResponse.json(await createDraft(b.input));
 if(b.action==='availability')return NextResponse.json(await inspectDeparture(b.input),{headers:{'Cache-Control':'no-store'}});
 if(b.action==='resume')return NextResponse.json(await resumeDraft(b.idempotency,b.access));
 if(typeof b.id!=='string'||typeof b.access!=='string')throw Error('Missing reservation access.');
 if(b.action==='ticket'){const {verifiedTicket}=await import('@/lib/booking/verification');const t=await verifiedTicket(b.id,b.access);return NextResponse.json({verificationPath:t.verificationPath},{headers:{'Cache-Control':'private, no-store'}})}
 if(b.action==='status')return NextResponse.json(await viewDraft(b.id,b.access));
 if(b.action==='balance')return NextResponse.json(await startBalance(b.id,b.access));
 if(b.action==='prepare')return NextResponse.json(await preparePayment(b.id,b.access));
 if(b.action==='abandon'){await abandonDraft(b.id,b.access);return NextResponse.json({ok:true})}
 const row=await draftFor(b.id,b.access),d=JSON.parse(String(row.payload));if(d.mode!==mode())throw Error('Payment environment changed. Contact support.');
 if(b.action==='demo'){if(d.mode!=='demo')throw Error('Simulation is disabled for real payments.');if(b.outcome==='captured')await settle(b.id,{id:'sim_'+b.id,amount:d.amount,currency:'INR',order_id:String(row.provider_order),status:'captured'});else if(b.outcome==='failed')await (await import('@/lib/booking/db')).db().then(c=>c.execute({sql:"UPDATE drafts SET state='failed' WHERE id=? AND state IN ('pending','failed')",args:[b.id]}));else if(b.outcome!=='pending')throw Error('Unknown payment outcome.');await recordFinancialMilestones(b.id);return NextResponse.json(await viewDraft(b.id,b.access))}
 if(b.action==='verify'){if(d.mode==='demo'||typeof b.payment!=='string'||typeof b.signature!=='string'||!verifyCheckout(String(row.provider_order),b.payment,b.signature))throw Error('Payment signature could not be verified.');const p=await provider('payments/'+encodeURIComponent(b.payment));assertPayment(d,row.provider_order,p);if(p.id!==b.payment)throw Error('Payment reference did not match.');if(p.status==='captured')await settle(b.id,p);else if(p.status==='authorized')await (await import('@/lib/booking/db')).db().then(c=>c.execute({sql:"UPDATE drafts SET state='authorized' WHERE id=? AND state IN ('pending','failed')",args:[b.id]}));await recordFinancialMilestones(b.id);return NextResponse.json(await viewDraft(b.id,b.access))}
 throw Error('Unknown booking action.');
 }catch(e){return NextResponse.json({error:bookingError(e),...(e instanceof BookingIssue||e instanceof StorageUnavailableError?{code:e.code}:{})},{status:e instanceof StorageUnavailableError?503:e instanceof BookingIssue?409:400})}}
