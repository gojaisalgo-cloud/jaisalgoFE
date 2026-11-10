import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
export const authHeaders={'Cache-Control':'no-store, max-age=0','Pragma':'no-cache','X-Robots-Tag':'noindex, nofollow, noarchive'};
export function authJson(body:unknown,status=200){return NextResponse.json(body,{status,headers:authHeaders})}
export function authCookie(req:Request,kind:'session'|'challenge'){
 const secure=new URL(req.url).protocol==='https:'||process.env.VERCEL==='1';
 return {name:(secure?'__Host-':'')+'jaisalgo_customer_'+kind,options:{httpOnly:true,secure,sameSite:'strict' as const,path:'/'}};
}
export async function readAuthCookie(req:Request,kind:'session'|'challenge'){return (await cookies()).get(authCookie(req,kind).name)?.value||''}
