import fs from 'node:fs/promises';
import path from 'node:path';
import {loadTask,makeWorkspace,evaluate,RESULTS_DIR,writeJson,writeResultArtifact,runId,runCommand,ROOT} from './core.js';
export async function startHuman(taskId='AK-001'){
  const task=await loadTask(taskId); if(!task) throw new Error(`Unknown task: ${taskId}`); const ws=await makeWorkspace(task);
  const meta={schema_version:'agent-killer.human-run.v1',id:runId('human'),createdAt:new Date().toISOString(),task,project:ws.project,baseline:ws.baseline,baselineDigest:ws.baselineDigest,protectedHashes:ws.protectedHashes};
  await writeJson(path.join(ws.dir,'human.json'),meta); return {...meta,dir:ws.dir};
}
export async function gradeHuman(runPath){
  let meta; try{meta=JSON.parse(await fs.readFile(path.join(runPath,'human.json'),'utf8'));}catch{meta=JSON.parse(await fs.readFile(path.join(runPath,'..','human.json'),'utf8'));}
  const exec={code:0,signal:null,timedOut:false,stdout:'human submission',stderr:'',durationMs:0};
  const evaluation=await evaluate(meta.task,meta.project,exec,meta);
  const result={schema_version:7,id:runId('human-result'),createdAt:new Date().toISOString(),agent:'human',agentLabel:'Human Engineer',provider:'human',model:'human',version:'manual',task:{id:meta.task.id,slug:meta.task.slug,title:meta.task.title,category:meta.task.category,difficulty:meta.task.difficulty,weight:meta.task.weight},execution:exec,evaluation,evidenceHash:'human',verification:'local-manual',workspace:meta.project};
  await writeResultArtifact(path.join(RESULTS_DIR,result.id+'.json'),result); return result;
}
