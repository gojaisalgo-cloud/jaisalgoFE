import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const secretToken=()=>randomBytes(24).toString('hex');
export function signature(data:string,secret:string){return createHmac('sha256',secret).update(data).digest('hex')}
export function equal(a:string,b:string){return a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b))}
export function checkSignature(data:string,sig:string,secret:string){return /^[a-f0-9]{64}$/.test(sig)&&equal(signature(data,secret),sig)}
export function adminConfigured(){return (process.env.ADMIN_PASSWORD?.length||0)>=12&&(process.env.ADMIN_SESSION_SECRET?.length||0)>=32}
export function mintSession(){const data=Buffer.from(JSON.stringify({expires:Date.now()+4*3600000,nonce:secretToken()})).toString('base64url');return data+'.'+signature(data,process.env.ADMIN_SESSION_SECRET!)}
export async function isAdmin(){if(!adminConfigured())return false;const cookie=(await cookies()).get('jaisalgo_admin')?.value||'',parts=cookie.split('.');try{return parts.length===2&&checkSignature(parts[0],parts[1],process.env.ADMIN_SESSION_SECRET!)&&JSON.parse(Buffer.from(parts[0],'base64url').toString()).expires>Date.now()}catch{return false}}
export function sameOrigin(req:Request){try{const origin=new URL(req.headers.get('origin')||'');return ['http:','https:'].includes(origin.protocol)&&origin.host===(req.headers.get('host')||new URL(req.url).host)}catch{return false}}
const attempts=new Map<string,{count:number;until:number}>();
export function limit(key:string,max=30){const now=Date.now();for(const [k,v]of attempts)if(v.until<now)attempts.delete(k);const x=attempts.get(key)||{count:0,until:now+60000};if(attempts.size>10000&&!attempts.has(key))throw Error('Please retry shortly.');x.count++;attempts.set(key,x);if(x.count>max)throw Error('Too many requests; try again in a minute.')}
export async function jsonBody(req:Request,max=24000){if(!req.headers.get('content-type')?.includes('application/json'))throw Error('JSON required.');const reader=req.body?.getReader();if(!reader)throw Error('Request body required.');let bytes=0;const chunks:Uint8Array[]=[];for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>max){await reader.cancel();throw Error('Request too large.')}chunks.push(value)}return JSON.parse(Buffer.concat(chunks).toString())}
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
