import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {generatePack,loadGeneratedTasks} from '../src/challenge-pack.js';
import {loadOrCreateSigningKey,signPayload,verifyPayload} from '../src/receipts.js';
import {redactEnv,snapshotTree} from '../src/security.js';
import {runCommand} from '../src/core.js';

// P0-01: participant secret surface is empty by construction.
const tmp = await fs.mkdtemp(path.join(os.tmpdir(),'ak075-review-'));
try {
  await fs.writeFile(path.join(tmp,'main.js'),'export function solve(x){return x}\n');
  const snap = await snapshotTree(tmp);
  assert.equal(snap.some(x=>x.path.includes('.agent-killer-secret')),false);
  assert.equal(snap.some(x=>x.path.includes('.agent-killer-canary')),false);
} finally { await fs.rm(tmp,{recursive:true,force:true}).catch(()=>{}); }

// P0-02: environment is deny-by-default; arbitrary passthrough is ignored.
const env=redactEnv({PATH:'/bin',HOME:'/tmp',AK_PASSTHROUGH_ENV:'SECRET_X',SECRET_X:'DO_NOT_LEAK',NODE_OPTIONS:'--require evil'});
assert.equal(env.SECRET_X,undefined);
assert.equal(env.AK_PASSTHROUGH_ENV,undefined);
assert.equal(env.NODE_OPTIONS,undefined);
assert.equal(env.PATH,'/bin');

// P0-03: timeout/output controls terminate the process command and bound output.
const bomb=await runCommand(process.execPath,['-e','process.stdout.write("x".repeat(2*1024*1024))'],{timeoutMs:5000,maxOutputBytes:128*1024});
assert.equal(bomb.tooMuchOutput,true);

// P0-04: generated pack is cryptographically signed and loadable.
const pack=await generatePack({seed:'ak075-review',count:6});
assert.equal(pack.schema_version,'agent-killer.challenge-pack.v4');
assert.equal(typeof pack.signature,'string');
const {signature,publicKey,signerFingerprint,file,...payload}=pack;
assert.equal(verifyPayload(payload,signature,publicKey),true);
assert.equal(signerFingerprint,crypto.createHash('sha256').update(publicKey).digest('hex').slice(0,32));
const loaded=await loadGeneratedTasks();
assert(loaded.some(t=>t.id===pack.tasks[0].id),'signed generated task must be loadable');

// Tampered pack must be rejected by verifier.
const tampered={...pack,tasks:pack.tasks.map((t,i)=>i===0?{...t,title:t.title+' tampered'}:t)};
const {signature:sig2,publicKey:pub2,signerFingerprint:fp2,file:ignoredFile,...payload2}=tampered;
assert.equal(verifyPayload(payload2,sig2,pub2),false);

// P1-05: runtime signing key remains outside repository package tree by default.
const key=await loadOrCreateSigningKey(path.join(process.env.TMPDIR||os.tmpdir(),'ak075-review-keys'));
assert(key.privateKey.includes('PRIVATE KEY'));

console.log('REVIEW v0.7.5 TRUST GATE OK');
