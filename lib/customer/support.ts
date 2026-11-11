import {z} from 'zod';
import {db} from '@/lib/booking/db';
import {hash} from '@/lib/booking/security';
import {whatsappSettings} from '@/lib/booking/whatsapp-alerts';
import type {Client} from '@libsql/client';
export const supportSchema=z.object({requestId:z.string().uuid(),name:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^\+?[1-9][\d ()-]{8,19}$/).refine(v=>{const n=v.replace(/\D/g,'');return n.length>=10&&n.length<=15}),query:z.string().trim().min(10).max(1200),consent:z.literal(true)}).strict();
export class SupportError extends Error {constructor(message:string,public status:number){super(message)}}
const clean=(s:string)=>s.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ');
/** Persist only delivery metadata. Duplicate submissions never send another group message. */
export async function sendSupportRequest(userId:string,input:z.infer<typeof supportSchema>,client?:Client){
 const settings=whatsappSettings();if(!settings)throw new SupportError('Callback chat is temporarily unavailable. Please call our travel desk.',503);
 const c=client||await db(),now=Date.now(),id=hash(userId+':'+input.requestId),owner=hash(userId);
 await c.execute('CREATE TABLE IF NOT EXISTS support_deliveries(id TEXT PRIMARY KEY,owner TEXT NOT NULL,state TEXT NOT NULL,created INTEGER NOT NULL)');
 const tx=await c.transaction('write');
 try{
  await tx.execute({sql:'DELETE FROM support_deliveries WHERE created<?',args:[now-30*86400000]});
  const previous=(await tx.execute({sql:'SELECT state FROM support_deliveries WHERE id=?',args:[id]})).rows[0];
  if(previous){await tx.rollback();if(previous.state==='sent')return {accepted:true};throw new SupportError('This request has already been submitted. If you have not received confirmation, please call the travel desk rather than submitting again.',409)}
  const count=(await tx.execute({sql:'SELECT COUNT(*) AS total FROM support_deliveries WHERE owner=? AND created>?',args:[owner,now-3600000]})).rows[0];
  if(Number(count.total)>=3)throw new SupportError('You have reached the callback request limit. Please call the travel desk for more help.',429);
  await tx.execute({sql:"INSERT INTO support_deliveries VALUES(?,?,'sending',?)",args:[id,owner,now]});await tx.commit();
 }catch(e){if(!tx.closed)await tx.rollback();throw e}finally{tx.close()}
 const message=['JAISALGO · SUPPORT CALLBACK REQUEST',`Reference: ${id.slice(0,12)}`,`Name: ${clean(input.name)}`,`Phone: ${clean(input.phone)}`,`Query: ${clean(input.query)}`,`Submitted: ${new Date(now).toISOString()}`,'Signed-in traveller consented to sharing these details with the private travel-desk WhatsApp group and receiving a callback.','Support enquiry only. No booking or payment has been made.'].join('\n');
 try{
  const response=await fetch(settings.endpoint,{method:'POST',redirect:'error',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:settings.group,message,linkPreview:false}),signal:AbortSignal.timeout(8000)});
  const result=response.ok?await response.json():null;
  if(!response.ok||typeof result?.idMessage!=='string'||!result.idMessage)throw Error('Delivery unconfirmed');
  await c.execute({sql:"UPDATE support_deliveries SET state='sent' WHERE id=?",args:[id]});return {accepted:true};
 }catch{
  await c.execute({sql:"UPDATE support_deliveries SET state='review' WHERE id=?",args:[id]});
  throw new SupportError('We could not confirm delivery. Please call the travel desk; avoid resending this request.',502);
 }
}
