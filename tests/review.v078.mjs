import assert from 'node:assert/strict';
import {VERSION} from '../src/core.js';
import {SNAPSHOT_LIMITS,snapshotTree} from '../src/security.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

assert.match(VERSION,/^\d+\.\d+\.\d+$/);
assert.equal(SNAPSHOT_LIMITS.maxEntries,60000);
assert.equal(SNAPSHOT_LIMITS.maxFiles,50000);
assert.equal(SNAPSHOT_LIMITS.maxDirs,10000);
assert.equal(SNAPSHOT_LIMITS.maxSymlinks,2048);
assert.equal(SNAPSHOT_LIMITS.maxHardlinks,2048);

const root=await fs.mkdtemp(path.join(os.tmpdir(),'ak078-'));
try {
  const symlinkDir=path.join(root,'symlinks');
  await fs.mkdir(symlinkDir);
  await fs.writeFile(path.join(symlinkDir,'target'),'x');
  for(let i=0;i<SNAPSHOT_LIMITS.maxSymlinks+1;i++) await fs.symlink('target',path.join(symlinkDir,`s-${i}`));
  await assert.rejects(() => snapshotTree(root), /symlink-count limit exceeded/);

  await fs.rm(symlinkDir,{recursive:true,force:true});
  const hardDir=path.join(root,'hardlinks');
  await fs.mkdir(hardDir);
  await fs.writeFile(path.join(hardDir,'target'),'x');
  for(let i=0;i<SNAPSHOT_LIMITS.maxHardlinks+1;i++) await fs.link(path.join(hardDir,'target'),path.join(hardDir,`h-${i}`));
  await assert.rejects(() => snapshotTree(root), /hardlink-count limit exceeded/);

  await fs.rm(hardDir,{recursive:true,force:true});
  const dirRoot=path.join(root,'dirs');
  await fs.mkdir(dirRoot);
  for(let i=0;i<SNAPSHOT_LIMITS.maxDirs+1;i++) await fs.mkdir(path.join(dirRoot,`d-${i}`));
  await assert.rejects(() => snapshotTree(root), /directory-count limit exceeded/);

  console.log('REVIEW v0.7.10 SNAPSHOT FLOOD HARDENING OK');
} finally {
  await fs.rm(root,{recursive:true,force:true});
}
