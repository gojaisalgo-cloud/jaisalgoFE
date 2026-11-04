import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'node:path';
import type {Booking} from './service';
import {config} from '@/lib/config';
import {money} from './pricing';
import {activeBooking,paymentLabel,ticketDate,reportingTime,meetingPlace} from './ticket';

/** Generated from the authorized, current server ledger; no browser-supplied totals. */
export async function ticketPdf(b:Booking,verificationUrl:string):Promise<Buffer>{
 const doc=new PDFDocument({size:'A5',margin:28,bufferPages:true,font:path.join(process.cwd(),'public/fonts/manrope-pdf.ttf'),info:{Title:`JaisalGo ticket ${b.id}`,Author:'JaisalGo'}});
 const output=new Promise<Buffer>((resolve,reject)=>{const chunks:Buffer[]=[];doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
 // Avoid an unhandled stream rejection if rendering itself fails.
 void output.catch(()=>{});
 try{
  const width=doc.page.width-56,ink='#21352d',muted='#64736c',line='#e1e6e1';
  doc.fillColor(ink).fontSize(22).text('JaisalGo',28,28);
  doc.fontSize(8).fillColor(muted).text('JAISALMER · RAJASTHAN',28,59);
  doc.text(new URL(config.url).hostname,250,36,{width:width-222,align:'right'});
  doc.moveTo(28,82).lineTo(doc.page.width-28,82).strokeColor(line).stroke();
  doc.y=97;doc.x=28;
  doc.fontSize(9).fillColor(ink).text(b.mode==='live'?(b.status==='paid'?'FULLY PAID TICKET':'RESERVATION TICKET'):`${b.mode.toUpperCase()} · NO REAL PAYMENT OR RESERVATION`);
  doc.moveDown(.7).fontSize(20).text(b.title,{width});
  doc.moveDown(.5).fontSize(10).fillColor(muted).text(paymentLabel(b));
  doc.moveDown(1);
  const row=(label:string,value:string)=>{
   const y=doc.y;doc.fontSize(8).fillColor(muted).text(label,28,y,{width:width*.35});
   doc.fontSize(10).fillColor(ink).text(value,28+width*.37,y,{width:width*.63});
   doc.y=Math.max(doc.y,y+14)+7;doc.x=28;
  };
  row('BOOKING ID',b.id);row('TRAVELER',b.name);row('TRAVEL DATE',ticketDate(b.date));row('YOUR GROUP',`${b.choices.travelers} travelers · ${b.duration||`${b.nights} nights / ${b.days} days`}`);
  row('REPORTING',reportingTime(b));
  row('VENUE',meetingPlace(b));
  row('PACKAGE TOTAL',money(b.quote.total));row(b.mode==='live'?'AMOUNT PAID':'SIMULATED PAYMENT',money(b.paid));
  row(activeBooking(b)?'REMAINING BALANCE':'REFUNDED',money(activeBooking(b)?Math.max(0,b.quote.total-b.paid):b.refunded));
  if(b.status==='reserved')doc.fontSize(9).fillColor(muted).text('Balance due at check-in or on your visit date.',{width});
  doc.moveDown(.7);let qrY=doc.y;
  if(qrY+111>doc.page.height-28){doc.addPage();qrY=28}
  const qr=await QRCode.toBuffer(verificationUrl,{errorCorrectionLevel:'M',margin:4,width:350});
  doc.image(qr,28,qrY,{width:100,height:100});doc.link(28,qrY,100,100,verificationUrl);
  doc.fontSize(10).fillColor(ink).text('Scan to verify this booking',142,qrY+18,{width:width-114});
  doc.fontSize(8).fillColor(muted).text('Shows current status without customer contact details. This is not an admission pass.',142,qrY+40,{width:width-114});
  doc.y=qrY+111;doc.x=28;
  doc.fontSize(9).fillColor(ink).text(`Assistance: ${config.phone}`,{link:config.phoneHref});
  doc.fontSize(8).fillColor(muted).text('Keep your private booking link to retrieve the ticket on another device.');
  doc.addPage();doc.fontSize(17).fillColor(ink).text('Your trip, in detail');doc.fontSize(8).fillColor(muted).text(b.id);doc.moveDown();
  function section(title:string,body:string){
   if(doc.y>doc.page.height-90)doc.addPage();
   doc.fontSize(10).fillColor(ink).text(title,{width});doc.moveDown(.3);
   doc.fontSize(9).fillColor(muted).text(body||'Not specified',{width,lineGap:3});doc.moveDown(.9);
  }
  if(b.details?.venue.confirmed)section('Venue & reporting',`${b.details.venue.name} · ${b.details.venue.address}\n${b.details.culture.reporting}`);
  if(b.clarity){section('What’s included at a glance',b.clarity.groups.map(group=>`${group.title}: ${group.summary}`).join('\n'));section('Stay & transport arrangement',`${b.clarity.staySummary}\n${b.clarity.roomSummary}\n${b.clarity.transportSummary}`);if(b.clarity.requests.length)section('Requests · not priced or guaranteed',b.clarity.requests.join(' · '))}
  else if(b.arrangements){section('Stay',b.arrangements.accommodation);section('Meals',b.arrangements.meals);section('Transport',b.arrangements.transport)}
  section('Itinerary note','Only experiences explicitly included in your saved package details are included in the price.');
  for(const day of b.itinerary||[])section(day.title,day.body);
  if(b.specialRequest)section('Your request · subject to confirmation',b.specialRequest);
  if(b.operations?.instructions)section('Arrival instructions',b.operations.instructions);
  section('Cancellation & refunds',b.policy);
  section('Payment instructions',b.status==='paid'?'Fully paid. No remaining package balance is due.':b.status==='reserved'?'The ₹99 reservation amount is included in your total. Pay the remaining balance at check-in or on your visit date. Ask the operator for a receipt.':'Contact the travel desk for the current review or refund status.');
  const pages=doc.bufferedPageRange();for(let n=0;n<pages.count;n++){doc.switchToPage(n);const margin=doc.page.margins.bottom;doc.page.margins.bottom=0;doc.fillColor(muted).fontSize(7).text(`${b.id} · ${n+1} / ${pages.count}`,28,doc.page.height-17,{width,align:'right',lineBreak:false});doc.page.margins.bottom=margin}
  doc.end();return await output;
 }catch(error){doc.end();throw error}
}
