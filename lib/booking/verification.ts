import {db} from './db';
import {hash,secretToken} from './security';
import {viewDraft,type Booking} from './service';

/** A separate, opaque QR capability reveals only operational verification facts. */
export async function verifiedTicket(id:string,access:string){
 const status=await viewDraft(id,access);
 if(!status.booking)throw Error('A ticket is available only after payment verification.');
 const c=await db(),tx=await c.transaction('write');
 try{
  const row=(await tx.execute({sql:'SELECT payload,status FROM bookings WHERE draft_id=?',args:[id]})).rows[0];
  if(!row)throw Error('Ticket unavailable.');
  const booking={...JSON.parse(String(row.payload)),status:String(row.status)} as Booking;
  if(!booking.verificationToken){
   booking.verificationToken=secretToken();
   await tx.execute({sql:'UPDATE bookings SET payload=? WHERE draft_id=?',args:[JSON.stringify(booking),id]});
  }
  await tx.execute({sql:'INSERT OR IGNORE INTO ticket_verifications VALUES(?,?)',args:[hash(booking.verificationToken),id]});
  await tx.commit();
  return {booking,verificationPath:'/verify/'+booking.verificationToken};
 }catch(error){await tx.rollback();throw error}finally{tx.close()}
}

export async function publicVerification(token:string){
 if(!/^[a-f0-9]{48}$/.test(token))return null;
 const c=await db(),row=(await c.execute({sql:'SELECT b.payload,b.status FROM ticket_verifications v JOIN bookings b ON b.draft_id=v.draft_id WHERE v.token_hash=?',args:[hash(token)]})).rows[0];
 if(!row)return null;
 const b=JSON.parse(String(row.payload)) as Booking;
 // Never return the customer, contact, access key, provider reference or private URL.
 return {confirmationPending:b.confirmationPending===true,id:b.id,title:b.title,date:b.date,travelers:b.choices.travelers,status:String(row.status),mode:b.mode,total:b.quote.total,paid:b.paid,refunded:b.refunded};
}
