import {createLoginChallenge,googleClientId} from '@/lib/customer/auth';
import {authCookie,authJson} from '@/lib/customer/http';
import {hash,jsonBody,limit,sameOrigin} from '@/lib/booking/security';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return authJson({error:'This request must come from JaisalGo.'},403);
 if(!googleClientId())return authJson({error:'Google sign-in is being connected. You can continue as a guest.'},503);
 try{
  limit('google-challenge:'+hash(req.headers.get('x-forwarded-for')?.split(',')[0]||'local'),12);
  const body=await jsonBody(req,512);if(body.consent!==true)return authJson({error:'Please confirm the contact-sharing notice first.'},400);
  const nonce=await createLoginChallenge(),response=authJson({nonce,clientId:googleClientId()}),cookie=authCookie(req,'challenge');
  response.cookies.set(cookie.name,nonce,{...cookie.options,maxAge:600});return response;
 }catch{return authJson({error:'Could not start Google sign-in. Please try again shortly.'},503)}
}
