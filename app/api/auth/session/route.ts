import {customerForSession,googleClientId,revokeCustomerSession} from '@/lib/customer/auth';
import {authCookie,authJson,readAuthCookie} from '@/lib/customer/http';
import {sameOrigin} from '@/lib/booking/security';
export const runtime='nodejs';
export async function GET(req:Request){
 try{const user=await customerForSession(await readAuthCookie(req,'session'));return authJson({configured:Boolean(googleClientId()),user:user?{name:user.name,email:user.email}:null})}
 catch{return authJson({configured:false,user:null,error:'Account sign-in is temporarily unavailable. Guest browsing is available.'},503)}
}
export async function POST(req:Request){
 if(!sameOrigin(req))return authJson({error:'This request must come from JaisalGo.'},403);
 try{await revokeCustomerSession(await readAuthCookie(req,'session'));const response=authJson({signedOut:true}),cookie=authCookie(req,'session');response.cookies.set(cookie.name,'',{...cookie.options,maxAge:0});return response}
 catch{return authJson({error:'Could not sign out. Please try again.'},503)}
}
