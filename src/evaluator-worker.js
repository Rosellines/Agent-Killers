#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {spawn} from 'node:child_process';
const [, , modulePath, mode, taskJson] = process.argv;
if(!modulePath||!mode||!taskJson)process.exit(2);
const task=JSON.parse(taskJson);
const run= (command,args,env)=>new Promise(resolve=>{const p=spawn(command,args,{cwd:'/workspace',env,shell:false,stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('close',c=>resolve({code:c,stdout:out,stderr:err}));p.on('error',e=>resolve({code:1,stdout:'',stderr:String(e.message||e)}));});
try{
  const mod=await import(modulePath);
  if(mode==='mutant'){process.stdout.write(JSON.stringify(mod.mutant(task)||null));process.exit(0)}
  if(mode==='hidden'){
    const source=String(mod.hiddenTest(task));
    const temp=`/tmp/ak-hidden-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`;
    await fs.writeFile(temp,source+'\n',{mode:0o600});
    try{
      const r=await run(process.execPath,[temp],{PATH:process.env.PATH||'',HOME:'/tmp',AK_PROJECT:'/workspace',NODE_OPTIONS:undefined});
      process.stdout.write(JSON.stringify({passed:r.code===0,code:r.code,stdout:r.stdout.slice(-8192),stderr:r.stderr.slice(-8192),evidence:{worker:'isolated-evaluator',project:'/workspace'}}));
      process.exit(r.code===0?0:10);
    } finally { await fs.rm(temp,{force:true}).catch(()=>{}); }
  }
  process.exit(3);
}catch{process.exit(4)}
