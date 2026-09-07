import assert from 'node:assert/strict';
import {listV07Trials,runV07SelfTest,V07_IDS} from '../src/v07.js';
const ts=await listV07Trials(); assert.equal(ts.length,15); assert.deepEqual(ts.map(t=>t.id),V07_IDS);
assert.equal(new Set(ts.map(t=>t.slug)).size,15);
const out=await runV07SelfTest(); assert.equal(out.trials,15); assert.equal(out.allPassed,true);
for(const t of ts){assert.equal(t.difficulty,5);assert.equal(t.edition,'v0.7.11');assert.ok(t.title);assert.ok(t.tags.includes('v0.7'));}
console.log('V0.7 TESTS OK');
