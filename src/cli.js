#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {ensureDirs,loadManifest,loadTask,makeWorkspace,evaluate} from './core.js';
import {probeAgents} from '../adapters/index.js';
import {runOne,runSuite,runAdversarial,runAdversarialSuite,latestSuites} from './runner.js';
import {listAdversarialScenarios} from './adversarial.js';
import {loadOrCreateSigningKey,verifyReceipt} from './receipts.js';
import {listSubmissions,verifySubmission,submitLocalSuite} from './submissions.js';
import {generatePack} from './challenge-pack.js';
import {agentDNA,dnaFromSuite} from './profiles.js';
import {runGauntlet,runKillChain} from './gauntlet.js';
import {selectBlackBox,recordBlackBoxSelection} from './blackbox.js';
import {startHuman,gradeHuman} from './human.js';
await ensureDirs(); const [,,cmd,...args]=process.argv; const flag=(n,d)=>{const i=args.indexOf(n);return i<0?d:(args[i+1]??true)};
const help=()=>console.log(`\nAGENT KILLER v0.7.15 — THE AGENT TRIAL\n\nlist                          list core tasks\nagents                        probe installed agents\nrun <agent> <task>            run one challenge\nsuite <agent...>              run core suite\nadversarial list|run|suite    adversarial arena\ngauntlet [agent]              7-stage trial\nkillchain [agent]             survive full kill chain\nroulette <agent>              random trial\nblackbox [seed]               sealed challenge commitment\ngenerate [count] [seed]       generate deterministic challenge pack\ndna <suite.json>              build Agent DNA profile\nmatrix                        model/provider/version leaderboard snapshots\nhuman start <task>            create human trial workspace
v07 list                     list the 15 v0.7 trials
v07 suite [agent...]         run all v0.7 trials
v07 self-test                reference-validate all 15 v0.7 trials
v07 deathmatch <a> <b>       compare two agents on v0.7 trials\nhuman grade <workspace>       grade human trial\nsubmit <suite.json> <agent>   create signed public submission\nverify-receipt <file>         verify Ed25519 receipt\nverify-submission <id>        verify stored submission\nkeygen                        create signing keypair\nvalidate                      validate benchmark pack\nself-test                     execute all 55 reference tasks\nserver                        start dashboard/API\n`);
if(!cmd){help();process.exit(0)}
if(cmd==='list'){for(const t of (await loadManifest()).tasks)console.log(`${t.id}  ${String(t.category).padEnd(18)} ${t.title}`)}
else if(cmd==='agents'){for(const [id,a] of Object.entries(await probeAgents()))console.log(`${a.installed?'✓':'·'} ${id.padEnd(10)} ${a.label}`)}
else if(cmd==='run'){const r=await runOne({agentId:args[0],taskId:args[1]||'AK-001',timeoutMs:Number(flag('--timeout',180000)),keepWorkspace:Boolean(flag('--keep',false)),provider:flag('--provider'),model:flag('--model'),version:flag('--version')});console.log(JSON.stringify({id:r.id,agent:r.agent,provider:r.provider,model:r.model,version:r.version,score:r.evaluation.score.total,checks:r.evaluation.checks},null,2))}
else if(cmd==='suite'){const agents=args.filter(x=>!x.startsWith('--'));const s=await runSuite({agentIds:agents.length?agents:['mock'],timeoutMs:Number(flag('--timeout',180000))});console.table(s.leaderboard);console.log(s.id)}
else if(cmd==='adversarial'&&args[0]==='list'){for(const s of listAdversarialScenarios())console.log(`${s.id}  ${s.title}`)}
else if(cmd==='adversarial'&&args[0]==='run'){console.log(JSON.stringify(await runAdversarial({agentId:args[1]||'mock',scenarioId:args[2]||'ADV-001',timeoutMs:Number(flag('--timeout',180000)),provider:flag('--provider'),model:flag('--model'),version:flag('--version')}),null,2))}
else if(cmd==='adversarial'&&args[0]==='suite'){const agents=args.slice(1).filter(x=>!x.startsWith('--'));const s=await runAdversarialSuite({agentIds:agents.length?agents:['mock'],timeoutMs:Number(flag('--timeout',180000))});console.table(s.leaderboard);console.log(s.id)}
else if(cmd==='gauntlet'){console.log(JSON.stringify(await runGauntlet({agentIds:[args[0]||'mock']}),null,2))}
else if(cmd==='killchain'){console.log(JSON.stringify(await runKillChain({agentId:args[0]||'mock'}),null,2))}
else if(cmd==='roulette'){const agent=args[0]||'mock';const seed=cryptoSeed();const pack=await selectBlackBox({seed});console.log(`ROULETTE SEALED — commitment ${pack.commitment}`);const r=await runOne({agentId:agent,taskId:pack.taskId});console.log(JSON.stringify({seed,selectedTask:pack.taskId,result:r.id,score:r.evaluation.score.total},null,2))}
else if(cmd==='blackbox'){const seed=args[0]||Date.now().toString();const s=await recordBlackBoxSelection(await selectBlackBox({seed}));console.log(JSON.stringify(s,null,2))}
else if(cmd==='generate'){const count=Math.max(1,Math.min(500,Number(args[0]||20)));const seed=args[1]||Date.now().toString();console.log(JSON.stringify(await generatePack({count,seed}),null,2))}
else if(cmd==='dna'){const suite=JSON.parse(await fs.readFile(args[0],'utf8'));console.log(JSON.stringify(await dnaFromSuite(suite),null,2))}
else if(cmd==='matrix'){const {globalLeaderboard}=await import('./runner.js');console.log(JSON.stringify(await globalLeaderboard(),null,2))}
else if(cmd==='human'&&args[0]==='start'){console.log(JSON.stringify(await startHuman(args[1]||'AK-001'),null,2))}
else if(cmd==='human'&&args[0]==='grade'){console.log(JSON.stringify(await gradeHuman(args[1]),null,2))}
else if(cmd==='keygen'){const k=await loadOrCreateSigningKey();console.log(k.generated?'Created new Ed25519 signing keypair.':'Signing keypair already exists.');console.log(k.publicKey)}
else if(cmd==='verify-receipt'){const x=JSON.parse(await fs.readFile(args[0],'utf8'));console.log(JSON.stringify(verifyReceipt(x),null,2))}
else if(cmd==='verify-submission'){console.log(JSON.stringify(await verifySubmission(args[0]),null,2))}
else if(cmd==='submit'){const suite=JSON.parse(await fs.readFile(args[0],'utf8'));const r=await submitLocalSuite({suite,agent:args[1],provider:flag('--provider'),model:flag('--model'),version:flag('--version'),claimant:flag('--claimant','anonymous'),track:flag('--track','core'),notes:flag('--notes','')});console.log(JSON.stringify({submissionId:r.submission_id,receipt:r.receipt.receipt_id,score:r.score},null,2))}
else if(cmd==='validate'){const m=await loadManifest();if(m.tasks.length!==55)throw new Error(`Expected 55 tasks, found ${m.tasks.length}`);const seen=new Set();for(const t of m.tasks){if(seen.has(t.id))throw new Error('duplicate '+t.id);seen.add(t.id);for(const k of ['kind','variant','checks'])if(!(k in t))throw new Error(`missing ${k} in ${t.id}`)}const {generatePack}=await import('./challenge-pack.js');const {generatedVisibleTest,generatedHiddenTest,isParametricKind}=await import('./generated.js');const pack=await generatePack({seed:'validate-behavioral-pack',count:12});if(pack.tasks.some(t=>!isParametricKind(t.kind)||!generatedVisibleTest(t)||!generatedHiddenTest(t)||!t.generator?.fingerprint))throw new Error('generated pack contract validation failed');let generatedPass=0;for(const t of pack.tasks){const r=await runOne({agentId:'mock',taskId:t.id,timeoutMs:30000});if(r.evaluation.checks.visible_tests&&r.evaluation.checks.hidden_tests&&r.evaluation.checks.mutation_killed)generatedPass++;}let advStatus='skipped (official Docker isolation unavailable)';if(process.env.AK_OFFICIAL_MODE==='1'){const {runAdversarial}=await import('./runner.js');const adv=await runAdversarial({agentId:'mock',scenarioId:'ADV-001',timeoutMs:30000});if(!adv.evaluation?.pass)throw new Error('adversarial representative validation failed');advStatus='passed'}console.log(`VALID: manifest (${m.tasks.length}) + generated behavioral ${generatedPass}/${pack.tasks.length} + adversarial representative ${advStatus}; schemas verified by execution`)}
else if(cmd==='self-test'){const m=await loadManifest();let ok=0,hidden=0,mut=0;for(const t of m.tasks){const r=await runOne({agentId:'mock',taskId:t.id});if(r.evaluation.score.total>=95)ok++;if(r.evaluation.checks.hidden_tests)hidden++;if(r.evaluation.checks.mutation_killed)mut++}console.log(`SELF-TEST ${ok}/${m.tasks.length} >=95 | hidden ${hidden}/${m.tasks.length} | mutation ${mut}/${m.tasks.length}`);if(ok!==m.tasks.length||hidden!==m.tasks.length||mut!==m.tasks.length)process.exit(1)}
else if(cmd==='v07'&&args[0]==='list'){const {listV07Trials}=await import('./v07.js');for(const t of listV07Trials())console.log(`${t.id}  L${t.difficulty}  ${t.title}`)}
else if(cmd==='v07'&&args[0]==='suite'){const {runV07Suite}=await import('./v07.js');const agents=args.slice(1).filter(x=>!x.startsWith('--'));const s=await runV07Suite({agentIds:agents.length?agents:['mock'],timeoutMs:Number(flag('--timeout',180000))});console.table(s.leaderboard);console.log(s.id)}
else if(cmd==='v07'&&args[0]==='self-test'){const {runV07SelfTest}=await import('./v07.js');console.log(JSON.stringify(await runV07SelfTest(),null,2));}
else if(cmd==='v07'&&args[0]==='deathmatch'){const {runV07Deathmatch}=await import('./v07.js');console.log(JSON.stringify(await runV07Deathmatch(args[1]||'mock',args[2]||'mock'),null,2));}
else if(cmd==='server'){await import('./server.js')}else help();
function cryptoSeed(){return `${Date.now()}-${Math.random().toString(36).slice(2)}`}
