import {readJson,commandExists} from '../src/core.js';
export const loadAgents=()=>readJson(new URL('./agents.json',import.meta.url));
export async function probeAgents(){const a=await loadAgents(),o={};for(const [id,x] of Object.entries(a))o[id]={...x,installed:x.type==='builtin'||x.type==='custom'?true:await commandExists(x.command)};return o}
export const buildArgs=(a,p)=>(a.args||[]).map(x=>x.replaceAll('{prompt}',p));
