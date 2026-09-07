import {runCommand,commandExists} from './core.js';
export async function dockerAvailable(){return process.platform==='linux'&&await commandExists('docker')&&(await runCommand('docker',['info','--format','{{.ServerVersion}}'],{timeoutMs:10000,maxOutputBytes:32*1024})).code===0;}
export async function requireOfficialSandbox(){if(!(await dockerAvailable()))throw new Error('Official execution requires Docker with a healthy daemon');}
// Legacy helper intentionally returns a hardened, non-bind-mounted container spec.
// It is not the execution path; src/container.js is authoritative.
export function dockerAgentArgs({image,command,args=[],cpus=1,memory='1g',pids=256}={}){
  if(!image||!command)throw new Error('container image and command are required');
  const workspaceBytes=Number(process.env.AK_CONTAINER_WORKSPACE_BYTES||256*1024*1024);
  const seccomp=process.env.AK_SECCOMP_PROFILE||'/etc/agent-killer/seccomp.json'; const apparmor=process.env.AK_APPARMOR_PROFILE||'agent-killer';
  return ['run','--rm','--init','--network','none','--cpus',String(cpus),'--memory',String(memory),'--memory-swap',String(memory),'--pids-limit',String(pids),'--cap-drop','ALL','--security-opt','no-new-privileges:true',`--security-opt`,`seccomp=${seccomp}`,`--security-opt`,`apparmor=${apparmor}`,'--ipc','private','--pid','private','--uts','private','--read-only','--tmpfs',`/workspace:rw,nosuid,nodev,noexec,size=${workspaceBytes}`,'--tmpfs','/tmp:rw,nosuid,nodev,noexec,size=64m','--user','10000:10000',image,command,...args];
}
