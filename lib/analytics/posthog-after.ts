import {after} from 'next/server';
import {posthogServerConfigured,drainPosthogOutbox} from './posthog-server';
import {analyticsDb} from './server';
/** Response lifecycle is extended by Next.js; no network waits in checkout/payment handlers. */
export function schedulePosthogDelivery(){if(!posthogServerConfigured())return;try{after(async()=>{try{await drainPosthogOutbox(await analyticsDb())}catch{}})}catch{/* Direct service tests and non-request contexts do not have after(). */}}
