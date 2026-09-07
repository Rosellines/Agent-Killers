import assert from 'node:assert/strict';
import { loadManifest, loadTask, makeWorkspace, evaluate, runCommand, RESULTS_DIR } from '../src/core.js';
import { solutionSource, hiddenTest, mutant } from '../src/families.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const m = await loadManifest();
assert.equal(m.tasks.length, 55);
assert.equal(new Set(m.tasks.map(t=>t.id)).size, 55);
for (const t of m.tasks) {
  assert.ok(solutionSource(t).includes('export function solve'));
  assert.ok(hiddenTest(t).includes('AK_PROJECT'));
  assert.ok(mutant(t)?.length === 2);
}
const t = await loadTask('AK-001');
const ws = await makeWorkspace(t);
await fs.writeFile(path.join(ws.project,'main.js'), solutionSource(t)+'\n');
const exec = {code:0,signal:null,timedOut:false,stdout:'reference solver',stderr:'',durationMs:1};
const r = await evaluate(t, ws.project, exec, ws);
assert.equal(r.checks.visible_tests, true);
assert.equal(r.checks.hidden_tests, true);
assert.equal(r.checks.mutation_killed, true);
assert.equal(r.score.total, 100);
await fs.rm(ws.dir,{recursive:true,force:true});
console.log('CORE TESTS OK');
