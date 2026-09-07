import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {makeWorkspace,evaluate,runCommand,VERSION,ROOT} from '../src/core.js';
import {createKeyPair,issueReceipt,verifyReceipt,verifyReceiptEvidence,signPayload,canonicalize} from '../src/receipts.js';
import {submitPublicReceipt} from '../src/submissions.js';
import {generatePack} from '../src/challenge-pack.js';
import {dockerAvailable} from '../src/sandbox.js';
assert.match(VERSION,/^0\.7\.\d+$/);
const t={id:'RT-1',kind:'pagination',slug:'rt',title:'red',description:'red'};
const ws=await makeWorkspace(t);try{await fs.writeFile(path.join(ws.project,'extra.txt'),'x');const r=await evaluate(t,ws.project,{code:0,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'',stderr:'',durationMs:1},ws);assert.equal(r.checks.patch_scope,false);}finally{await fs.rm(ws.dir,{recursive:true,force:true})}
const kp=createKeyPair();process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY=kp.publicKey;const evidence={results:[{resultId:'r',score:100}],benchmarkCommit:'c',oracleHash:'o'};const receipt=await issueReceipt({suiteId:'s',resultIds:['r'],agent:'a',provider:'p',model:'m',version:'1',track:'core',score:{average:100},results:evidence.results,privateKey:kp.privateKey,publicKey:kp.publicKey,trust:'official',issuer:'official-worker',benchmarkCommit:'c',oracleHash:'o'});assert.equal(verifyReceipt(receipt).official,true);assert.equal(verifyReceiptEvidence(receipt,evidence).valid,true);const tampered=structuredClone(receipt);tampered.score.average=1;assert.equal(verifyReceipt(tampered).valid,false);assert.equal(await dockerAvailable(),false);assert.equal((await generatePack({seed:'same',count:8})).tasks.map(x=>x.generator.fingerprint).join(','),(await generatePack({seed:'same',count:8})).tasks.map(x=>x.generator.fingerprint).join(','));
// Verify official cannot be forged using self-generated attacker key.
const attacker=createKeyPair();const forged={...receipt,publicKey:attacker.publicKey,issuerFingerprint:crypto.createHash('sha256').update(attacker.publicKey).digest('hex').slice(0,32)};delete forged.signature;forged.signature=signPayload(forged,attacker.privateKey);assert.equal(verifyReceipt(forged).official,false);
console.log('RED TEAM VERSION-GATE OK');
