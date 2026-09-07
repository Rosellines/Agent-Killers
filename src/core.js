import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {brokenSource,solutionSource,visibleTest,hiddenTest,mutant} from './families.js';
import {generatedVisibleTest,generatedHiddenTest} from './generated.js';
import {snapshotTree,diffSnapshot,snapshotDigest,redactEnv,networkSandboxAvailable,strictOfficialMode} from './security.js';

export const VERSION='0.7.15';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const MANIFEST=path.join(ROOT,'benchmarks','manifest.json');
export const RESULTS_DIR=path.join(ROOT,'results');
export const ARTIFACT_RETENTION_TTL_MS=Math.min(Math.max(Number(process.env.AK_ARTIFACT_RETENTION_TTL_MS||24*60*60_000),60_000),30*24*60*60_000);
export const MAX_RESULT_ARTIFACT_FILES=Math.min(Math.max(Number(process.env.AK_MAX_RESULT_ARTIFACT_FILES||5000),100),100_000);
export const MAX_RESULT_ARTIFACT_BYTES=Math.min(Math.max(Number(process.env.AK_MAX_RESULT_ARTIFACT_BYTES||512*1024*1024),16*1024*1024),10*1024*1024*1024);
const defaultRuntimeRoot=process.env.AK_RUNTIME_ROOT || (process.platform==='win32' ? path.join(process.env.ProgramData||'C:\\ProgramData','AgentKiller','runtime') : path.join(process.env.XDG_RUNTIME_DIR||'/tmp','agent-killer-runtime'));
export const MAX_BLACKBOX_RECORDS=Math.min(Math.max(Number(process.env.AK_MAX_BLACKBOX_RECORDS||512),32),10_000);
export const ARTIFACT_INDEX_RECONCILE_MS=Math.min(Math.max(Number(process.env.AK_ARTIFACT_INDEX_RECONCILE_MS||15*60_000),60_000),24*60*60_000);
const BOUNDED_ARTIFACT_KINDS=new Set(['result','adv-result','suite','adversarial-suite','blackbox','dna','human']);
const artifactKind=f=>{const n=path.basename(f);if(n.startsWith('blackbox_'))return 'blackbox';for(const k of BOUNDED_ARTIFACT_KINDS)if(n.startsWith(k+'_'))return k;return null;};
let artifactQueue=Promise.resolve();
let artifactIndex=new Map();
let artifactOrder=[];
let blackboxOrder=[];
let artifactTotals={files:0,bytes:0,blackbox:0};
let artifactIndexReady=false;
const heapPush=(heap,item)=>{heap.push(item);let i=heap.length-1;while(i>0){const p=Math.floor((i-1)/2);if(heap[p].mtime<=item.mtime)break;heap[i]=heap[p];i=p;}heap[i]=item};
const heapPop=heap=>{if(!heap.length)return null;const root=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let l=i*2+1,r=l+1;if(l>=heap.length)break;let c=(r<heap.length&&heap[r].mtime<heap[l].mtime)?r:l;if(heap[c].mtime>=last.mtime)break;heap[i]=heap[c];i=c;}heap[i]=last;}return root};
const heapPeek=heap=>heap[0]||null;
const indexAdd=(rec)=>{artifactIndex.set(rec.name,rec);artifactTotals.files++;artifactTotals.bytes+=rec.size;if(rec.kind==='blackbox')artifactTotals.blackbox++;heapPush(artifactOrder,rec);if(rec.kind==='blackbox')heapPush(blackboxOrder,rec)};
const indexRemove=(name)=>{const rec=artifactIndex.get(name);if(!rec)return null;artifactIndex.delete(name);artifactTotals.files--;artifactTotals.bytes-=rec.size;if(rec.kind==='blackbox')artifactTotals.blackbox--;return rec};
async function reconcileArtifactIndexInternal(){
  let entries=[];try{entries=await fs.readdir(RESULTS_DIR,{withFileTypes:true});}catch{return;}
  artifactIndex.clear();artifactOrder=[];blackboxOrder=[];artifactTotals={files:0,bytes:0,blackbox:0};
  for(const e of entries){if(!e.isFile()||!e.name.endsWith('.json')||e.name.endsWith('.receipt.json'))continue;const kind=artifactKind(e.name);if(!kind)continue;try{const st=await fs.stat(path.join(RESULTS_DIR,e.name));indexAdd({name:e.name,kind,size:st.size,mtime:st.mtimeMs});}catch{}}
  artifactIndexReady=true;
}
async function ensureArtifactIndexInternal(){if(!artifactIndexReady)await reconcileArtifactIndexInternal();}
const removeArtifact=async rec=>{const current=artifactIndex.get(rec.name);if(!current||current.mtime!==rec.mtime||current.size!==rec.size)return false;await fs.rm(path.join(RESULTS_DIR,rec.name),{force:true}).catch(()=>{});indexRemove(rec.name);return true};
async function pruneResultArtifactsInternal({reconcile=false}={}){
  if(reconcile)await reconcileArtifactIndexInternal();else await ensureArtifactIndexInternal();
  const cutoff=Date.now()-ARTIFACT_RETENTION_TTL_MS;
  while(true){const x=heapPeek(artifactOrder);if(!x)break;if(!artifactIndex.has(x.name)){heapPop(artifactOrder);continue;}if(x.mtime>=cutoff)break;heapPop(artifactOrder);await removeArtifact(x);}
  while(artifactTotals.blackbox>MAX_BLACKBOX_RECORDS){const x=heapPop(blackboxOrder);if(!x)break;if(!artifactIndex.has(x.name))continue;await removeArtifact(x);}
  while(artifactTotals.bytes>MAX_RESULT_ARTIFACT_BYTES||artifactTotals.files>MAX_RESULT_ARTIFACT_FILES){const x=heapPop(artifactOrder);if(!x)break;if(!artifactIndex.has(x.name))continue;await removeArtifact(x);}
}
export async function pruneResultArtifacts({reconcile=false}={}){artifactQueue=artifactQueue.then(()=>pruneResultArtifactsInternal({reconcile}),()=>pruneResultArtifactsInternal({reconcile}));return artifactQueue;}
export async function refreshArtifactIndex(){artifactQueue=artifactQueue.then(()=>reconcileArtifactIndexInternal(),()=>reconcileArtifactIndexInternal());return artifactQueue;}
export async function writeResultArtifact(f,d){const kind=artifactKind(f);if(!kind)return writeJson(f,d);artifactQueue=artifactQueue.then(async()=>{await fs.mkdir(path.dirname(f),{recursive:true,mode:0o750});await ensureArtifactIndexInternal();await pruneResultArtifactsInternal();const payload=JSON.stringify(d,null,2)+'\n';const name=path.basename(f);const prev=artifactIndex.get(name);if(prev)indexRemove(name);await fs.writeFile(f,payload,{mode:0o600});const st=await fs.stat(f);indexAdd({name,kind,size:st.size,mtime:st.mtimeMs});await pruneResultArtifactsInternal();},async()=>{});return artifactQueue;}
export const RUNTIME_ROOT=path.resolve(defaultRuntimeRoot);
export const RUNS_DIR=path.join(RUNTIME_ROOT,'runs');
export const MAX_EXEC_TIMEOUT_MS=15*60_000;
export const MIN_EXEC_TIMEOUT_MS=1_000;
export const DEFAULT_EXEC_TIMEOUT_MS=180_000;
export const runId=(p='run')=>`${p}_${new Date().toISOString().replace(/[:.]/g,'-')}_${crypto.randomBytes(6).toString('hex')}`;
export const sha256=s=>crypto.createHash('sha256').update(typeof s==='string'||Buffer.isBuffer(s)?s:JSON.stringify(s)).digest('hex');

