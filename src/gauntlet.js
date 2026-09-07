import {loadManifest} from './core.js';
import {runSuite,runAdversarialSuite} from './runner.js';
export async function runGauntlet({agentIds=['mock'],timeoutMs=180000,jobDeadlineAt}={}){
  const m=await loadManifest(); const picks=m.tasks.filter((_,i)=>i%5===0).map(t=>t.id); const core=await runSuite({agentIds,taskIds:picks,timeoutMs,jobDeadlineAt}); const adv=await runAdversarialSuite({agentIds,timeoutMs,jobDeadlineAt});
  const coreAvg=core.leaderboard[0]?.average||0; const advAvg=adv.leaderboard[0]?.passRate||0; return {schema_version:'agent-killer.gauntlet.v1',id:`gauntlet_${Date.now().toString(36)}`,core,adversarial:adv,score:Math.round(coreAvg*0.7+advAvg*0.3)};
}
export async function runKillChain({agentId='mock',timeoutMs=180000,jobDeadlineAt}={}){
  const m=await loadManifest(); const phases=['discover','plan','build','break','repair','defend','prove']; const tasks=[];
  for(let i=0;i<phases.length;i++) tasks.push(m.tasks[i*5 % m.tasks.length].id);
  const core=await runSuite({agentIds:[agentId],taskIds:tasks,timeoutMs,jobDeadlineAt}); const adv=await runAdversarialSuite({agentIds:[agentId],timeoutMs,jobDeadlineAt});
  const survival=core.leaderboard[0]?.average>=95 && (adv.leaderboard[0]?.passRate||0)>=75;
  return {schema_version:'agent-killer.killchain.v1',id:`killchain_${Date.now().toString(36)}`,agent:agentId,phases,core,adversarial:adv,survived:survival};
}
