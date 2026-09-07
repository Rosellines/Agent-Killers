import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {RemoteExecutionGate} from '../src/resource-governance.js';
import {VERSION,MAX_EXEC_TIMEOUT_MS} from '../src/core.js';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);
assert.equal(MAX_EXEC_TIMEOUT_MS,15*60_000);

const gate=new RemoteExecutionGate({maxActive:2,maxQueued:2,maxActivePerCaller:1});
const waits=[];
const hold=ms=>new Promise(r=>setTimeout(r,ms));
const a1=gate.tryEnqueue('a',{jobId:'a1',async run(){await hold(60)}});
assert.equal(a1.accepted,true); assert.equal(a1.started,true);
const a2=gate.tryEnqueue('a',{jobId:'a2',async run(){}});
assert.equal(a2.accepted,false); assert.equal(a2.reason,'caller_concurrency_limit');
const b1=gate.tryEnqueue('b',{jobId:'b1',async run(){await hold(60)}});
assert.equal(b1.accepted,true); assert.equal(b1.started,true);
for(let i=0;i<2;i++) waits.push(gate.tryEnqueue('c',{jobId:`c${i}`,async run(){}}));
assert.ok(waits.every(x=>x.accepted));
const full=gate.tryEnqueue('d',{jobId:'d1',async run(){}});
assert.equal(full.accepted,false); assert.equal(full.reason,'execution_queue_full');
await hold(100);
assert.equal(gate.activeCount(),0);
assert.equal(gate.queuedCount(),0);

const server=await readFile(new URL('../src/server.js',import.meta.url),'utf8');
assert.match(server,/MAX_ACTIVE_EXECUTIONS/);
assert.match(server,/MAX_QUEUED_JOBS/);
assert.match(server,/MAX_ACTIVE_PER_CALLER/);
assert.match(server,/status==='queued'\|\|j\.status==='running/);
assert.match(server,/executionGate\.tryEnqueue/);
console.log('REVIEW v0.7.10 RESOURCE GOVERNANCE OK');
