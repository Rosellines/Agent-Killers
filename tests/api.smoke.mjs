import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['src/server.js'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
let port=null;let log='';child.stdout.on('data',d=>{log+=d.toString();const m=log.match(/http:\/\/[^:]+:(\d+)/);if(m)port=Number(m[1])});
const wait=async()=>{for(let i=0;i<100;i++){if(port)return;await new Promise(r=>setTimeout(r,25));}throw new Error('server did not announce port')};
const get=(p)=>new Promise((resolve,reject)=>{http.get(`http://127.0.0.1:${port}${p}`,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({status:res.statusCode,body:d}))}).on('error',reject)});
try{await wait();for(const p of ['/api/health','/api/agents','/api/tasks','/api/adversarial','/api/leaderboard','/api/submissions','/','/api/v07/trials','/api/v07/status']){const r=await get(p);if(r.status!==200)throw new Error(`${p}: ${r.status}`)}const lb=JSON.parse((await get('/api/leaderboard')).body);assert.ok(Array.isArray(lb.global)&&Array.isArray(lb.recent));console.log('API SMOKE OK')}finally{child.kill('SIGTERM')}
