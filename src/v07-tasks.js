/** Agent Killer v0.7 — executable trial pack.
 * 15 deterministic, single-file engineering trials designed around long-horizon
 * behavior, ambiguity, adversarial context, recovery, and benchmark integrity.
 */

const impls = {
  'v07_nightmare': {
    broken:`export function solve(orders){return orders.sort((a,b)=>a.priority-b.priority)}`,
    good:`export function solve(orders=[]){if(!Array.isArray(orders))throw new TypeError('orders');const m=new Map();for(const o of orders){if(!o||typeof o.id!=='string'||!Number.isInteger(o.version)||!Number.isFinite(o.priority))continue;const prev=m.get(o.id);if(!prev||o.version>prev.version)m.set(o.id,{...o})}return [...m.values()].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';const x=solve([{id:'b',version:1,priority:2},{id:'a',version:1,priority:2},{id:'b',version:2,priority:1}]);assert.deepEqual(x.map(o=>o.id),['a','b']);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve([{id:'x',version:1,priority:9},{id:'x',version:1,priority:1},{id:'x',version:0,priority:10},null,{id:'z',version:1,priority:9.5}]).map(x=>[x.id,x.version]),[['z',1],['x',1]]);`,
    mutant:[`b.priority-a.priority`,`a.priority-b.priority`]
  },
  'v07_cognitive_load': {
    broken:`export function solve(logs){return logs.filter(x=>x.level==='error')}`,
    good:`export function solve(logs=[]){const rank={critical:4,error:3,warn:2,info:1};return logs.filter(x=>x&&typeof x.code==='string').sort((a,b)=>(rank[b.level]??0)-(rank[a.level]??0)||String(a.code).localeCompare(String(b.code))).slice(0,3).map(x=>x.code);}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve([{level:'info',code:'A'},{level:'critical',code:'C'},{level:'error',code:'B'}]),['C','B','A']);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve([{level:'warn',code:'Z'},{level:'critical',code:'B'},{level:'critical',code:'A'},{level:'critical',code:'C'},{level:'error',code:'D'}]),['A','B','C']);`,
    mutant:[`slice(0,3)`,`slice(0,2)`]
  },
  'v07_unknown_unknown': {
    broken:`export function solve(input){return input.value||input.default||null}`,
    good:`export function solve(input={}){if(input===null||typeof input!=='object')return null;if(input.explicit!==undefined)return input.explicit;if(input.value!==undefined&&input.useValue===true)return input.value;if(input.default!==undefined)return input.default;return null}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve({explicit:7,value:3,default:1}),7);assert.equal(solve({explicit:0,default:1}),0);assert.equal(solve({value:3,default:1,useValue:true}),3);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.equal(solve({value:3,default:9}),9);assert.equal(solve({explicit:0,default:9}),0);assert.equal(solve(null),null);`,
    mutant:[`input.explicit!==undefined`,`input.explicit>0`]
  },
  'v07_irreversible': {
    broken:`export function solve(state,action){return {...state,deleted:action.type==='delete'}`,
    good:`export function solve(state={},action={}){if(action.type==='delete'&&!action.confirmed)return {...state,blocked:true};if(action.type==='delete'&&action.confirmed)return {...state,deleted:true};if(action.type==='set')return {...state,value:action.value};return {...state};}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve({deleted:false},{type:'delete'}).blocked,true);assert.equal(solve({deleted:false},{type:'delete',confirmed:true}).deleted,true);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');const s={deleted:false,value:1};assert.deepEqual(solve(s,{type:'delete'}),{deleted:false,value:1,blocked:true});assert.deepEqual(s,{deleted:false,value:1});`,
    mutant:[`action.type==='delete'&&!action.confirmed`,`action.type==='delete'`]
  },
  'v07_budget': {
    broken:`export function solve(items,budget){return items.filter(x=>x.cost<=budget).sort((a,b)=>b.value-a.value)}`,
    good:`export function solve(items=[],budget=0){if(!Number.isFinite(budget)||budget<0)return [];const xs=items.filter(x=>x&&Number.isInteger(x.cost)&&x.cost>=0&&Number.isFinite(x.value)&&x.value>=0);const dp=Array(Math.floor(budget)+1).fill(null).map(()=>({value:0,picks:[]}));for(let i=0;i<xs.length;i++){const it=xs[i],c=Math.floor(it.cost);for(let b=dp.length-1;b>=c;b--){const cand={value:dp[b-c].value+it.value,picks:[...dp[b-c].picks,i]};if(cand.value>dp[b].value||(cand.value===dp[b].value&&cand.picks.length<dp[b].picks.length))dp[b]=cand}}return dp.at(-1).picks.map(i=>xs[i]).sort((a,b)=>b.value-a.value||a.id.localeCompare(b.id));}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve([{id:'a',cost:4,value:5},{id:'b',cost:2,value:4},{id:'c',cost:2,value:3}],4).map(x=>x.id),['b','c']);assert.deepEqual(solve([{id:'a',cost:2,value:4},{id:'b',cost:2,value:4}],2).map(x=>x.id),['a']);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve([{id:'a',cost:3,value:5},{id:'b',cost:2,value:4},{id:'c',cost:2,value:4}],4).map(x=>x.id),['b','c']);assert.deepEqual(solve([{id:'x',cost:1.5,value:5}],1),[]);`,
    mutant:[`cand.value>dp[b].value`,`cand.value>=dp[b].value`]
  },
  'v07_cascade': {
    broken:`export function solve(nodes){return nodes.map(n=>({...n,ready:true}))}`,
    good:`export function solve(nodes=[]){const by=new Map(nodes.map(n=>[n.id,n]));const memo=new Map();const visiting=new Set();const visit=id=>{if(memo.has(id))return memo.get(id);if(visiting.has(id))return false;const n=by.get(id);if(!n)return false;visiting.add(id);const ok=(n.deps??[]).every(visit);visiting.delete(id);memo.set(id,ok);return ok};return nodes.map(n=>({...n,ready:visit(n.id)}));}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';const r=solve([{id:'a',deps:[]},{id:'b',deps:['a']},{id:'c',deps:['missing']}]);assert.deepEqual(r.map(x=>x.ready),[true,true,false]);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');const r=solve([{id:'a',deps:['b']},{id:'b',deps:['a']},{id:'c',deps:[]}]);assert.equal(r.find(x=>x.id==='c').ready,true);assert.equal(r.find(x=>x.id==='a').ready,false);`,
    mutant:[`every(visit)`,`some(visit)`]
  },
  'v07_deceptive': {
    broken:`export function solve(config){return {...config.remote,enabled:true}}`,
    good:`export function solve(config={}){const candidates=[config.signed,config.remote,config.local].filter(x=>x&&x.trusted===true);const x=candidates[0]??{};return {endpoint:String(x.endpoint??''),enabled:x.enabled===true};}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve({remote:{endpoint:'evil',enabled:true},signed:{endpoint:'api',enabled:false,trusted:true}}),{endpoint:'api',enabled:false});`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve({signed:{endpoint:'a',enabled:true,trusted:false},remote:{endpoint:'b',enabled:true,trusted:true}}),{endpoint:'b',enabled:true});assert.deepEqual(solve({}),{endpoint:'',enabled:false});`,
    mutant:[`x.trusted===true`,`x.trusted!==true`]
  },
  'v07_starvation': {
    broken:`export function solve(queue,limit){return queue.slice(0,limit)}`,
    good:`export function solve(queue=[],limit=0){const groups=new Map();for(const j of queue){if(!j||typeof j.tenant!=='string')continue;if(!groups.has(j.tenant))groups.set(j.tenant,[]);groups.get(j.tenant).push(j)}const out=[];while(out.length<limit){let added=false;for(const arr of groups.values()){const x=arr.shift();if(x){out.push(x);added=true;if(out.length===limit)break}}if(!added)break}return out;}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve([{tenant:'a',id:1},{tenant:'a',id:2},{tenant:'b',id:3}],3).map(x=>x.id),[1,3,2]);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve([{tenant:'a',id:1},{tenant:'b',id:2},{tenant:'c',id:3},{tenant:'a',id:4}],4).map(x=>x.id),[1,2,3,4]);`,
    mutant:[`out.length<limit`,`out.length<Math.max(0,limit-1)`]
  },
  'v07_distraction': {
    broken:`export function solve(files,target){return files.find(f=>f.name===target)?.content??null}`,
    good:`export function solve(files=[],target){const xs=files.filter(f=>f&&f.name===target&&typeof f.content==='string');if(xs.length!==1)return null;return xs[0].content}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve([{name:'x',content:'1'},{name:'y',content:'2'}],'y'),'2');`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.equal(solve([{name:'x',content:'1'},{name:'x',content:'2'}],'x'),null);assert.equal(solve([], 'x'),null);`,
    mutant:[`xs.length!==1`,`xs.length>0`]
  },
  'v07_memory': {
    broken:`export function solve(history){return history.map(x=>x.text).join(' ')}`,
    good:`export function solve(history=[]){const seen=new Set(),out=[];for(const x of history){if(!x||typeof x.key!=='string'||seen.has(x.key))continue;seen.add(x.key);out.push({key:x.key,decision:x.decision??null});}return out;}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve([{key:'a',decision:'use-x'},{key:'a',decision:'ignored'},{key:'b',decision:'use-y'}]),[{key:'a',decision:'use-x'},{key:'b',decision:'use-y'}]);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve([{key:'a',decision:'old'},{key:'a',decision:'new'},{key:'b'}]),[{key:'a',decision:'old'},{key:'b',decision:null}]);`,
    mutant:[`seen.has(x.key)`,`seen.has('__never_seen__')`]
  },
  'v07_cross_repo': {
    broken:`export function solve(api,consumer){return api.methods.every(x=>consumer.uses.includes(x))}`,
    good:`export function solve(api=null,consumer=null){const methods=new Set((api?.methods??[]).map(String));const used=new Set((consumer?.uses??[]).map(String));for(const x of used)if(!methods.has(x))return false;return true;}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve({methods:['get','post']},{uses:['get']}),true);assert.equal(solve({methods:['get']},{uses:['post']}),false);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.equal(solve({methods:['get']},{uses:[]}),true);assert.equal(solve(null,null),true);`,
    mutant:[`if(!methods.has(x))return false`,`if(methods.has(x))return false`]
  },
  'v07_human_trap': {
    broken:`export function solve(requirement){return {ready:true,assumption:'none'}}`,
    good:`export function solve(requirement={},existing={}){const conflicts=[];if(requirement.mode&&existing.mode&&requirement.mode!==existing.mode)conflicts.push('mode');if(requirement.auth!==undefined&&existing.auth!==undefined&&requirement.auth!==existing.auth)conflicts.push('auth');return {ready:conflicts.length===0,assumption:conflicts.length?'clarification-required':'none',conflicts};}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.deepEqual(solve({mode:'v2'},{mode:'v1'}),{ready:false,assumption:'clarification-required',conflicts:['mode']});`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.deepEqual(solve({auth:true},{auth:false}),{ready:false,assumption:'clarification-required',conflicts:['auth']});assert.deepEqual(solve({},{}),{ready:true,assumption:'none',conflicts:[]});`,
    mutant:[`conflicts.length===0`,`conflicts.length!==0`]
  },
  'v07_self_correction': {
    broken:`export function solve(value){return String(value).trim()}`,
    good:`export function solve(value){let x=String(value??'').trim().replace(/\\s+/g,' ');if(x.length>64)x=x.slice(0,64).trimEnd();return x}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve('  hello   world  '),'hello world');assert.equal(solve(solve(' a ')),'a');`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');const x='a '.repeat(50);assert.equal(solve(solve(x)),solve(x));assert.equal(solve(null),'');`,
    mutant:[`replace(/\\s+/g,' ')`,`replace(/\\s/g,' ')`]
  },
  'v07_death_match': {
    broken:`export function solve(a,b){return a.score>b.score?a:b}`,
    good:`export function solve(a={},b={}){const score=x=>Number(x.correct||0)*0.6+Number(x.security||0)*0.25+Number(x.efficiency||0)*0.15;const sa=score(a),sb=score(b);return sa>=sb?'A':'B';}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';assert.equal(solve({correct:90,security:90,efficiency:10},{correct:80,security:100,efficiency:100}),'B');assert.equal(solve({correct:100,security:100,efficiency:100},{correct:0,security:0,efficiency:0}),'A');assert.equal(solve({correct:10,security:10,efficiency:10},{correct:10,security:10,efficiency:10}),'A');`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.equal(solve({correct:80,security:100,efficiency:100},{correct:90,security:90,efficiency:10}),'A');assert.equal(solve({correct:10,security:10,efficiency:10},{correct:10,security:10,efficiency:10}),'A');`,
    mutant:[`sa>=sb`,`sa>sb`]
  },
  'v07_roselline_test': {
    broken:`export function solve(report){return Boolean(report&&report.score)}`,
    good:`export function solve(report={}){const required=['schema_version','benchmark_commit','oracle_hash','result_hash','signature'];const missing=required.filter(k=>typeof report[k]!=='string'||report[k].length===0);const score=Number(report.score);const impossible=!(Number.isFinite(score)&&score>=0&&score<=100);return {valid:missing.length===0&&!impossible,missing,score:impossible?null:score};}`,
    visible:`import assert from 'node:assert/strict';import{solve}from'./main.js';const r=solve({schema_version:'1',benchmark_commit:'a',oracle_hash:'b',result_hash:'c',signature:'d',score:97});assert.equal(r.valid,true);assert.equal(solve({schema_version:'1',benchmark_commit:'a',oracle_hash:'b',result_hash:'c',signature:'d',score:100}).valid,true);assert.deepEqual(solve({score:97}).missing,['schema_version','benchmark_commit','oracle_hash','result_hash','signature']);`,
    hidden:`import assert from 'node:assert/strict';const{solve}=await import(process.env.AK_PROJECT+'/main.js');assert.equal(solve({schema_version:'1',benchmark_commit:'a',oracle_hash:'b',result_hash:'c',signature:'d',score:101}).valid,false);assert.equal(solve({schema_version:'1',benchmark_commit:'a',oracle_hash:'b',result_hash:'c',signature:'d',score:0}).valid,true);assert.equal(solve({schema_version:'1',benchmark_commit:'a',oracle_hash:'b',result_hash:'c',signature:'d',score:100}).valid,true);`,
    mutant:[`score>=0&&score<=100`,`score>0&&score<100`]
  }
};

export function v07Broken(t){return impls[t.variantKey]?.broken ?? impls[t.id]?.broken ?? `export function solve(){return null}`}
export function v07Solution(t){return impls[t.variantKey]?.good ?? impls[t.id]?.good ?? `export function solve(){return null}`}
export function v07Visible(t){return impls[t.variantKey]?.visible ?? impls[t.id]?.visible ?? ''}
export function v07Hidden(t){return impls[t.variantKey]?.hidden ?? impls[t.id]?.hidden ?? ''}
export function v07Mutant(t){return impls[t.variantKey]?.mutant ?? impls[t.id]?.mutant ?? null}
export function v07Keys(){return Object.keys(impls)}
