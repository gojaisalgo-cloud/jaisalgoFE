import {readFileSync,writeFileSync,existsSync,chmodSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import readline from 'node:readline/promises';
import {Writable} from 'node:stream';
let muted=false;const output=new Writable({write(chunk,encoding,done){if(!muted)process.stdout.write(chunk);done()}});
const rl=readline.createInterface({input:process.stdin,output,terminal:true});
process.stdout.write('Create a local admin password (12+ characters; input hidden): ');muted=true;const password=await rl.question('');muted=false;rl.close();process.stdout.write('\n');
if(password.length<12||/[$\\"'\r\n]/.test(password)){process.stderr.write('Use at least 12 characters. No changes made.\n');process.exit(1)}
let env=existsSync('.env.local')?readFileSync('.env.local','utf8'):'';env=env.split('\n').filter(l=>!l.startsWith('ADMIN_PASSWORD=')&&!l.startsWith('ADMIN_SESSION_SECRET=')).join('\n');
writeFileSync('.env.local',env+'\nADMIN_PASSWORD='+JSON.stringify(password)+'\nADMIN_SESSION_SECRET='+randomBytes(32).toString('hex')+'\n',{mode:0o600});
chmodSync('.env.local',0o600);
process.stdout.write('Admin configured. Restart the server, then open /admin.\n');
