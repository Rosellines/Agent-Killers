import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {VERSION} from '../src/core.js';
import {SUBMISSIONS_DIR,REPLAY_DIR,SUBMISSION_RETENTION_TTL_MS,MAX_SUBMISSION_FILES,MAX_SUBMISSION_BYTES,REPLAY_RETENTION_TTL_MS,MAX_REPLAY_FILES,MAX_REPLAY_BYTES,pruneSubmissions,pruneReplayMarkers} from '../src/submissions.js';

assert.match(VERSION,/^0\.7\.\d+$/);
assert.ok(SUBMISSION_RETENTION_TTL_MS>=7*24*60*60_000);
assert.ok(MAX_SUBMISSION_FILES>=1000);
assert.ok(MAX_SUBMISSION_BYTES>=64*1024*1024);
assert.ok(REPLAY_RETENTION_TTL_MS>=7*24*60*60_000);
assert.ok(MAX_REPLAY_FILES>=1000);
assert.ok(MAX_REPLAY_BYTES>=16*1024*1024);

const prefix='zz_v0714_';
try {
  await fs.mkdir(SUBMISSIONS_DIR,{recursive:true,mode:0o750});
  await fs.mkdir(REPLAY_DIR,{recursive:true,mode:0o700});
  const sub=path.join(SUBMISSIONS_DIR,`submission_${prefix}stale.json`);
  await fs.writeFile(sub,'{}\n',{mode:0o600});
  const oldSub=Date.now()-SUBMISSION_RETENTION_TTL_MS-120_000;
  await fs.utimes(sub,new Date(oldSub),new Date(oldSub));
  await pruneSubmissions({reconcile:true});
  await assert.rejects(fs.stat(sub));

  const replay=path.join(REPLAY_DIR,`${prefix}stale.lock`);
  const oldReplay=Date.now()-REPLAY_RETENTION_TTL_MS-120_000;
  await fs.writeFile(replay,JSON.stringify({expiresAt:new Date(oldReplay).toISOString()})+'\n',{mode:0o600});
  await fs.utimes(replay,new Date(oldReplay),new Date(oldReplay));
  await pruneReplayMarkers({reconcile:true});
  await assert.rejects(fs.stat(replay));

  const server=await fs.readFile(new URL('../src/server.js',import.meta.url),'utf8');
  assert.match(server,/pruneSubmissions/);
  assert.match(server,/pruneReplayMarkers/);
  assert.match(server,/reconcile:true/);
  console.log('REVIEW v0.7.x SUBMISSION + REPLAY LIFECYCLE HARDENING OK');
} finally {
  for (const dir of [SUBMISSIONS_DIR,REPLAY_DIR]) {
    for (const n of await fs.readdir(dir).catch(()=>[])) {
      if(n.includes(prefix)) await fs.rm(path.join(dir,n),{force:true}).catch(()=>{});
    }
  }
}
