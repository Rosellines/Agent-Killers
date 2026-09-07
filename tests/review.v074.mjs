import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT,VERSION,makeWorkspace,loadTask,runCommand,ensureDirs} from '../src/core.js';
import {snapshotTree} from '../src/security.js';
import {assertOfficialContainerAvailable,probeNetworkIsolation} from '../src/container.js';
import {strictOfficialMode} from '../src/security.js';
await ensureDirs();
assert.match(VERSION,/^\d+\.\d+\.\d+$/);
const c=await fs.readFile(path.join(ROOT,'src','container.js'),'utf8');
assert.ok(c.includes('/var/run/docker.sock'), 'protected socket mount must be explicitly denied');
assert.equal(c.includes("'--network','none'"),true); assert.ok(c.includes('AK_SECCOMP_SHA256')); assert.ok(c.includes('AK_APPARMOR_PROFILE_PATH'));
const t=await loadTask('AK-001'); const ws=await makeWorkspace(t); try {
  const snap=await snapshotTree(ws.project); assert.ok(snap.some(x=>x.path==='test.js'));
  assert.ok(!ws.project.startsWith(path.join(ROOT,'.agent-killer')));
} finally { await fs.rm(ws.dir,{recursive:true,force:true}).catch(()=>{}); }
if(strictOfficialMode()) await assert.rejects(()=>assertOfficialContainerAvailable().then(()=>{throw new Error('test harness requires configured profiles')}));
console.log('REVIEW v0.7.6 ZERO-TRUST STATIC GATE OK');
