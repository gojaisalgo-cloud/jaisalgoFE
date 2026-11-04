import {loadEnvConfig} from '@next/env';
import {spawn} from 'node:child_process';
loadEnvConfig(process.cwd());
const runtime=process.env.npm_node_execpath||process.execPath;
const script=`const {analyticsDb}=require('./lib/analytics/server');const {posthogServerConfigured,drainPosthogOutbox}=require('./lib/analytics/posthog-server');(async()=>{if(!posthogServerConfigured())throw Error('PostHog configuration is missing.');const c=await analyticsDb();try{console.log(await drainPosthogOutbox(c))}finally{c.close()}})().catch(e=>{console.error(e.message);process.exitCode=1});`;
const child=spawn(runtime,['--import','tsx','-e',script],{stdio:'inherit',env:process.env});
child.on('exit',code=>process.exit(code??1));
child.on('error',error=>{console.error(error.message);process.exit(1)});
