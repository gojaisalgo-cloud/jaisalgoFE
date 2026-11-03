import {ZodError} from 'zod';
export class BookingIssue extends Error{constructor(public code:string,message:string){super(message)}}
export function bookingError(error:unknown){
 if(error instanceof ZodError){
  const issue=error.issues[0],field=String(issue?.path[0]||'');
  if(field==='phone')return 'Enter a valid mobile number: 10 Indian digits, or an international number with +country code.';
  if(field==='name')return 'Enter the full name for your ticket (2–100 characters).';
  if(field==='date')return 'Choose a valid travel date from tomorrow through the next 12 months.';
  if(field==='children')return 'Count children within the traveler total, with at least one adult.';
  if(field==='travelers')return 'Choose between 1 and 12 travelers.';
  if(field==='consent')return 'Accept the cancellation terms and privacy notice to continue.';
  return 'Some trip details need updating. Review your selections and try again.';
 }
 return error instanceof Error?error.message:'Could not process your reservation. Please try again.';
}
