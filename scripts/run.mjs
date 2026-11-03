// Pin child processes to the Node runtime that launched npm. This prevents an
// ancestor node_modules/.bin/node from silently changing version/architecture.
import {spawn} from 'node:child_process';
import path from 'node:path';
const runtime=process.env.npm_node_execpath||process.execPath;
const bins={dev:['next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1'],build:['next/dist/bin/next','build','--webpack'],start:['next/dist/bin/next','start','--hostname','127.0.0.1'],typecheck:['typescript/bin/tsc','--noEmit'],lint:['eslint/bin/eslint.js','.'],test:['--import','tsx','--test','tests/domain.test.ts','tests/booking.test.ts','tests/analytics.test.ts','tests/hosting.test.ts'],'test:browser':['@playwright/test/cli.js','test']};
const [command,...extra]=process.argv.slice(2);const spec=bins[command];if(!spec)throw new Error('Unknown project command');
const child=spawn(runtime,[spec[0].startsWith('--')?spec[0]:path.join(process.cwd(),'node_modules',spec[0]),...spec.slice(1),...extra],{stdio:'inherit',env:{...process.env,...(command==='dev'?{WATCHPACK_POLLING:'1000'}:{}),PATH:path.dirname(runtime)+path.delimiter+process.env.PATH}});
child.on('exit',(code)=>process.exit(code??1));child.on('error',error=>{console.error(error.message);process.exit(1)});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
