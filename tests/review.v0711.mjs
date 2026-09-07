import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {RESULTS_DIR,VERSION,MAX_RESULT_ARTIFACT_FILES,MAX_RESULT_ARTIFACT_BYTES,MAX_BLACKBOX_RECORDS,ARTIFACT_RETENTION_TTL_MS,pruneResultArtifacts,writeResultArtifact} from '../src/core.js';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);
assert.ok(MAX_RESULT_ARTIFACT_FILES>=100);
assert.ok(MAX_RESULT_ARTIFACT_BYTES>=16*1024*1024);
assert.ok(MAX_BLACKBOX_RECORDS>=32);
assert.ok(ARTIFACT_RETENTION_TTL_MS>=60_000);

const prefix='zz_v0711_artifact_test_';
const files=[];
try{
  for(let i=0;i<MAX_BLACKBOX_RECORDS+3;i++){
    const f=path.join(RESULTS_DIR,`blackbox_${prefix}${String(i).padStart(4,'0')}.json`);
    await fs.writeFile(f,'{}\n',{mode:0o600}); files.push(f);
  }
  await pruneResultArtifacts({reconcile:true});
  const left=(await fs.readdir(RESULTS_DIR)).filter(x=>x.startsWith(`blackbox_${prefix}`));
  assert.ok(left.length<=MAX_BLACKBOX_RECORDS,'blackbox record quota must be enforced');

  const stale=path.join(RESULTS_DIR,`result_${prefix}stale.json`);
  await fs.writeFile(stale,'{}\n',{mode:0o600});
  const old=Date.now()-ARTIFACT_RETENTION_TTL_MS-60_000;
  await fs.utimes(stale,new Date(old),new Date(old));
  await pruneResultArtifacts({reconcile:true});
  await assert.rejects(fs.stat(stale),'stale result artifact must be pruned');

  const fresh=path.join(RESULTS_DIR,`result_${prefix}fresh.json`);
  await writeResultArtifact(fresh,{ok:true});
  const parsed=JSON.parse(await fs.readFile(fresh,'utf8'));
  assert.equal(parsed.ok,true);

  console.log('REVIEW v0.7.11 ARTIFACT RESOURCE GOVERNANCE OK');
} finally {
  for(const f of files) await fs.rm(f,{force:true}).catch(()=>{});
  for(const n of [`result_${prefix}stale.json`,`result_${prefix}fresh.json`]) await fs.rm(path.join(RESULTS_DIR,n),{force:true}).catch(()=>{});
  const leftovers=(await fs.readdir(RESULTS_DIR).catch(()=>[])).filter(x=>x.startsWith(`blackbox_${prefix}`));
  for(const n of leftovers) await fs.rm(path.join(RESULTS_DIR,n),{force:true}).catch(()=>{});
}