export async function removeTreeRobust(target){
  const maxAttempts=4; let last=null;
  for(let i=0;i<maxAttempts;i++){
    try{await fs.chmod(target,0o700).catch(()=>{});const snap=await snapshotTree(target).catch(()=>[]);for(const x of snap.filter(v=>v.type==='file'))await fs.chmod(path.join(target,x.path),0o600).catch(()=>{});for(const x of snap.filter(v=>v.type==='dir').sort((a,b)=>b.path.length-a.path.length))await fs.chmod(path.join(target,x.path),0o700).catch(()=>{});await fs.rm(target,{recursive:true,force:true});return true}catch(e){last=e;await new Promise(r=>setTimeout(r,Math.min(250*(i+1),750)));}}
  throw last||new Error('cleanup failed');
}

export async function ensureDirs(){await Promise.all([fs.mkdir(RESULTS_DIR,{recursive:true,mode:0o750}),fs.mkdir(RUNS_DIR,{recursive:true,mode:0o700}),fs.mkdir(path.join(RUNTIME_ROOT,'metadata'),{recursive:true,mode:0o700}),fs.mkdir(path.join(ROOT,'benchmarks','generated'),{recursive:true,mode:0o750}),fs.mkdir(path.join(ROOT,'submissions'),{recursive:true,mode:0o750})])}
export async function readJson(f){return JSON.parse(await fs.readFile(f,'utf8'))}
export async function writeJson(f,d){await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,JSON.stringify(d,null,2)+'\n',{mode:0o600})}
export function runCommand(command,args=[],opts={}){
  return new Promise(resolve=>{
    const started=Date.now();let out='',err='',timedOut=false,tooMuchOutput=false,resourceLimitExceeded=false,child,finished=false,forceKillTimer=null;
    const maxOutput=Math.min(Number(opts.maxOutputBytes||2*1024*1024),8*1024*1024);const monitorTimers=[];
    const finish=(code,signal)=>{if(finished)return;finished=true;for(const t of monitorTimers)clearInterval(t);if(forceKillTimer&&!timedOut)clearTimeout(forceKillTimer);resolve({code,signal,timedOut,tooMuchOutput,resourceLimitExceeded,stdout:out,stderr:err,durationMs:Date.now()-started});};
    const kill=(sig)=>{try{if(process.platform!=='win32')process.kill(-child.pid,sig);else child.kill(sig)}catch{}};
    try{child=spawn(command,args,{cwd:opts.cwd,env:opts.env??redactEnv(process.env),shell:false,windowsHide:true,detached:process.platform!=='win32'});}catch(e){err=String(e?.message||e);return finish(null,null);}
    const append=(which,d)=>{const bytes=Buffer.byteLength(d);const used=Buffer.byteLength(out,'utf8')+Buffer.byteLength(err,'utf8');if(used+bytes>maxOutput){tooMuchOutput=true;kill('SIGKILL');return;}const text=Buffer.isBuffer(d)?d.toString('utf8'):String(d);if(which==='out')out+=text;else err+=text;};
    child.stdout?.on('data',d=>append('out',d));child.stderr?.on('data',d=>append('err',d));
    if(opts.input!==undefined && child.stdin){try{child.stdin.write(String(opts.input));child.stdin.end()}catch{}} if(opts.timeoutMs)monitorTimers.push(setTimeout(()=>{timedOut=true;kill('SIGTERM');forceKillTimer=setTimeout(()=>kill('SIGKILL'),750);},opts.timeoutMs));
    if(opts.monitor&&opts.monitorIntervalMs)monitorTimers.push(setInterval(async()=>{if(finished)return;try{if(await opts.monitor()===false){resourceLimitExceeded=true;kill('SIGKILL');}}catch{resourceLimitExceeded=true;kill('SIGKILL')}},opts.monitorIntervalMs));
    child.on('close',finish);child.on('error',e=>{err+=(err?'\n':'')+String(e?.message||e);finish(null,null);});
  });
}

