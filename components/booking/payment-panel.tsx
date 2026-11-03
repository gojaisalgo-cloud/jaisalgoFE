'use client';
import {track,clockPause,activeTime,measurement} from '@/lib/analytics/client';
import {useEffect,useRef,useState} from 'react';
import {money} from '@/lib/booking/pricing';
import type {Draft} from '@/lib/booking/service';
type GatewayResponse={razorpay_payment_id:string;razorpay_signature:string};
export type Checkout={id:string;access:string;draft:Draft;order:string;key?:string;state?:string;expires?:number;paymentReview?:boolean};
declare global{interface Window{Razorpay:new(options:Record<string,unknown>)=>{open:()=>void;on:(event:string,handler:()=>void)=>void}}}
export class BookingApiError extends Error{constructor(message:string,public code?:string){super(message)}}
export async function bookingApi(body:unknown,signal?:AbortSignal){
 let r:Response;try{r=await fetch('/api/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)})}catch(e){if(signal?.aborted)throw e;throw new BookingApiError('Connection interrupted. Your details are kept. Check payment status before retrying.','CONNECTION')}
 let data;try{data=await r.json()}catch{throw new BookingApiError('The server could not respond. Your details are kept; please retry.','CONNECTION')}
 if(!r.ok)throw new BookingApiError(data.error||'Could not process your request.',data.code);return data;
}
let gatewayLoad:Promise<void>|null=null;
async function loadGateway(){if(window.Razorpay)return;if(!gatewayLoad)gatewayLoad=new Promise<void>((resolve,reject)=>{const script=document.createElement('script'),timer=setTimeout(()=>{script.remove();gatewayLoad=null;reject(Error('Secure checkout could not load. Please retry.'))},12000);script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=()=>{clearTimeout(timer);resolve()};script.onerror=()=>{clearTimeout(timer);script.remove();gatewayLoad=null;reject(Error('Secure checkout could not load. Please retry.'))};document.head.append(script)});await gatewayLoad;if(!window.Razorpay){gatewayLoad=null;throw Error('Secure checkout could not load. Please retry.')}}
export function paymentState(state:string|undefined,expires:number|undefined,now=Date.now()){
 if(state==='creating')return {pay:false,restart:false,title:'Preparing your payment.',message:'Your checkout is saved. Check status shortly; do not start another payment.'};
 const expired=state==='expired'||!!expires&&expires<=now&&!['authorized','captured','refunded','refund_required','payment_review'].includes(state||'');
 if(expired||state==='cancelled')return {pay:false,restart:true,title:'Your checkout hold ended.',message:'Your details are saved. Start a fresh checkout to check the date and price again.'};
 if(state==='authorized')return {pay:false,restart:false,title:'Payment is processing.',message:'No ticket yet. Check status; please do not pay again.'};
 if(['refund_required','payment_review','order_unknown','order_claimed','refunded'].includes(state||''))return {pay:false,restart:false,title:state==='refunded'?'Payment refunded.':'Your payment needs review.',message:state==='refunded'?'No new payment is required for this checkout.':'No new payment is available. Contact the operator to reconcile this checkout.'};
 if(state==='captured')return {pay:false,restart:false,title:'Payment verified.',message:'Refresh status to open your ticket.'};
 return {pay:!state||['pending','failed'].includes(state),restart:false,title:state==='failed'?'Retry your payment.':'Complete your payment',message:state==='failed'?'Your selections are saved. Retry uses the same payment order.':'Your ticket appears after payment verification.'};
}
export function gatewayOptions(checkout:Checkout){return {key:checkout.key,order_id:checkout.order,amount:checkout.draft.amount,currency:'INR',name:'JaisalGo',description:checkout.draft.kind==='token'?'Package reservation token':'Remaining package balance',prefill:{name:checkout.draft.name,contact:checkout.draft.phone},hidden:{email:true},theme:{color:'#263c35'},remember_customer:false}}
async function openPaymentInternal(checkout:Checkout,onUpdate:()=>void|Promise<void>,onMessage:(message:string)=>void){
 const {id,access,draft,order,key}=checkout,current=await bookingApi({action:'prepare',id,access});
 if(current.booking&&draft.kind==='token'){await onUpdate();return}
 if(current.expires<Date.now())throw Error('This checkout hold expired. Start a fresh checkout before payment.');
 if(current.state==='authorized')throw Error('Payment is processing. Your ticket will appear when capture is verified. Please do not pay again.');
 if(!['pending','failed'].includes(current.state))throw Error('This order needs review. Check payment status before retrying.');
 if(draft.mode==='demo'){await bookingApi({action:'demo',id,access,outcome:'captured'});await onUpdate();return}
 if(!key||!order)throw Error('Secure payment is not configured for this checkout.');
 await loadGateway();
 await new Promise<void>((resolve)=>{
  const gateway=new window.Razorpay({...gatewayOptions(checkout),handler:async(response:GatewayResponse)=>{try{const checked=await bookingApi({action:'verify',id,access,payment:response.razorpay_payment_id,signature:response.razorpay_signature});if(!checked.booking)onMessage('Payment is processing. Your ticket will appear after capture is verified. Please do not pay again.');await onUpdate()}catch(e){onMessage((e as Error).message)}finally{resolve()}},modal:{ondismiss:()=>{track('booking_error',{packageId:draft.slug,reason:'gateway_closed'});onMessage('Payment window closed. You can check status or retry this payment.');void onUpdate();resolve()}}});
  gateway.on('payment.failed',()=>{track('booking_error',{packageId:draft.slug,reason:'payment_failed'});onMessage('Payment did not complete. Your details are saved; check status before retrying.');void onUpdate();resolve()});gateway.open();
 });
}
export async function openPayment(checkout:Checkout,onUpdate:()=>void|Promise<void>,onMessage:(message:string)=>void){const slug=checkout.draft.slug;track('payment_initiated',{packageId:slug,price:checkout.draft.amount,activeMs:activeTime(slug)},measurement(slug));clockPause(slug,true,'gateway');try{await openPaymentInternal(checkout,onUpdate,onMessage)}finally{clockPause(slug,false,'gateway')}}
export function PaymentPanel({id,access,draft,order,gatewayKey,onUpdate,onRestart,locked=false,state,expires}:{id:string;access:string;draft:Draft;order:string;gatewayKey?:string;onUpdate:()=>void|Promise<void>;onRestart?:()=>void|Promise<void>;locked?:boolean;state?:string;expires?:number}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[now,setNow]=useState(Date.now()),paying=useRef(false),view=paymentState(state,expires,now);
 useEffect(()=>{if(!expires)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[expires]);
 async function run(action:()=>Promise<void>){if(paying.current)return;paying.current=true;setBusy(true);setMessage('');try{await action()}catch(e){setMessage((e as Error).message);try{await onUpdate()}catch{}}finally{paying.current=false;setBusy(false)}}
 async function pay(){await run(()=>openPayment({id,access,draft,order,key:gatewayKey},onUpdate,setMessage))}
 async function demo(outcome:string){await run(async()=>{await bookingApi({action:'prepare',id,access});await bookingApi({action:'demo',id,access,outcome});setMessage(outcome==='pending'?'Payment pending. No ticket has been issued.':outcome==='failed'?'Payment failed. Retry when you are ready.':'');await onUpdate()})}
 return <div className='payment-panel' aria-busy={busy||locked}><h3>{view.title}</h3><p>{draft.kind==='balance'&&view.restart?'This balance checkout needs operator review before a new payment. Your original booking is saved.':view.message}</p>{draft.mode!=='live'&&<p className='fine'>{draft.mode==='demo'?'Demo only · no real charge or travel reservation.':'Test mode · no real charge.'}</p>}{view.pay&&<button className='button' disabled={busy||locked||!order} onClick={pay}>{busy||locked?'Processing…':draft.mode==='demo'?`Complete ${money(draft.amount)} demo payment`:`Pay ${money(draft.amount)}`}</button>}<button className='text-button' disabled={busy||locked} onClick={()=>run(async()=>{await onUpdate()})}>Check payment status</button>{draft.mode==='demo'&&view.pay&&<details className='payment-tests'><summary>Test other payment outcomes</summary><div className='demo-outcomes'><button disabled={busy||locked} onClick={()=>demo('pending')}>Simulate pending</button><button disabled={busy||locked} onClick={()=>demo('failed')}>Simulate failed</button></div></details>}{(view.restart||view.pay)&&onRestart&&draft.kind==='token'&&<button className='button secondary' disabled={busy||locked} onClick={()=>run(async()=>{await onRestart()})}>{view.restart?'Start a fresh checkout':'Change trip details'}</button>}{message&&<p role='status' className='booking-feedback'>{message}</p>}</div>
}
