import {customerAnalyticsId,recordCustomerAnalytics} from '@/lib/analytics/customer';
import {schedulePosthogDelivery} from '@/lib/analytics/posthog-after';
import {completeCustomerSignIn,customerSessionSeconds,verifyGoogleCredential} from '@/lib/customer/auth';
import {authCookie,authJson,readAuthCookie} from '@/lib/customer/http';
import {equal,hash,jsonBody,limit,sameOrigin} from '@/lib/booking/security';
import {schedulePaymentAlerts} from '@/lib/booking/whatsapp-after';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return authJson({error:'This request must come from JaisalGo.'},403);
 try{
  limit('google-signin:'+hash(req.headers.get('x-forwarded-for')?.split(',')[0]||'local'),15);
  const body=await jsonBody(req,18000),cookieNonce=await readAuthCookie(req,'challenge');
  if(body.consent!==true||typeof body.credential!=='string'||typeof body.nonce!=='string'||!/^[a-f0-9]{48}$/.test(body.nonce)||!equal(body.nonce,cookieNonce))return authJson({error:'Sign-in expired. Please start again.'},400);
  const identity=await verifyGoogleCredential(body.credential,body.nonce),result=await completeCustomerSignIn(identity,body.nonce,true);
  await recordCustomerAnalytics(result,body.measurement);schedulePosthogDelivery();
  const response=authJson({user:{name:result.user.name,email:result.user.email,analyticsId:customerAnalyticsId(result.user.id)},isNew:result.isNew}),session=authCookie(req,'session'),challenge=authCookie(req,'challenge');
  response.cookies.set(session.name,result.sessionToken,{...session.options,maxAge:customerSessionSeconds});response.cookies.set(challenge.name,'',{...challenge.options,maxAge:0});
  schedulePaymentAlerts();return response;
 }catch{return authJson({error:'Google sign-in could not be completed. Please try again.'},401)}
}
