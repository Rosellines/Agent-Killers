import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadManifest,loadTask,makeWorkspace,evaluate,runCommand,ensureDirs,ROOT,RUNS_DIR} from '../src/core.js';
import {solutionSource} from '../src/families.js';
import {generatePack} from '../src/challenge-pack.js';
import {snapshotTree} from '../src/security.js';
import {createKeyPair,signPayload,verifyReceipt,verifyClaimantSignature} from '../src/receipts.js';
import {registerTrustedResults,submitPublicReceipt,verifySubmission,SUBMISSIONS_DIR,TRUSTED_RESULTS_DIR} from '../src/submissions.js';

await ensureDirs();
// 1) Snapshot must include node_modules and .git changes.
const t=await loadTask('AK-001'); const ws=await makeWorkspace(t);
await fs.mkdir(path.join(ws.project,'node_modules','evil'),{recursive:true}); await fs.writeFile(path.join(ws.project,'node_modules','evil','index.js'),'tamper');
let after=await snapshotTree(ws.project); assert.ok(after.some(x=>x.path==='node_modules/evil/index.js'),'node_modules must be in snapshot');
await fs.rm(path.join(ws.project,'.git'),{recursive:true,force:true}); const ev=await evaluate(t,ws.project,{code:0,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'',stderr:'',durationMs:1},ws); assert.equal(ev.checks.patch_scope,false); await fs.rm(ws.dir,{recursive:true,force:true}).catch(()=>{}); await fs.rm(ws.metaPath,{force:true}).catch(()=>{});
// 2) Generated variants must be parameterized and reference-compatible at least for visible contract.
const pack=await generatePack({seed:'review-parameteric',count:24}); assert.equal(new Set(pack.tasks.map(x=>x.generator.fingerprint)).size,24); assert.ok(new Set(pack.tasks.map(x=>x.generator.variant)).size>=3);
// 3) Official receipt cannot be official from self-trust and needs claimant proof path.
const kp=createKeyPair(); const claimant=createKeyPair(); const receipt={schema_version:'agent-killer.receipt.v5',signature_algorithm:'Ed25519-canonical-SHA256-v2',receipt_id:'review-receipt-1',issuedAt:new Date().toISOString(),suiteId:'s',resultIds:['r'],agent:'a',provider:'p',model:'m',version:'1',track:'core',trust:'official',issuer:'attacker',score:{average:100},resultsDigest:'x',evidenceDigest:'y',benchmarkCommit:'c',oracleHash:'o',metadata:{claimant:'alice',claimantPublicKey:claimant.publicKey},publicKey:kp.publicKey,issuerFingerprint:crypto.createHash('sha256').update(kp.publicKey).digest('hex').slice(0,32)};
receipt.signature=signPayload(receipt,kp.privateKey); delete process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY; assert.equal(verifyReceipt(receipt).official,false); const sig=signPayload({receipt_id:receipt.receipt_id,claimant:'alice'},claimant.privateKey); assert.equal(verifyClaimantSignature(receipt.receipt_id,'alice',sig,claimant.publicKey),true);
// 4) Resource/output cap still works.
const bomb=await runCommand(process.execPath,['-e','process.stdout.write("x".repeat(2*1024*1024))'],{timeoutMs:5000,maxOutputBytes:128*1024}); assert.equal(bomb.tooMuchOutput,true);
console.log('REVIEW v0.7.3 AUDIT OK');
