import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {RESULTS_DIR,VERSION,pruneResultArtifacts,refreshArtifactIndex,ARTIFACT_INDEX_RECONCILE_MS} from '../src/core.js';
import {TRUSTED_RESULTS_DIR,TRUSTED_RESULT_RETENTION_TTL_MS,MAX_TRUSTED_RESULT_FILES,MAX_TRUSTED_RESULT_BYTES,pruneTrustedResults} from '../src/submissions.js';
assert.match(VERSION,/^0\.7\.\d+$/);
assert.ok(ARTIFACT_INDEX_RECONCILE_MS>=60_000);
assert.ok(TRUSTED_RESULT_RETENTION_TTL_MS>=7*24*60*60_000);
assert.ok(MAX_TRUSTED_RESULT_FILES>=1000);
assert.ok(MAX_TRUSTED_RESULT_BYTES>=64*1024*1024);
const prefix='zz_v0712_';
try{
  await refreshArtifactIndex();
  for(let i=0;i<4;i++) await fs.writeFile(path.join(RESULTS_DIR,'result_'+prefix+i+'.json'),'x'.repeat(32)+'\n',{mode:0o600});
  await pruneResultArtifacts({reconcile:true});
  const stale=path.join(RESULTS_DIR,'result_'+prefix+'stale.json');await fs.writeFile(stale,'{}\n',{mode:0o600});const old=Date.now()-24*60*60_000-120_000;await fs.utimes(stale,new Date(old),new Date(old));await pruneResultArtifacts({reconcile:true});await assert.rejects(fs.stat(stale));
  const trusted=path.join(TRUSTED_RESULTS_DIR,prefix+'trusted.json');await fs.mkdir(TRUSTED_RESULTS_DIR,{recursive:true,mode:0o700});await fs.writeFile(trusted,'{}\n',{mode:0o600});const oldTrusted=Date.now()-TRUSTED_RESULT_RETENTION_TTL_MS-120_000;await fs.utimes(trusted,new Date(oldTrusted),new Date(oldTrusted));await pruneTrustedResults({reconcile:true});await assert.rejects(fs.stat(trusted));
  console.log('REVIEW v0.7.12 RESOURCE LIFECYCLE HARDENING OK');
}finally{for(const dir of [RESULTS_DIR,TRUSTED_RESULTS_DIR])for(const n of await fs.readdir(dir).catch(()=>[]))if(n.includes(prefix))await fs.rm(path.join(dir,n),{force:true}).catch(()=>{});}
