import {loadManifest} from './core.js';
import {runOne, runSuite} from './runner.js';

export const V07_IDS=Array.from({length:15},(_,i)=>`AK-${String(i+41).padStart(3,'0')}`);
export async function listV07Trials(){
  const m=await loadManifest();
  return m.tasks.filter(t=>V07_IDS.includes(t.id)).map(t=>({...t,edition:'v0.7.11',publicTitle:t.title}));
}
export async function runV07Suite({agentIds=['mock'],timeoutMs=180000}={}){
  return runSuite({agentIds,taskIds:V07_IDS,timeoutMs});
}
export async function runV07SelfTest(){
  const rows=[]; for(const id of V07_IDS){
    const r=await runOne({agentId:'mock',taskId:id,timeoutMs:30000});
    rows.push({id,score:r.evaluation.score.total,visible:r.evaluation.checks.visible_tests,hidden:r.evaluation.checks.hidden_tests,mutation:r.evaluation.checks.mutation_killed,patch:r.evaluation.checks.patch_scope,security:r.evaluation.checks.secret_hygiene,repro:r.evaluation.checks.deterministic_rerun});
  }
  return {version:'0.7.11',trials:rows.length,allPassed:rows.every(r=>r.score>=95&&r.visible&&r.hidden&&r.mutation&&r.patch&&r.security&&r.repro),rows};
}
export async function runV07Deathmatch(agentA,agentB,{timeoutMs=180000}={}){
  const suite=await runV07Suite({agentIds:[agentA,agentB],timeoutMs});
  const a=suite.leaderboard.find(x=>x.agent===agentA); const b=suite.leaderboard.find(x=>x.agent===agentB);
  const winner=a&&b?(a.average===b.average?'draw':a.average>b.average?agentA:agentB):null;
  return {schema_version:'agent-killer.deathmatch.v1',version:'0.7.11',agentA,agentB,winner,leaderboard:suite.leaderboard,results:suite.results};
}
