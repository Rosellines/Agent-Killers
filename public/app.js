const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
async function j(u,o){const r=await fetch(u,o);if(!r.ok)throw new Error(`${r.status}`);return r.json()}
async function load(){try{
  const [tasks,adv,subsPayload,board,v07]=await Promise.all([j('/api/tasks'),j('/api/adversarial'),j('/api/submissions?limit=50&offset=0'),j('/api/leaderboard'),j('/api/v07/trials')]);
  const subs=subsPayload?.submissions||[];
  $('#taskCount').textContent=tasks.tasks.length; $('#v07').innerHTML=(v07.trials||[]).map((t,i)=>`<div class="adv"><span class="pill">#${String(i+1).padStart(2,'0')}</span><div><b>${esc(t.title)}</b><div class="muted">${esc(t.description)}</div></div><span>☠${esc(t.difficulty)}</span></div>`).join(''); $('#advCount').textContent=adv.scenarios.length; $('#submissionCount').textContent=subs.length; $('#suiteCount').textContent=(board.recent||[]).length;
  const local=Array.isArray(board.global)?board.global:[]; const official=Array.isArray(board.official)?board.official:[]; const rows=[...official.map(x=>({...x,trust:'OFFICIAL'})),...local.map(x=>({...x,trust:'LOCAL'}))].slice(0,20);
  $('#board').innerHTML=rows.map((r,i)=>`<div class="row"><span>#${i+1}</span><div><b>${esc(r.agent)}</b><div class="muted">${esc(r.provider)} · ${esc(r.model)} · ${esc(r.version)} · ${esc(r.trust)}</div></div><span class="score">${esc(r.arenaScore??r.average??r.score??'—')}</span><span>${esc(r.coreAverage??r.average??'—')} core</span><span>${esc(r.adversarialPassRate??r.passRate??'—')}% adv</span><span>${esc(r.avgCoreDurationMs??r.avgDurationMs??0)} ms</span></div>`).join('')||'<div class="muted">No results yet.</div>';
  $('#adv').innerHTML=adv.scenarios.map(s=>`<div class="adv"><span class="pill">${esc(s.id)}</span><div><b>${esc(s.title)}</b><div class="muted">${esc(s.description)}</div></div><span>L${esc(s.difficulty)}</span></div>`).join('');
}catch(e){console.error(e);$('#board').innerHTML='<div class="muted">Dashboard data unavailable.</div>'}}
$('#refresh').onclick=load;
$('#roulette').onclick=async()=>{try{const x=await j('/api/blackbox',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({})});alert(`Black Box commitment:\n${x.commitment}\n\nTask identity remains sealed.`)}catch(e){alert('Black Box unavailable: '+e.message)}};
load();setInterval(load,15000);
