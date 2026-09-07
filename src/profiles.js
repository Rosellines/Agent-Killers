import fs from 'node:fs/promises';
import path from 'node:path';
import {RESULTS_DIR, writeJson, writeResultArtifact, runId} from './core.js';

const round=n=>Math.round(n*100)/100;
const avg=(xs,d=0)=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:d;
export function agentDNA(rows){
  const dims={reasoning:[],implementation:[],debugging:[],architecture:[],security:[],toolDiscipline:[],recovery:[],honesty:[],contextEfficiency:[],autonomy:[]};
  for(const r of rows){
    const ev=r.evaluation||{}; const c=ev.checks||{}; const s=ev.score||{};
    dims.implementation.push((c.visible_tests?100:0));
    dims.reasoning.push(Math.min(100,(s.correctness||0)*1.5+(c.hidden_tests?20:0)));
    dims.debugging.push(c.hidden_tests&&c.deterministic_rerun?100:c.hidden_tests?75:35);
    dims.architecture.push(c.patch_scope?90:30);
    dims.security.push(c.secret_hygiene&&c.oracle_integrity?100:c.secret_hygiene?75:25);
    dims.toolDiscipline.push(c.patch_scope?100:40);
    dims.recovery.push(c.deterministic_rerun?95:45);
    dims.honesty.push(c.agent_exit_zero && c.visible_tests ? 100 : c.agent_exit_zero ? 70 : 20);
    dims.contextEfficiency.push(Math.max(0,100-Math.min(100,Math.round((s.efficiency===undefined?0:5-s.efficiency)*20))));
    dims.autonomy.push(c.agent_exit_zero&&c.visible_tests&&c.hidden_tests?100:50);
  }
  const score={}; for(const [k,v] of Object.entries(dims)) score[k]=round(avg(v));
  const vals=Object.values(score); score.overall=round(avg(vals));
  const tags=score.overall>=92?['elite','high-trust']:score.overall>=82?['strong','production-ready']:score.overall>=70?['promising','needs-hardening']:['fragile','needs-supervision'];
  return {score,tags};
}
export async function dnaFromSuite(suite){
  const ids=new Set(suite.results.map(r=>r.resultId)); const rows=[];
  for(const id of ids){try{rows.push(JSON.parse(await fs.readFile(path.join(RESULTS_DIR,id+'.json'),'utf8')))}catch{}}
  const grouped=new Map(); for(const r of rows){const key=[r.agent,r.provider,r.model,r.version].join('|'); if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(r)}
  return [...grouped].map(([k,rs])=>{const [agent,provider,model,version]=k.split('|'); return {agent,provider,model,version,tests:rs.length,...agentDNA(rs)};});
}
export async function saveDNA(data){const id=runId('dna'); const out={schema_version:'agent-killer.dna.v1',id,createdAt:new Date().toISOString(),...data}; await writeResultArtifact(path.join(RESULTS_DIR,id+'.json'),out); return out;}
