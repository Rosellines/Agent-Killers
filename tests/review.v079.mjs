import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {VERSION,runCommand,MAX_EXEC_TIMEOUT_MS,MIN_EXEC_TIMEOUT_MS,DEFAULT_EXEC_TIMEOUT_MS} from '../src/core.js';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);
assert.equal(MAX_EXEC_TIMEOUT_MS,15*60_000);
assert.equal(MIN_EXEC_TIMEOUT_MS,1000);
assert.equal(DEFAULT_EXEC_TIMEOUT_MS,180000);

const out=await runCommand(process.execPath,['-e','process.stdout.write("😀".repeat(3000))'],{timeoutMs:5000,maxOutputBytes:4096});
assert.equal(out.tooMuchOutput,true,'output cap must use UTF-8 bytes');

const root=await fs.mkdtemp(path.join(os.tmpdir(),'ak079-'));
const f=path.join(root,'.agent-killer-secretish');
try{
  await fs.writeFile(f,'x');
  const {freezeWorkspace}=await import('../src/security.js');
  await freezeWorkspace(root);
  const mode=(await fs.stat(f)).mode & 0o777;
  assert.equal(mode,0o444,'freezeWorkspace must not skip arbitrary .agent-killer-* files');
  console.log('REVIEW v0.7.10 RESOURCE GOVERNANCE HARDENING OK');
}finally{await fs.chmod(root,0o700).catch(()=>{});await fs.chmod(f,0o600).catch(()=>{});await fs.rm(root,{recursive:true,force:true});}
