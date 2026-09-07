import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT, RUNS_DIR, RUNTIME_ROOT, sha256} from './core.js';

export const SNAPSHOT_LIMITS={maxEntries:60000,maxFiles:50000,maxDirs:10000,maxSymlinks:2048,maxHardlinks:2048,maxBytes:256*1024*1024,maxFileBytes:32*1024*1024};
export function isWithin(root,target){const base=path.resolve(root),r=path.resolve(root,target);return r===base||r.startsWith(base+path.sep)}
export async function assertWorkspacePath(root,target){const r=path.resolve(root,target);if(!isWithin(root,target))throw new Error('path escapes workspace');return r}
export async function snapshotTree(root){
  const rootAbs=path.resolve(root), out=[]; const stack=['']; let entryCount=0,fileCount=0,dirCount=0,symlinkCount=0,hardlinkCount=0,totalBytes=0; const seenDevIno=new Set(); const seenReal=new Set();
  const countEntry=()=>{if(++entryCount>SNAPSHOT_LIMITS.maxEntries)throw new Error('workspace entry-count limit exceeded');};
  while(stack.length){const rel=stack.pop(); const abs=path.join(rootAbs,rel); const real=await fs.realpath(abs); if(seenReal.has(real)&&rel!=='') { out.push({path:rel,type:'cycle'}); continue; } seenReal.add(real);
    const dir=await fs.opendir(abs);
    try{
      for await (const e of dir){
        countEntry();
        const childRel=rel?path.join(rel,e.name):e.name; const child=path.join(rootAbs,childRel); const st=await fs.lstat(child);
        if(st.isSymbolicLink()){if(++symlinkCount>SNAPSHOT_LIMITS.maxSymlinks)throw new Error('workspace symlink-count limit exceeded'); out.push({path:childRel,type:'symlink',target:await fs.readlink(child)});continue;}
        if(st.isDirectory()){if(++dirCount>SNAPSHOT_LIMITS.maxDirs)throw new Error('workspace directory-count limit exceeded'); const realChild=await fs.realpath(child); if(seenReal.has(realChild)){out.push({path:childRel,type:'cycle'});continue;} out.push({path:childRel,type:'dir',mode:st.mode&0o777});stack.push(childRel);continue;}
        if(st.isFile()){if(st.nlink>1){if(++hardlinkCount>SNAPSHOT_LIMITS.maxHardlinks)throw new Error('workspace hardlink-count limit exceeded'); out.push({path:childRel,type:'hardlink',links:st.nlink,size:st.size,mode:st.mode&0o777});continue;} if(++fileCount>SNAPSHOT_LIMITS.maxFiles)throw new Error('workspace file-count limit exceeded'); if(st.size>SNAPSHOT_LIMITS.maxFileBytes||totalBytes+st.size>SNAPSHOT_LIMITS.maxBytes)throw new Error('workspace size limit exceeded'); const buf=await fs.readFile(child); const after=await fs.lstat(child); if(after.dev!==st.dev||after.ino!==st.ino||after.size!==st.size) throw new Error('workspace file changed during snapshot'); totalBytes+=st.size; const key=`${st.dev}:${st.ino}`; if(seenDevIno.has(key)){if(++hardlinkCount>SNAPSHOT_LIMITS.maxHardlinks)throw new Error('workspace hardlink-count limit exceeded'); out.push({path:childRel,type:'hardlink'});continue;} seenDevIno.add(key); out.push({path:childRel,type:'file',sha256:sha256(buf),size:st.size,mode:st.mode&0o777}); continue;}
        out.push({path:childRel,type:'other',mode:st.mode&0o777});
      }
    } finally { await dir.close().catch(()=>{}); }
  } out.sort((a,b)=>a.path.localeCompare(b.path)); return out;
}
export function diffSnapshot(before,after){const a=new Map(before.map(x=>[x.path,JSON.stringify(x)])),b=new Map(after.map(x=>[x.path,JSON.stringify(x)]));const added=[],removed=[],changed=[];for(const[p,v]of b)if(!a.has(p))added.push(p);else if(a.get(p)!==v)changed.push(p);for(const p of a.keys())if(!b.has(p))removed.push(p);const all=[...new Set([...added,...removed,...changed])].sort();return{added:added.sort(),removed:removed.sort(),changed:changed.sort(),all}}
export function snapshotDigest(snap){return sha256(JSON.stringify(snap))}
export async function freezeWorkspace(root){const snap=await snapshotTree(root);const dirs=snap.filter(x=>x.type==='dir').map(x=>x.path).sort((a,b)=>b.length-a.length);const files=snap.filter(x=>x.type==='file').map(x=>x.path);for(const p of files)await fs.chmod(path.join(root,p),0o444).catch(()=>{});for(const p of dirs)await fs.chmod(path.join(root,p),0o555).catch(()=>{});await fs.chmod(root,0o555).catch(()=>{});return snap}
export async function ensurePrivateDir(){const d=path.join(ROOT,'.agent-killer','private');await fs.mkdir(d,{recursive:true,mode:0o700});return d}
export function publicTrustConfigured(){return Boolean(process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY)}
export function strictOfficialMode(){return process.env.AK_OFFICIAL_MODE==='1'}
export function redactEnv(env={}){const allowed=new Set(['PATH','HOME','USER','USERPROFILE','TMP','TEMP','SystemRoot','ComSpec','PWD','LANG','LC_ALL','TERM','CI']);const out={};for(const[k,v]of Object.entries(env))if(allowed.has(k)&&typeof v==='string')out[k]=v;for(const k of ['NODE_OPTIONS','AK_API_TOKEN','AK_TRUSTED_ISSUER_PUBLIC_KEY','AK_SIGNING_PRIVATE_KEY','AK_BLACKBOX_SECRET','AK_EVALUATOR_MODULE','AK_GENERATOR_ORACLE_SECRET','AK_PASSTHROUGH_ENV','AK_EVALUATOR_SHA256','AK_TRUSTED_ISSUER_PRIVATE_KEY','AK_GENERATOR_TRUSTED_PUBLIC_KEY'])delete out[k];return out}
export async function sha256File(file){return sha256(await fs.readFile(file))}
export async function assertPinnedFile(file, expected, label='file'){if(!file||!expected)throw new Error(`${label} pin required`);const actual=await sha256File(path.resolve(file));if(actual.toLowerCase()!==String(expected).toLowerCase())throw new Error(`${label} integrity mismatch`);return actual}
export async function dockerAvailable(){try{const{spawnSync}=await import('node:child_process');if(process.platform!=='linux')return false;const r=spawnSync('docker',['info','--format','{{.ServerVersion}}'],{stdio:['ignore','pipe','ignore']});return r.status===0}catch{return false}}
export async function networkSandboxAvailable(){return dockerAvailable()}
export async function makeSnapshotFile(project){const snap=await snapshotTree(project);const dir=path.join(RUNS_DIR,'snapshots');await fs.mkdir(dir,{recursive:true});const file=path.join(dir,crypto.randomBytes(8).toString('hex')+'.json');const digest=snapshotDigest(snap);await fs.writeFile(file,JSON.stringify({schema_version:'agent-killer.snapshot.v3',root:path.basename(project),createdAt:new Date().toISOString(),files:snap,digest},null,2)+'\n',{mode:0o600});return{file,snapshot:snap,digest}}
