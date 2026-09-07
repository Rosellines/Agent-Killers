import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {VERSION} from '../src/core.js';
import {JOB_LIFETIME_DEFAULT_MS,JOB_LIFETIME_MAX_MS,runSuite,runAdversarialSuite} from '../src/runner.js';
import {RemoteExecutionGate} from '../src/resource-governance.js';

assert.match(VERSION,/^0\.7\.\d+$/);
assert.equal(JOB_LIFETIME_DEFAULT_MS,30*60_000);
assert.equal(JOB_LIFETIME_MAX_MS,30*60_000);
assert.match(JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8')).version,/^0\.7\.(?:14|15)$/);

for (const fn of [runSuite,runAdversarialSuite]) {
  await assert.rejects(
    fn({agentIds:['mock'],...(fn===runSuite?{taskIds:['AK-001']}:{}) ,timeoutMs:60_000,jobDeadlineAt:Date.now()-1}),
    e=>e?.publicCode==='job_lifetime_exceeded'
  );
}

const source=await fs.readFile(new URL('../src/server.js',import.meta.url),'utf8');
assert.match(source,/MAX_ACTIVE_JOBS/);
assert.match(source,/AK_MAX_ACTIVE_JOBS/);
assert.match(source,/MAX_JOB_LIFETIME_MS/);
assert.match(source,/jobDeadlineAt/);
assert.match(source,/deadlineAt/);
assert.match(source,/status:'running'/);

const gate=new RemoteExecutionGate({maxActive:1,maxQueued:1,maxActivePerCaller:1});
let release;
const first=gate.tryEnqueue('caller-a',{jobId:'job-1',async run(){await new Promise(r=>{release=r});}});
assert.equal(first.accepted,true);
const second=gate.tryEnqueue('caller-a',{jobId:'job-2',async run(){}});
assert.equal(second.accepted,false);
await new Promise(r=>setImmediate(r));
assert.equal(typeof release,'function');
release();
await new Promise(r=>setImmediate(r));
assert.equal(gate.activeCount(),0);

console.log('REVIEW v0.7.x RESOURCE LIFETIME HARDENING OK');
