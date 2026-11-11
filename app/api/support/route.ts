import {customerForSession} from '@/lib/customer/auth';
import {authJson,readAuthCookie} from '@/lib/customer/http';
import {sameOrigin,jsonBody,limit} from '@/lib/booking/security';
import {sendSupportRequest,supportSchema,SupportError} from '@/lib/customer/support';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return authJson({error:'Please send your request from JaisalGo.'},403);
 try{
  const user=await customerForSession(await readAuthCookie(req,'session'));
  if(!user)return authJson({error:'Please sign in to send a callback request.'},401);
  try{limit('support:'+user.id,5)}catch{return authJson({error:'Please wait a minute before trying again.'},429)}
  let body;try{body=await jsonBody(req,8000)}catch{return authJson({error:'Please check your request and try again.'},400)}
  const input=supportSchema.safeParse(body);if(!input.success)return authJson({error:'Enter your name, a valid phone number, a query of at least 10 characters, and consent.'},400);
  return authJson(await sendSupportRequest(user.id,input.data));
 }catch(e){return authJson({error:e instanceof SupportError?e.message:'Support is temporarily unavailable. Please call the travel desk.'},e instanceof SupportError?e.status:503)}
}
