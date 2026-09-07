import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {VERSION,makeWorkspace,loadTask,removeTreeRobust} from '../src/core.js';
import {evaluateAdversarial} from '../src/adversarial.js';
import {generatePack,loadGeneratedTasks,GENERATED_DIR} from '../src/challenge-pack.js';
import {createKeyPair,signPayload,verifyPayload} from '../src/receipts.js';
import {variantFingerprint} from '../src/generated.js';
import {probeNetworkIsolation} from '../src/container.js';
import {redactEnv} from '../src/security.js';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);
const task=await loadTask('AK-001');
const ws=await makeWorkspace(task);
try {
  const files=await fs.readdir(ws.project);
  assert.equal(files.includes('.agent-killer-secret'),false);
  assert.equal(files.includes('.agent-killer-canary'),false);
  assert.equal(Object.keys(redactEnv({PATH:'/bin',AK_PASSTHROUGH_ENV:'X',X:'SECRET'})).includes('X'),false);
} finally { await removeTreeRobust(ws.dir); await fs.rm(ws.metaPath,{force:true}); }

const advDir=await fs.mkdtemp(path.join(os.tmpdir(),'ak076-adv-')); const advProject=path.join(advDir,'project'); await fs.mkdir(advProject,{recursive:true}); await fs.writeFile(path.join(advProject,'main.js'),'export function solve(x){return x}\n');
const adv=await evaluateAdversarial({project:advProject,execution:{code:0,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'',stderr:''},baseline:[],networkEnforced:false,networkEvidence:{verified:false,blocked:false,evidence:null},secretSurfaceAbsent:true}).catch(e=>({error:e}));
assert.equal(adv.error,undefined); assert.equal(adv.secretSurfaceAbsent,true); assert.equal('secretIntact' in adv,true); await fs.rm(advDir,{recursive:true,force:true});

const pack=await generatePack({seed:'ak076-review',count:8});
assert.equal(pack.schema_version,'agent-killer.challenge-pack.v4');
assert(pack.tasks.every(t=>t.generator.fingerprint===variantFingerprint(t)));
const tamperedBadTask={...pack,tasks:[{...pack.tasks[0],generated:false},...pack.tasks.slice(1)]};
const {signature,publicKey,signerFingerprint,file,...payload}=tamperedBadTask;
assert.equal(verifyPayload(payload,signature,publicKey),false);
await fs.writeFile(path.join(GENERATED_DIR,'malformed-signed-pack.json'),JSON.stringify(tamperedBadTask)+'\n');
const loaded=await loadGeneratedTasks();
assert.equal(loaded.some(t=>t.id===pack.tasks[0].id&&t.generated===false),false);
await fs.rm(path.join(GENERATED_DIR,'malformed-signed-pack.json'),{force:true});

const kp=createKeyPair(); const fp=crypto.createHash('sha256').update(kp.publicKey).digest('hex').slice(0,32);
assert.equal(fp.length,32);

if (process.env.AK_OFFICIAL_MODE==='1') {
  assert.ok(process.env.AK_EVALUATOR_CONTAINER_IMAGE?.match(/@sha256:[0-9a-f]{64}$/i));
}

console.log('REVIEW v0.7.10 TRUST HARDENING OK');
