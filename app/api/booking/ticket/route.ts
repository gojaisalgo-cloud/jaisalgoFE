import {sameOrigin,jsonBody,limit} from '@/lib/booking/security';
import {verifiedTicket} from '@/lib/booking/verification';
import {ticketPdf} from '@/lib/booking/ticket-pdf';
import {config} from '@/lib/config';
import {bookingError} from '@/lib/booking/errors';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer'};
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Open your ticket on this website.'},{status:403,headers});
 try{
  limit('pdf:'+(req.headers.get('x-forwarded-for')||'local'),15);
  const body=await jsonBody(req,1000);
  if(typeof body?.id!=='string'||!/^jg_[a-f0-9]{20}$/.test(body.id)||typeof body.access!=='string'||!/^[a-zA-Z0-9-]{32,100}$/.test(body.access))throw Error('Valid private ticket access is required.');
  const {booking,verificationPath}=await verifiedTicket(body.id,body.access),bytes=await ticketPdf(booking,new URL(verificationPath,booking.mode==='live'?config.url:new URL(req.url).origin).href);
  return new Response(new Uint8Array(bytes),{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="JaisalGo-Ticket-${booking.id}.pdf"`}});
 }catch(error){return Response.json({error:bookingError(error)},{status:400,headers})}
}
