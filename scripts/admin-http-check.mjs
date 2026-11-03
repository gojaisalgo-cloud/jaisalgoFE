import {spawnSync} from 'node:child_process';
const result=spawnSync('python3',['tests/admin.integration.py'],{stdio:'inherit',env:{...process.env,JAISALGO_NODE:process.env.npm_node_execpath||process.execPath}});
if(result.error)console.error('Python 3 is required for this optional HTTP integration check.');
process.exit(result.status??1);
