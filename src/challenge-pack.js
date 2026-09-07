import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT,RUNTIME_ROOT,loadManifest,writeJson} from './core.js';
import {deriveParameters,isParametricKind,variantFingerprint} from './generated.js';
import {createKeyPair,signPayload,verifyPayload,loadOrCreateSigningKey,canonicalize} from './receipts.js';
const GENERATED_DIR=path.join(ROOT,'benchmarks','generated');
const seedHash=seed=>crypto.createHash('sha256').update(String(seed)).digest('hex');
const PARAM_KINDS=[...new Set(['pagination','config','url','dedupe','retry','csv','state','auth','inventory','canonical'])];
export async function generatePack({seed=Date.now().toString(),count=20}={}){
  const manifest=await loadManifest();const bounded=Math.max(1,Math.min(100,Number(count)||20));const h=seedHash(seed);const pool=manifest.tasks.filter(t=>isParametricKind(t.kind));if(!pool.length)throw new Error('manifest contains no parametric task families');const tasks=[];
  for(let i=0;i<bounded;i++){const base=pool[parseInt(h.slice((i*2)%h.length,(i*2)%h.length+2),16)%pool.length];const generator={seed:String(seed),source:base.id,index:i,variantVersion:4,visibleOracleVersion:'1',hiddenOracleVersion:'1',mutationOracleVersion:'1'};const parameters=deriveParameters({...base,generator});const variantHash=seedHash(JSON.stringify({kind:base.kind,parameters})).slice(0,10);const generatorWithVariant={...generator,variant:`${base.kind}-parametric-${variantHash}`};const t={...base,id:`GEN-${h.slice((i*6)%h.length,(i*6)%h.length+10).toUpperCase()}-${String(i+1).padStart(3,'0')}`,slug:`${base.slug}-g${i+1}`,title:`${base.title} · generated-${String(i+1).padStart(3,'0')}`,generator:{...generatorWithVariant,parameters}};t.generator.fingerprint=variantFingerprint(t);t.generated=true;tasks.push(t)}
  const unsigned={schema_version:'agent-killer.challenge-pack.v4',name:`Generated Pack ${seed}`,seed:String(seed),createdAt:new Date().toISOString(),tasks,oracle:{strategy:'parametric-family-v4',manifestHash:seedHash(canonicalize(manifest.tasks)),generatorVersion:5,privateHiddenRecommended:true}};
  const keys=await loadOrCreateSigningKey(path.join(RUNTIME_ROOT,'generator-keys'));
  const signature=signPayload(unsigned,keys.privateKey);
  const pack={...unsigned,signerFingerprint:seedHash(keys.publicKey).slice(0,32),publicKey:keys.publicKey,signature};
  await fs.mkdir(GENERATED_DIR,{recursive:true});const file=path.join(GENERATED_DIR,`pack-${h.slice(0,12)}.json`);await writeJson(file,pack);const files=(await fs.readdir(GENERATED_DIR)).filter(f=>f.endsWith('.json')).sort();while(files.length>20){const old=files.shift();if(old!==path.basename(file))await fs.rm(path.join(GENERATED_DIR,old),{force:true})}return{...pack,file};
}
export async function loadGeneratedTasks(){await fs.mkdir(GENERATED_DIR,{recursive:true});const out=[];for(const f of await fs.readdir(GENERATED_DIR)){if(!f.endsWith('.json'))continue;try{const p=JSON.parse(await fs.readFile(path.join(GENERATED_DIR,f),'utf8'));const{signature,publicKey,signerFingerprint,...payload}=p;if(!signature||!publicKey||!verifyPayload(payload,signature,publicKey))continue;const trusted=process.env.AK_GENERATOR_TRUSTED_PUBLIC_KEY;if(process.env.AK_OFFICIAL_MODE==='1'&&(!trusted||trusted!==publicKey))continue;if(signerFingerprint!==seedHash(publicKey).slice(0,32))continue;const tasks=Array.isArray(p.tasks)?p.tasks:[];if(!tasks.length||tasks.some(t=>!t||t.generated!==true||typeof t.id!=='string'||!t.generator||typeof t.generator.fingerprint!=='string'||typeof t.generator.variant!=='string'||typeof t.generator.source!=='string'||typeof t.generator.variantVersion!=='number'))continue;if(tasks.some(t=>t.generator.fingerprint!==variantFingerprint(t)))continue;out.push(...tasks)}catch{}}return out}
export {GENERATED_DIR,PARAM_KINDS};
