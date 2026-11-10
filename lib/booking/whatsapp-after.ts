import {after} from 'next/server';
import {db} from './db';
import {drainPaymentAlerts,whatsappSettings} from './whatsapp-alerts';

export function schedulePaymentAlerts(){
 if(!whatsappSettings())return;
 try{after(async()=>{try{await drainPaymentAlerts(await db())}catch{/* The durable queue remains available for review/retry. */}})}catch{/* Direct service tests do not have a request lifecycle. */}
}
