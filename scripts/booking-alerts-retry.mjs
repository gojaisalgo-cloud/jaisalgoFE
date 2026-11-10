import {loadEnvConfig} from '@next/env';
import {spawn} from 'node:child_process';
loadEnvConfig(process.cwd());
const runtime=process.env.npm_node_execpath||process.execPath;
const script=`const {db}=require('./lib/booking/db');const {whatsappSettings,drainPaymentAlerts}=require('./lib/booking/whatsapp-alerts');(async()=>{if(!whatsappSettings())throw Error('WhatsApp sender configuration is missing.');const c=await db();try{console.log(await drainPaymentAlerts(c))}finally{c.close()}})().catch(()=>{console.error('Could not process booking alerts. Check sender configuration and queue status.');process.exitCode=1});`;
const child=spawn(runtime,['--import','tsx','-e',script],{stdio:'inherit',env:process.env});
child.on('exit',code=>process.exit(code??1));
child.on('error',()=>{console.error('Could not start booking alert worker.');process.exit(1)});
