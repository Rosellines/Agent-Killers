import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {runCommand,commandExists} from './core.js';
import {dockerAvailable,assertPinnedFile,strictOfficialMode} from './security.js';

export const DEFAULT_LIMITS={memory:'768m',cpus:'1.5',pids:'128',tmpfs:'64m',nofile:'1024:2048',workspaceBytes:256*1024*1024};
const HEX64=/^[0-9a-f]{64}$/i;
function publicErr(message,code,status=503){return Object.assign(new Error(message),{publicCode:code,status});}
export async function assertOfficialContainerAvailable(){
  if(process.platform!=='linux'||!(await dockerAvailable())) throw publicErr('official execution requires Linux Docker isolation','official_container_required');
  const seccomp=process.env.AK_SECCOMP_PROFILE;if(!seccomp)throw publicErr('official execution requires a pinned seccomp profile','seccomp_profile_required');
  const apparmor=process.env.AK_APPARMOR_PROFILE;if(!apparmor)throw publicErr('official execution requires an explicit AppArmor profile','apparmor_profile_required');
  if(strictOfficialMode()){
    if(!HEX64.test(String(process.env.AK_SECCOMP_SHA256||'')))throw publicErr('official execution requires AK_SECCOMP_SHA256','seccomp_hash_required');
    await assertPinnedFile(seccomp,process.env.AK_SECCOMP_SHA256,'seccomp profile');
    if(process.env.AK_APPARMOR_SHA256){ if(!HEX64.test(process.env.AK_APPARMOR_SHA256))throw publicErr('invalid AppArmor SHA-256 pin','apparmor_hash_invalid'); const apparmorProfilePath=process.env.AK_APPARMOR_PROFILE_PATH;if(!apparmorProfilePath)throw publicErr('official execution requires AK_APPARMOR_PROFILE_PATH','apparmor_profile_path_required');await assertPinnedFile(apparmorProfilePath,process.env.AK_APPARMOR_SHA256,'AppArmor profile'); }else throw publicErr('official execution requires AK_APPARMOR_SHA256','apparmor_hash_required');
    const image=process.env.AK_AGENT_CONTAINER_IMAGE;if(!image||!/@sha256:[0-9a-f]{64}$/i.test(image))throw publicErr('official agent image must be pinned by digest','image_digest_required');const evaluatorImage=process.env.AK_EVALUATOR_CONTAINER_IMAGE;if(!evaluatorImage||!/@sha256:[0-9a-f]{64}$/i.test(evaluatorImage))throw publicErr('official evaluator image must be pinned by digest','evaluator_image_digest_required');
  }
  return true;
}
function imageFor(agent){const image=agent.image||process.env.AK_AGENT_CONTAINER_IMAGE; if(!image)throw publicErr('agent image is required','image_required',400);return image;}
export function validateMounts(extra){for(const m of extra||[]){if(!m?.source||!m?.target)throw publicErr('invalid extra mount','invalid_mount',400);if(!path.posix.isAbsolute(String(m.target)))throw publicErr('container mount target must be absolute','invalid_mount_target',400);if(m.readonly===false)throw publicErr('read-write extra mounts are forbidden','rw_mount_forbidden',400);if(m.target==='/workspace'||m.target.startsWith('/proc')||m.target.startsWith('/sys')||m.target.startsWith('/dev')||m.target==='/var/run/docker.sock')throw publicErr('protected container mount target forbidden','workspace_mount_forbidden',400);}}
function mountFlags(m){return `${path.resolve(m.source)}:${m.target}:ro,nosuid,nodev,noexec`}
async function dockerExec(name,user,command,args,env,timeoutMs,maxOutputBytes){const dockerEnv=[];for(const[k,v]of Object.entries(env||{})){if(v!==undefined&&v!==null)dockerEnv.push('-e',`${k}=${v}`)}return runCommand('docker',['exec','-u',user,...dockerEnv,'-w','/workspace',name,command,...args],{timeoutMs,maxOutputBytes,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}});}
const NETWORK_PROBE_CODE=`import dns from 'node:dns/promises';import net from 'node:net';import http from 'node:http';import fs from 'node:fs';const out={dns:false,tcp4:false,tcp6:false,http:false,dockerSocket:false};try{await dns.lookup('example.com');out.dns=true}catch{}await new Promise(r=>{const x=net.createConnection({host:'1.1.1.1',port:53,timeout:1000});x.once('connect',()=>{out.tcp4=true;x.destroy();r()});x.once('error',()=>r());x.once('timeout',()=>{x.destroy();r()})});await new Promise(r=>{const x=net.createConnection({host:'2606:4700:4700::1111',port:53,timeout:1000});x.once('connect',()=>{out.tcp6=true;x.destroy();r()});x.once('error',()=>r());x.once('timeout',()=>{x.destroy();r()})});await new Promise(r=>{const x=http.get('http://example.com',()=>{out.http=true;x.destroy();r()});x.setTimeout(1000,()=>{x.destroy();r()});x.once('error',()=>r())});try{fs.accessSync('/var/run/docker.sock');out.dockerSocket=true}catch{};console.log(JSON.stringify(out));`;
async function probeNetworkInExistingContainer(name,user){
  const r=await dockerExec(name,user,process.env.AK_NODE_BINARY||'node',['--input-type=module','-e',NETWORK_PROBE_CODE],{},8000,32*1024);
  const line=String(r.stdout||'').trim().split(/\n/).pop()||'';let evidence=null;try{evidence=JSON.parse(line)}catch{}
  if(!evidence) return {available:true,blocked:false,verified:false,evidence:null,exitCode:r.code,executionCode:r.code,reason:'invalid_evidence'};
  const blocked=Object.entries(evidence).every(([k,v])=>k==='dockerSocket'?v===false:v===false);
  return {available:true,blocked,verified:r.code===0&&blocked,evidence,exitCode:r.code,executionCode:r.code};
}
export async function runInContainer({agent,command,args=[],cwd,timeoutMs=180000,maxOutputBytes=512*1024,limits=DEFAULT_LIMITS,network='none',extraMounts=[],env={},verifyNetworkIsolation=false}){
  await assertOfficialContainerAvailable(); if(network!=='none')throw publicErr('official agent containers must use network=none','network_policy_violation',400); validateMounts(extraMounts);
  const source=path.resolve(cwd);await fs.access(source);const image=imageFor(agent);const name=`agent-killer-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const seccomp=path.resolve(process.env.AK_SECCOMP_PROFILE),apparmor=process.env.AK_APPARMOR_PROFILE;const user='10000:10000';const workspaceSize=Math.max(64*1024*1024,Number(limits.workspaceBytes||DEFAULT_LIMITS.workspaceBytes));
  const createArgs=['create','--init','--name',name,'--network','none','--memory',String(limits.memory),'--memory-swap',String(limits.memory),'--cpus',String(limits.cpus),'--pids-limit',String(limits.pids),'--ulimit',`nofile=${limits.nofile}`,'--cap-drop','ALL','--security-opt','no-new-privileges:true',`seccomp=${seccomp}`,`--security-opt`,`apparmor=${apparmor}`,'--ipc','private','--pid','private','--uts','private','--read-only','--tmpfs',`/workspace:rw,nosuid,nodev,noexec,size=${workspaceSize}`,'--tmpfs',`/tmp:rw,nosuid,nodev,noexec,size=${limits.tmpfs}`,'--user',user];
  for(const m of extraMounts)createArgs.push('--mount',mountFlags(m)); createArgs.push(image,'sleep','infinity');
  let created=false;let started=false;let exec={code:null,signal:null,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'',stderr:'',durationMs:0};
  try{const cr=await runCommand('docker',createArgs,{timeoutMs:30000,maxOutputBytes:128*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}});if(cr.code!==0)throw publicErr('container creation failed','container_create_failed');created=true;const st=await runCommand('docker',['start',name],{timeoutMs:30000,maxOutputBytes:128*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}});if(st.code!==0)throw publicErr('container start failed','container_start_failed');started=true;
    const cpIn=await runCommand('docker',['cp',`${source}${path.sep}.`,`${name}:/workspace/`],{timeoutMs:60000,maxOutputBytes:128*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}});if(cpIn.code!==0)throw publicErr('workspace import failed','workspace_import_failed');
    exec=await dockerExec(name,user,command,args,env,timeoutMs,maxOutputBytes);
    let networkEvidence=null;
    if(verifyNetworkIsolation&&network==='none'&&started&&!exec.timedOut&&!exec.resourceLimitExceeded){networkEvidence=await probeNetworkInExistingContainer(name,user);}
    if(exec.timedOut||exec.tooMuchOutput||exec.resourceLimitExceeded)await runCommand('docker',['kill',name],{timeoutMs:10000,maxOutputBytes:64*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}}).catch(()=>{});
    const cpOut=await runCommand('docker',['cp',`${name}:/workspace/.`,`${source}${path.sep}`],{timeoutMs:60000,maxOutputBytes:128*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}});if(cpOut.code!==0&&started&&!exec.timedOut)exec={...exec,resourceLimitExceeded:true,stderr:`${exec.stderr}\nworkspace export failed`.trim()};
    return{...exec,sandbox:{isolated:true,networkPolicy:'none',networkIsolationVerified:Boolean(networkEvidence?.verified),networkEvidence,networkEnforced:network==='none',image,limits,workspaceMode:'container-tmpfs-export',dockerSocketMounted:false,extraMounts:extraMounts.length,security:{seccompPinned:true,apparmorPinned:true,noNewPrivileges:true,capDropAll:true,privateNamespaces:true,readOnlyRootfs:true,workspaceTmpfs:true,nonRoot:true}}};
  }finally{if(created)await runCommand('docker',['rm','-f',name],{timeoutMs:15000,maxOutputBytes:64*1024,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''}}).catch(()=>{});}
}

export async function probeNetworkIsolation({agent,limits=DEFAULT_LIMITS}={}){
  const tmp=await fs.mkdtemp(path.join(process.env.TMPDIR||'/tmp','ak-netprobe-'));
  try{const r=await runInContainer({agent,command:process.env.AK_NODE_BINARY||'node',args:['--input-type=module','-e',NETWORK_PROBE_CODE],cwd:tmp,timeoutMs:8000,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''},maxOutputBytes:32*1024,limits,network:'none'});return r.sandbox?.networkEvidence||{available:true,blocked:false,verified:false,evidence:null,exitCode:r.code};}
  finally{await fs.rm(tmp,{recursive:true,force:true}).catch(()=>{});}
}
export function containerLimitsFromEnv(){return{...DEFAULT_LIMITS,memory:process.env.AK_CONTAINER_MEMORY||DEFAULT_LIMITS.memory,cpus:Number(process.env.AK_CONTAINER_CPUS||DEFAULT_LIMITS.cpus),pids:Number(process.env.AK_CONTAINER_PIDS||DEFAULT_LIMITS.pids),tmpfs:process.env.AK_CONTAINER_TMPFS||DEFAULT_LIMITS.tmpfs,nofile:process.env.AK_CONTAINER_NOFILE||DEFAULT_LIMITS.nofile,workspaceBytes:Number(process.env.AK_CONTAINER_WORKSPACE_BYTES||DEFAULT_LIMITS.workspaceBytes)}}
