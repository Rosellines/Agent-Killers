import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ensureDirs,makeWorkspace,loadTask,runCommand} from '../src/core.js';
import {snapshotTree} from '../src/security.js';
import {createKeyPair,signPayload,verifyReceipt,verifyClaimantSignature,issueReceipt} from '../src/receipts.js';
import {generatePack,loadGeneratedTasks} from '../src/challenge-pack.js';
import {selectBlackBox,revealBlackBox} from '../src/blackbox.js';
import {registerTrustedResults,submitPublicReceipt,verifySubmission,SUBMISSIONS_DIR,TRUSTED_RESULTS_DIR} from '../src/submissions.js';
await ensureDirs();

// Mutation must work even after the participant workspace is frozen.
const task=await loadTask('AK-001'); const ws=await makeWorkspace(task);
await fs.chmod(path.join(ws.project,'main.js'),0o400);
const imported=await import('../src/core.js');
const exec={code:0,signal:null,timedOut:false,tooMuchOutput:false,resourceLimitExceeded:false,stdout:'',stderr:'',durationMs:1};
const evaluation=await imported.evaluate(task,ws.project,exec,ws); assert.equal(evaluation.checks.mutation_killed,true); await fs.rm(ws.dir,{recursive:true,force:true}).catch(()=>{});

// Generated tasks: deterministic fingerprints and reference-visible compatibility smoke.
const pack=await generatePack({seed:'v073-parametric',count:100}); assert.equal(pack.tasks.length,100); assert.equal(new Set(pack.tasks.map(t=>t.generator.fingerprint)).size,100); assert.ok(pack.tasks.every(t=>t.generator.visibleOracleVersion&&t.generator.hiddenOracleVersion&&t.generator.mutationOracleVersion));

// Black-box commitment binds challenge digest + version and rejects wrong secret.
const bb=await selectBlackBox({seed:'v073-seed',secret:'private-secret'}); assert.equal(revealBlackBox(bb,{seed:'v073-seed',secret:'private-secret'}).valid,true); assert.equal(revealBlackBox(bb,{seed:'v073-seed',secret:'wrong'}).valid,false); const clone={...bb,challengeDigest:'tampered'}; assert.equal(revealBlackBox(clone,{seed:'v073-seed',secret:'private-secret'}).valid,false);

// Official receipt requires trusted issuer, expiry and claimant nonce-bound signature.
const issuer=createKeyPair(),claimant=createKeyPair(); process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY=issuer.publicKey; process.env.AK_TRUSTED_ISSUER_PRIVATE_KEY=issuer.privateKey;
const results=[{resultId:'v073-r1',agent:'codex',score:99}]; await registerTrustedResults(results,{privateKey:issuer.privateKey,publicKey:issuer.publicKey});
const receipt=await issueReceipt({suiteId:'v073-suite',resultIds:['v073-r1'],agent:'codex',provider:'openai',model:'test',version:'v073',track:'core',score:{average:99},results,privateKey:issuer.privateKey,publicKey:issuer.publicKey,trust:'official',issuer:'official-worker',metadata:{claimant:'alice',claimantPublicKey:claimant.publicKey},benchmarkCommit:'commit',oracleHash:'oracle'});
assert.equal(verifyReceipt(receipt).official,true); const sig=signPayload({receipt_id:receipt.receipt_id,claimant:'alice',nonce:receipt.nonce},claimant.privateKey); assert.equal(verifyClaimantSignature(receipt.receipt_id,'alice',receipt.nonce,sig,claimant.publicKey),true); assert.equal(verifyClaimantSignature(receipt.receipt_id,'alice','wrong',sig,claimant.publicKey),false);
const evidence={results,benchmarkCommit:'commit',oracleHash:'oracle'}; const rec=await submitPublicReceipt({receipt,evidence,claimant:'alice',claimantPublicKey:claimant.publicKey,claimantSignature:sig}); assert.equal(rec.trust,'official'); assert.equal((await verifySubmission(rec.submission_id)).official,true); await assert.rejects(()=>submitPublicReceipt({receipt,evidence,claimant:'alice',claimantPublicKey:claimant.publicKey,claimantSignature:sig}));
delete process.env.AK_TRUSTED_ISSUER_PUBLIC_KEY;delete process.env.AK_TRUSTED_ISSUER_PRIVATE_KEY;

// Runtime workspace must live outside repository by default.
assert.notEqual(ws.project.startsWith(path.join(process.cwd(),'.agent-killer','runs')),true);

// Process tree timeout: descendants in the runner's process group must terminate.
const treeScript='const {spawn}=require(\'node:child_process\'); const fs=require(\'node:fs\'); const c=spawn(process.execPath,[\'-e\',\'setTimeout(()=>{},10000)\'],{stdio:\'ignore\'}); fs.writeFileSync(process.argv[1],String(c.pid)); setTimeout(()=>{},10000);';
const pidFile=path.join(process.env.TMPDIR||'/tmp',`ak-pid-${Date.now()}.txt`); await runCommand(process.execPath,['-e',treeScript,pidFile],{timeoutMs:300,maxOutputBytes:8*1024}); let pid=null; try{pid=Number((await fs.readFile(pidFile,'utf8')).trim())}catch{}; if(pid){let dead=false;for(let i=0;i<12&&!dead;i++){try{process.kill(pid,0);if(process.platform==='linux'){try{const stat=(await fs.readFile(`/proc/${pid}/stat`,'utf8')).split(' ');dead=stat[2]==='Z';}catch(e){dead=e.code==='ENOENT'||e.code==='ESRCH';}}}catch(e){if(e.code==='ESRCH')dead=true;else throw e}if(!dead)await new Promise(r=>setTimeout(r,150));}assert.equal(dead,true,'descendant process survived timeout')} await fs.rm(pidFile,{force:true}).catch(()=>{});

// Output bomb remains bounded.
const bomb=await runCommand(process.execPath,['-e','process.stdout.write("x".repeat(2*1024*1024))'],{timeoutMs:5000,maxOutputBytes:128*1024}); assert.equal(bomb.tooMuchOutput,true);
// No docker socket path should ever be part of container args API.
const {validateMounts}=await import('../src/container.js'); assert.throws(()=>validateMounts([{source:'/tmp/x',target:'/var/run/docker.sock',readonly:true}]),/protected container mount target forbidden/);
console.log('REVIEW v0.7.3 TRUST GATE OK');
