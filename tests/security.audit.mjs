import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import {makeWorkspace,evaluate,loadTask,ensureDirs} from '../src/core.js';
import {generatePack} from '../src/challenge-pack.js';
import {createKeyPair,signPayload,verifyReceipt,canonicalize} from '../src/receipts.js';
import {submitLocalSuite,submitPublicReceipt,verifySubmission,registerTrustedResults} from '../src/submissions.js';
import {selectBlackBox,revealBlackBox} from '../src/blackbox.js';
import {loadManifest} from '../src/core.js';
await ensureDirs();

const t=await loadTask('AK-001');
const ws=await makeWorkspace(t);
await fs.rm(path.join(ws.project,'.git'),{recursive:true,force:true});
let ev=await evaluate(t,ws.project,{code:0,timedOut:false,stdout:'',stderr:'',durationMs:1},ws);
assert.equal(ev.checks.patch_scope,false,'deleting .git must be detected by independent snapshot');
await fs.rm(ws.dir,{recursive:true,force:true});

const ws2=await makeWorkspace(t);
await fs.symlink(path.join(ws2.project,'main.js'),path.join(ws2.project,'evil-link'));
ev=await evaluate(t,ws2.project,{code:0,timedOut:false,stdout:'',stderr:'',durationMs:1},ws2);
assert.equal(ev.checks.no_symlinks,false,'symlink must fail');
await fs.rm(ws2.dir,{recursive:true,force:true});

const kp=createKeyPair();
const fake={schema_version:'agent-killer.receipt.v5',signature_algorithm:'Ed25519-canonical-SHA256-v2',receipt_id:'fake',issuedAt:new Date().toISOString(),suiteId:'fake',resultIds:['x'],agent:'codex',provider:'openai',model:'fake',version:'1',track:'core',trust:'official',issuer:'attacker',score:{average:100},resultsDigest:'x',metadata:{},publicKey:kp.publicKey,issuerFingerprint:'attacker'};
fake.signature=signPayload(fake,kp.privateKey);
assert.equal(verifyReceipt(fake).valid,true,'self signature is cryptographically valid');assert.equal(verifyReceipt(fake).official,false,'self-signed must never be official');

process.env.AK_PUBLIC='1'; delete process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY;
await assert.rejects(()=>submitPublicReceipt(fake),'public submission must require trusted issuer');
delete process.env.AK_PUBLIC;

const bb=await selectBlackBox({seed:'known-seed',secret:'server-secret'});
assert.ok(bb.commitment&&bb.taskId&&!bb.revealed); assert.equal(revealBlackBox(bb,{seed:'known-seed',secret:'wrong'}).valid,false); assert.equal(revealBlackBox(bb,{seed:'known-seed',secret:'server-secret'}).valid,true);

const gp1=await generatePack({seed:'audit-seed',count:12}); const gp2=await generatePack({seed:'audit-seed',count:12});
assert.deepEqual(gp1.tasks.map(t=>t.generator.variant),gp2.tasks.map(t=>t.generator.variant),'generated variants must be deterministic');
const uniqueBehavior=new Set(gp1.tasks.map(t=>`${t.kind}:${t.generator.variant}`)); assert.ok(uniqueBehavior.size>=3,'generated pack must contain real parametric variants');

console.log('SECURITY AUDIT OK');

const issuer=createKeyPair();
const claimant=createKeyPair();
const claimantName='alice';
const evidence={results:[{resultId:'r1',score:91}],benchmarkCommit:'commit-1',oracleHash:'oracle-1'}; const officialResults=evidence.results; process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY=issuer.publicKey; process.env.AK_TRUSTED_ISSUER_PRIVATE_KEY=issuer.privateKey; const {issueReceipt}=await import('../src/receipts.js'); const officialPayload=await issueReceipt({suiteId:'suite',resultIds:['r1'],agent:'codex',provider:'openai',model:'model',version:'1',track:'core',score:{average:91},results:officialResults,privateKey:issuer.privateKey,publicKey:issuer.publicKey,trust:'official',issuer:'official-worker',metadata:{claimant:claimantName,claimantPublicKey:claimant.publicKey},benchmarkCommit:'commit-1',oracleHash:'oracle-1'}); const claimantSignature=signPayload({receipt_id:officialPayload.receipt_id,claimant:claimantName,nonce:officialPayload.nonce},claimant.privateKey); await registerTrustedResults(evidence.results,{privateKey:issuer.privateKey,publicKey:issuer.publicKey}); const publicRecord=await submitPublicReceipt({receipt:officialPayload,evidence,claimant:claimantName,claimantPublicKey:claimant.publicKey,claimantSignature});assert.equal(publicRecord.trust,'official');await assert.rejects(()=>submitPublicReceipt({receipt:officialPayload,evidence,claimant:claimantName,claimantPublicKey:claimant.publicKey,claimantSignature}),'replay must be rejected');delete process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY;

const {runCommand}=await import('../src/core.js');
const bomb=await runCommand(process.execPath,['-e','process.stdout.write("x".repeat(3*1024*1024))'],{timeoutMs:10000});assert.equal(bomb.tooMuchOutput,true,'output bomb must be capped');
function requireIssuerFingerprint(pub){return crypto.createHash('sha256').update(pub).digest('hex').slice(0,32)}
console.log('RED TEAM EXTRA OK');