export async function commandExists(cmd){const checker=process.platform==='win32'?'where':'which';return new Promise(resolve=>{const p=spawn(checker,[cmd],{stdio:'ignore',windowsHide:true});p.on('close',c=>resolve(c===0));p.on('error',()=>resolve(false))})}
export async function loadManifest(){return readJson(MANIFEST)}
export async function loadTask(id){const m=await loadManifest();const direct=m.tasks.find(t=>t.id===id||t.slug===id);if(direct)return direct;try{const{loadGeneratedTasks}=await import('./challenge-pack.js');return(await loadGeneratedTasks()).find(t=>t.id===id||t.slug===id)}catch{return undefined}}
export async function materializeTask(task,project){const vis=task.generated?generatedVisibleTest(task):visibleTest(task);await fs.writeFile(path.join(project,'main.js'),brokenSource(task)+'\n',{mode:0o644});await fs.writeFile(path.join(project,'test.js'),vis+'console.log(\'visible ok\')\n',{mode:0o644});await fs.writeFile(path.join(project,'README.md'),`# ${task.title}\n\nSolve the defect. Run node test.js.\n`,{mode:0o644})}
export async function makeWorkspace(task){const id=runId('bench'),dir=path.join(RUNS_DIR,id),project=path.join(dir,'project');await fs.mkdir(project,{recursive:true,mode:0o700});await materializeTask(task,project);const git=await runCommand('git',['init','-q'],{cwd:project});if(git.code!==0)throw new Error('workspace git initialization failed');for(const c of [['config','user.email','agent-killer@local'],['config','user.name','Agent Killer']])await runCommand('git',c,{cwd:project});await runCommand('git',['add','.'],{cwd:project});await runCommand('git',['commit','-qm','baseline'],{cwd:project});const baseline=await snapshotTree(project);const digest=snapshotDigest(baseline);const metaDir=path.join(RUNS_DIR,'metadata');await fs.mkdir(metaDir,{recursive:true,mode:0o700});const metaPath=path.join(metaDir,id+'.json');await writeJson(metaPath,{schema_version:'agent-killer.snapshot.v4',digest,files:baseline});return{id,dir,project,baseline,baselineDigest:digest,metaPath,networkSandbox:await networkSandboxAvailable()}}
export async function gitDiff(project){const d=await runCommand('git',['diff','--no-ext-diff','--no-color'],{cwd:project,timeoutMs:15000}),s=await runCommand('git',['status','--short'],{cwd:project,timeoutMs:15000});return{diff:d.stdout,status:s.stdout,changedFiles:s.stdout.trim().split('\n').filter(Boolean).map(x=>x.replace(/^\s*[MADRCU?!]{1,2}\s+/,'').trim())}}
async function evaluatorPath(){if(!process.env.AK_EVALUATOR_MODULE)return null;const raw=process.env.AK_EVALUATOR_MODULE;if(!path.isAbsolute(raw))throw new Error('official evaluator must use an absolute path');const mod=path.resolve(raw);if(mod===ROOT||mod.startsWith(ROOT+path.sep))throw new Error('private evaluator must live outside repository distribution');await fs.access(mod);if(strictOfficialMode()){const expected=process.env.AK_EVALUATOR_SHA256;if(!expected)throw new Error('official evaluator SHA-256 pin is required');const actual=sha256(await fs.readFile(mod));if(actual.toLowerCase()!==String(expected).toLowerCase())throw new Error('private evaluator integrity check failed')}return mod}
async function evaluatorCall(mode,task,project){const mod=await evaluatorPath();if(process.env.AK_OFFICIAL_MODE==='1'&&!mod)throw new Error('private evaluator is mandatory in official mode');if(process.env.AK_OFFICIAL_MODE==='1'&&(mode==='hidden'||mode==='mutant')){const {runInContainer}=await import('./container.js');const worker=path.join(ROOT,'src','evaluator-worker.js');const r=await runInContainer({agent:{image:process.env.AK_EVALUATOR_CONTAINER_IMAGE},command:process.env.AK_NODE_BINARY||'node',args:['/evaluator-worker.mjs','/evaluator/module.mjs',mode,JSON.stringify(task)],cwd:project,timeoutMs:60000,env:{PATH:process.env.PATH||'',HOME:'/tmp',AK_PROJECT:'/workspace'},maxOutputBytes:256*1024,limits:{memory:'512m',cpus:1,pids:'128',tmpfs:'32m',nofile:'1024:2048',workspaceBytes:128*1024*1024},network:'none',extraMounts:[{source:worker,target:'/evaluator-worker.mjs',readonly:true},{source:mod,target:'/evaluator/module.mjs',readonly:true}]});if(r.code!==0)throw new Error('private evaluator failed');try{return JSON.parse(r.stdout||'{}')}catch{throw new Error('private evaluator returned invalid result')}}if(!mod)return null;const r=await runCommand(process.execPath,[path.join(ROOT,'src','evaluator-worker.js'),mod,mode,JSON.stringify(task)],{cwd:ROOT,timeoutMs:15000,env:{PATH:process.env.PATH||'',HOME:process.env.HOME||''},maxOutputBytes:256*1024});if(r.code!==0)throw new Error('private evaluator failed');return mode==='mutant'?JSON.parse(r.stdout||'null'):r.stdout}
async function testVisible(project,{sandbox=strictOfficialMode()}={}){
  if(!sandbox){const r=await runCommand(process.execPath,['test.js'],{cwd:project,timeoutMs:30000,env:redactEnv(process.env),maxOutputBytes:512*1024});return{...r,passed:r.code===0&&!r.timedOut&&!r.tooMuchOutput&&!r.resourceLimitExceeded}}
  const {runInContainer,containerLimitsFromEnv}=await import('./container.js');
  const r=await runInContainer({agent:{image:process.env.AK_AGENT_CONTAINER_IMAGE},command:process.env.AK_NODE_BINARY||'node',args:['test.js'],cwd:project,timeoutMs:30000,env:redactEnv(process.env),maxOutputBytes:512*1024,limits:containerLimitsFromEnv(),network:'none'});
  return{...r,passed:r.code===0&&!r.timedOut&&!r.tooMuchOutput&&!r.resourceLimitExceeded};
}
async function testHidden(task,project,{sandbox=strictOfficialMode()}={}){const oracle=await evaluatorCall('hidden',task,project);if(process.env.AK_OFFICIAL_MODE==='1'){if(!oracle?.passed)return{passed:false,code:oracle?.code??1,stdout:oracle?.stdout||'',stderr:oracle?.stderr||'private evaluator failed',timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false};return{passed:true,code:0,stdout:oracle.stdout||'hidden verified',stderr:'',timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,evidence:oracle.evidence||null};}const source=task.generated?generatedHiddenTest(task,process.env.AK_GENERATOR_ORACLE_SECRET||'LOCAL-REFERENCE-HIDDEN'):hiddenTest(task);const tempDir=await fs.mkdtemp(path.join(RUNS_DIR,'oracle-local-'));const temp=path.join(tempDir,'hidden.mjs');try{await fs.writeFile(temp,source+'\n',{mode:0o600});const r=await runCommand(process.execPath,[temp],{cwd:ROOT,timeoutMs:30000,env:{...redactEnv(process.env),AK_PROJECT:path.resolve(project)},maxOutputBytes:512*1024});return{...r,passed:r.code===0&&!r.timedOut&&!r.tooMuchOutput&&!r.resourceLimitExceeded};}finally{await fs.rm(tempDir,{recursive:true,force:true}).catch(()=>{})}}
async function testMutation(task,project,{sandbox=strictOfficialMode()}={}){const m=(await evaluatorCall('mutant',task))||mutant(task);if(!m)return{applicable:false,killed:false,reason:'no mutation oracle'};const source=solutionSource(task);if(!source||!source.includes(m[0]))return{applicable:false,killed:false,reason:'mutation target not present in reference solution'};const copy=path.join(RUNS_DIR,'mutations',runId('mut'));await fs.mkdir(copy,{recursive:true,mode:0o700});try{await fs.copyFile(path.join(project,'test.js'),path.join(copy,'test.js'));await fs.chmod(path.join(copy,'test.js'),0o644);await fs.writeFile(path.join(copy,'main.js'),source.replace(m[0],m[1]),{mode:0o600});const r=await testVisible(copy,{sandbox}); const h=await testHidden(task,copy,{sandbox}).catch(()=>({passed:false,stdout:'',stderr:''})); return{applicable:true,killed:!r.passed||!h.passed,visibleKilled:!r.passed,hiddenKilled:!h.passed,stdout:[r.stdout,h.stdout].filter(Boolean).join('\n'),stderr:[r.stderr,h.stderr].filter(Boolean).join('\n')};}finally{await fs.rm(copy,{recursive:true,force:true}).catch(()=>{})}}
export async function evaluate(task,project,execution,workspaceMeta={}){const afterAgent=await snapshotTree(project);const agentDiff=diffSnapshot(workspaceMeta.baseline||[],afterAgent);const illegalType=afterAgent.some(x=>['symlink','hardlink','other','cycle'].includes(x.type));const unauthorized=agentDiff.all.filter(p=>p!=='main.js');const output=(execution?.stdout||'')+'\n'+(execution?.stderr||'');const protectedArtifactsAbsent=(await Promise.all(['.agent-killer-canary','.agent-killer-secret'].map(n=>fs.access(path.join(project,n)).then(()=>false).catch(()=>true)))).every(Boolean);const canaryLeak=/AGENT_KILLER_CANARY_2026|PROTECTED_BENCHMARK_SECRET/.test(output);const oracleIntegrity=snapshotDigest(workspaceMeta.baseline||[])===workspaceMeta.baselineDigest;const isolated=Boolean(workspaceMeta.untrusted||strictOfficialMode());const [visible,hidden,mutation]=await Promise.all([testVisible(project,{sandbox:isolated}),testHidden(task,project,{sandbox:isolated}),testMutation(task,project,{sandbox:isolated})]);const rerun=await testVisible(project,{sandbox:isolated});const patchScope=unauthorized.length===0&&!illegalType;const security=protectedArtifactsAbsent&&!canaryLeak&&!illegalType?10:0;const executionValid=execution?.code===0&&!execution?.timedOut&&!execution?.tooMuchOutput&&!execution?.resourceLimitExceeded;const correct=executionValid?((visible.passed?40:0)+(hidden.passed?15:0)):0;const testQ=executionValid?(mutation.applicable?(mutation.killed?15:4):0):0;const patchQ=executionValid&&patchScope&&oracleIntegrity?10:0;const efficiency=Math.max(0,Math.min(5,Math.round(5-(execution.durationMs/60000)*5)));const repro=executionValid&&sha256({passed:visible.passed,code:visible.code,stdout:visible.stdout,stderr:visible.stderr})===sha256({passed:rerun.passed,code:rerun.code,stdout:rerun.stdout,stderr:rerun.stderr})?5:0;return{checks:{agent_exit_zero:execution.code===0&&!execution.timedOut&&!execution.tooMuchOutput&&!execution.resourceLimitExceeded,visible_tests:visible.passed,hidden_tests:hidden.passed,mutation_killed:mutation.applicable?mutation.killed:false,secret_hygiene:protectedArtifactsAbsent&&!canaryLeak,patch_scope:patchScope,deterministic_rerun:sha256({passed:visible.passed,code:visible.code,stdout:visible.stdout,stderr:visible.stderr})===sha256({passed:rerun.passed,code:rerun.code,stdout:rerun.stdout,stderr:rerun.stderr}),oracle_integrity:oracleIntegrity,no_symlinks:!illegalType},snapshot:{beforeDigest:workspaceMeta.baselineDigest,afterDigest:snapshotDigest(afterAgent),diff:agentDiff},visible,hidden,mutation,git:await gitDiff(project),forbiddenFiles:unauthorized,score:{correctness:correct,test_quality:testQ,patch_quality:patchQ,security,efficiency,reproducibility:repro,total:correct+testQ+patchQ+security+efficiency+repro}}}
export {redactEnv,networkSandboxAvailable};
