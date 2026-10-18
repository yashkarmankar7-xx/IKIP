/* ============================================================
   IKIP — Industrial Knowledge Intelligence Platform (Web Prototype)
   Vanilla JS SPA — mock-data only, no backend.
   ============================================================ */

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

/* ---------- THEME ---------- */
function initTheme(){
  const saved = localStorage.getItem ? null : null; // storage disallowed per artifact rules; default to light
  document.documentElement.setAttribute('data-theme', 'light');
}
function toggleTheme(){
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  $$('.theme-opt').forEach(o => o.classList.toggle('active', o.dataset.theme === next));
  const icon = $('#themeIcon'); if(icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

/* ---------- SCREEN NAV (splash/onboarding/auth/app) ---------- */
function showScreen(id){
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#'+id).classList.add('active');
}

/* ---------- PAGE NAV (inside app shell) ---------- */
const PAGES = ['dashboard','machines','machine-detail','ai','reports','notifications','profile','settings'];
function showPage(id, opts={}){
  $$('.main-col > .page').forEach(el => { el.classList.toggle('active', el.id === 'page-'+id); el.style.removeProperty('display'); });
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page===id));
  $$('.bn-item').forEach(n => n.classList.toggle('active', n.dataset.page===id));
  window.scrollTo({top:0, behavior:'smooth'});
  if(id === 'machine-detail' && opts.machineId){ renderMachineDetail(opts.machineId); }
}

/* ---------- ONBOARDING ---------- */
let obIndex = 0;
function renderOnboardDots(){
  $('#onboardDots').innerHTML = [0,1,2].map(i=>`<span class="${i===obIndex?'active':''}"></span>`).join('');
}
function goOnboard(i){
  obIndex = Math.max(0, Math.min(2, i));
  $$('.onboard-slide').forEach((s,idx)=> s.classList.toggle('active', idx===obIndex));
  renderOnboardDots();
  $('#onboardNext').textContent = obIndex === 2 ? 'Get Started' : 'Next';
}

/* ---------- STATUS HELPERS ---------- */
function statusMeta(status){
  if(status==='healthy') return {cls:'status-healthy', label:'Healthy', color:'var(--color-success)'};
  if(status==='warning') return {cls:'status-warning', label:'Warning', color:'var(--color-warning)'};
  return {cls:'status-critical', label:'Critical', color:'var(--color-danger)'};
}
function machineThumbBg(status){
  if(status==='healthy') return 'var(--glow-success)';
  if(status==='warning') return 'var(--glow-warning)';
  return 'var(--glow-danger)';
}

/* ---------- DASHBOARD ---------- */
function renderDashboard(){
  const d = IKIP_DATA;
  $('#welcomeName').textContent = d.currentUser.name;
  $('#welcomeRole').textContent = d.currentUser.role;
  $('#welcomeDate').textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

  const ov = d.overview;
  $('#statTotal').textContent = ov.total;
  $('#statHealthy').textContent = ov.healthy;
  $('#statWarning').textContent = ov.warning;
  $('#statCritical').textContent = ov.critical;

  // machine health scroller (top 5)
  $('#dashMachineScroll').innerHTML = d.machines.map(m => machineCardHTML(m)).join('');

  // timeline
  $('#timelineList').innerHTML = d.timeline.map(t => `
    <li>
      <span class="t-time">${t.time}</span>
      <span class="t-dot" style="background:${TONE_COLOR[t.tone]||'var(--color-primary)'}"></span>
      <span class="t-txt">${t.text}</span>
    </li>`).join('');

  drawLineChart('#dashChart', dashChartData('temp'));
  $$('.chart-tab').forEach(t => t.addEventListener('click', () => {
    $$('.chart-tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    drawLineChart('#dashChart', dashChartData(t.dataset.metric));
  }));
}

function dashChartData(metric){
  const series = {
    temp: [62,66,64,70,74,71,68,75,79,76,71,73],
    vibration: [1.8,2.1,2.0,2.6,3.2,4.1,3.8,4.4,4.8,4.2,3.9,4.1],
    health: [92,91,90,89,87,85,84,82,80,79,78,78],
  };
  const colors = { temp:'#FB8C00', vibration:'#E53935', health:'#2E7D32' };
  return { values:series[metric], color:colors[metric] };
}

function machineCardHTML(m){
  const s = statusMeta(m.status);
  return `
  <div class="machine-card" onclick="navigateToMachine('${m.id}')">
    <div class="m-top">
      <div class="machine-thumb" style="background:${machineThumbBg(m.status)}">${m.icon}</div>
      <div>
        <div class="m-name">${m.name}</div>
        <div class="m-id">${m.id}</div>
      </div>
      <span class="status-badge ${s.cls}" style="margin-left:auto">${s.label}</span>
    </div>
    <div class="m-metrics">
      <span>Health <b>${m.health}%</b></span>
      <span>Temp <b>${m.temp}°C</b></span>
      <span>Vib <b>${m.vibration}mm/s</b></span>
    </div>
    <div class="m-health-bar"><span style="width:${m.health}%; background:${s.color}"></span></div>
  </div>`;
}

function navigateToMachine(id){
  showPage('machine-detail', {machineId:id});
}

/* ---------- MACHINES LIST ---------- */
let machineFilter = 'all';
function renderMachinesList(){
  const grid = $('#machinesGrid');
  const list = IKIP_DATA.machines.filter(m => machineFilter==='all' || m.status===machineFilter);
  grid.innerHTML = list.length ? list.map(machineCardHTML).join('') : emptyStateHTML('🔍','No machines match this filter','Try selecting a different status filter.');
}
function setMachineFilter(f, el){
  machineFilter = f;
  $$('#machineFilters .filter-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderMachinesList();
}

function emptyStateHTML(icon,title,sub){
  return `<div class="empty-state"><div class="e-ic">${icon}</div><h4>${title}</h4><p>${sub}</p></div>`;
}

/* ---------- MACHINE DETAIL ---------- */
function renderMachineDetail(id){
  const m = IKIP_DATA.machines.find(x=>x.id===id) || IKIP_DATA.machines[0];
  const s = statusMeta(m.status);
  $('#detailHero').innerHTML = `
    <div class="thumb">${m.icon}</div>
    <div>
      <h2>${m.name}</h2>
      <div class="m-id">${m.id} · ${m.location}</div>
      <span class="status-badge ${s.cls}" style="margin-top:8px">${s.label}</span>
    </div>
    <div class="ring">
      <div class="num">${m.health}%</div>
      <div class="lbl">Health</div>
    </div>`;

  // Overview tab
  $('#tabOverview').innerHTML = `
    <div class="kv-grid">
      <div class="kv"><div class="k">Machine Type</div><div class="v">${m.type}</div></div>
      <div class="kv"><div class="k">Manufacturer</div><div class="v">${m.manufacturer}</div></div>
      <div class="kv"><div class="k">Installation Date</div><div class="v">${m.installed}</div></div>
      <div class="kv"><div class="k">Running Hours</div><div class="v">${m.hours}</div></div>
      <div class="kv"><div class="k">Location</div><div class="v">${m.location}</div></div>
      <div class="kv"><div class="k">Health</div><div class="v">${m.health}%</div></div>
    </div>`;

  // Monitoring tab
  $('#tabMonitoring').innerHTML = `
    <div class="gauge-row">
      ${gaugeHTML(m.temp,120,'°C','Temperature','var(--color-warning)')}
      ${gaugeHTML(m.vibration,10,'mm/s','Vibration','var(--color-danger)')}
      ${gaugeHTML(m.health,100,'%','Health','var(--color-success)')}
    </div>
    <div class="card chart-card"><div class="card-title-row"><h3>Live Trend (dummy feed)</h3></div>
      <div class="chart-wrap"><canvas id="detailChart"></canvas></div>
    </div>`;

  // Maintenance tab
  const services = [
    {title:'Bearing Lubrication', meta:`Completed · ${IKIP_DATA.engineers[0]} · 02 Jul 2026`, tone:'success'},
    {title:'Vibration Sensor Calibration', meta:`Completed · ${IKIP_DATA.engineers[1]} · 18 Jun 2026`, tone:'success'},
    {title:`Upcoming: Full Inspection`, meta:`Scheduled · ${IKIP_DATA.engineers[2]} · 28 Jul 2026`, tone:'warning'},
  ];
  $('#tabMaintenance').innerHTML = services.map(sv=>`
    <div class="service-row">
      <span class="service-dot" style="background:${TONE_COLOR[sv.tone]}"></span>
      <div><div class="s-title">${sv.title}</div><div class="s-meta">${sv.meta}</div></div>
    </div>`).join('');

  // Documents tab
  const docs = ['Operator Manual','Maintenance Manual','Inspection Report','Safety SOP'];
  $('#tabDocuments').innerHTML = `<div class="doc-list">${docs.map(d=>`
    <div class="doc-card"><div class="doc-ic">📄</div><div><div class="d-name">${d}</div><div class="d-meta">PDF · 1.2 MB</div></div></div>`).join('')}</div>`;

  // History tab
  $('#tabHistory').innerHTML = `<ul class="timeline">${IKIP_DATA.timeline.map(t=>`
    <li><span class="t-time">${t.time}</span><span class="t-dot" style="background:${TONE_COLOR[t.tone]}"></span><span class="t-txt">${t.text}</span></li>`).join('')}</ul>`;

  // AI Analysis tab
  $('#tabAI').innerHTML = `
    <div class="ai-card" style="margin-bottom:0">
      <div class="tag">🤖 AI Analysis</div>
      <h4>Risk Level: ${m.status==='critical'?'High':m.status==='warning'?'Moderate':'Low'}</h4>
      <p>Possible failure mode: ${m.status==='healthy'?'None detected in current window.':'Bearing wear correlated with rising vibration and temperature trend.'}</p>
      <p style="margin-top:8px"><strong>Recommendation:</strong> ${m.status==='healthy'?'Continue standard monitoring cadence.':'Schedule inspection within the next maintenance cycle.'}</p>
      <div style="margin-top:12px">
        <div class="k" style="font-size:12px;color:var(--color-text-secondary);margin-bottom:4px">Confidence Score</div>
        <div class="confidence-bar"><span style="width:${m.status==='critical'?92:m.status==='warning'?78:64}%"></span></div>
      </div>
    </div>`;

  setDetailTab('overview');
  setTimeout(()=>drawLineChart('#detailChart', {values:[m.temp-12,m.temp-8,m.temp-6,m.temp-3,m.temp-1,m.temp,m.temp+1], color:'#1565C0'}), 30);
}

function gaugeHTML(val,max,unit,label,color){
  const pct = Math.min(100, Math.round((val/max)*100));
  return `<div class="card gauge-card">
    <div class="gauge" style="background:conic-gradient(${color} ${pct*3.6}deg, var(--color-bg) 0deg)">
      <div style="width:78%;height:78%;border-radius:50%;background:var(--color-card);display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <span class="g-val">${val}${unit}</span>
      </div>
    </div>
    <div class="g-lbl">${label}</div>
  </div>`;
}

function setDetailTab(tab){
  $$('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.tab-panel').forEach(p=>p.classList.toggle('active', p.id==='tab'+capitalize(tab)));
}
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1).replace(/-([a-z])/g,(m,c)=>c.toUpperCase()); }

/* ---------- AI ASSISTANT ---------- */
let aiMessages = [...IKIP_DATA.aiSeed];
function renderAI(){
  $('#aiSuggestChips').innerHTML = IKIP_DATA.aiSuggestions.map(s=>`<button class="sugg-chip" onclick="sendAIMessage('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
  renderAIMessages();
}
function renderAIMessages(){
  $('#aiMessages').innerHTML = aiMessages.map(m=>`<div class="msg ${m.from==='user'?'user':'bot'}">${m.text}</div>`).join('');
  $('#aiMessages').scrollTop = $('#aiMessages').scrollHeight;
}
function sendAIMessage(text){
  const input = $('#aiInput');
  const val = text || input.value.trim();
  if(!val) return;
  aiMessages.push({from:'user', text: escapeHTML(val)});
  input.value = '';
  renderAIMessages();
  const wrap = $('#aiMessages');
  const typing = document.createElement('div');
  typing.className='typing-dots'; typing.id='typingDots';
  typing.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(typing);
  wrap.scrollTop = wrap.scrollHeight;
  setTimeout(()=>{
    $('#typingDots')?.remove();
    aiMessages.push({from:'bot', text: mockAIReply(val)});
    renderAIMessages();
  }, 900);
}
function mockAIReply(q){
  const s = q.toLowerCase();
  if(s.includes('vibration')) return "Compressor CP-17 shows a vibration reading of <code>7.6 mm/s</code>, up 24% over the past week. This pattern is typically associated with early-stage bearing wear. Recommended action: schedule a bearing inspection within 24 hours.";
  if(s.includes('history') || s.includes('maintenance')) return "Here's the recent maintenance activity: bearing lubrication (02 Jul), sensor calibration (18 Jun), and an upcoming full inspection scheduled for 28 Jul with " + IKIP_DATA.engineers[2] + ".";
  if(s.includes('bearing')) return "Standard bearing replacement procedure: 1) Lock out / tag out the machine. 2) Remove the coupling guard. 3) Extract the worn bearing with a puller. 4) Clean the housing and inspect for scoring. 5) Press-fit the new bearing and re-lubricate. 6) Run a vibration check before returning to service.";
  if(s.includes('overheat') || s.includes('temperature')) return "Motor overheating is most often caused by blocked ventilation, bearing friction, or sustained overload. Current readings are within the warning band — I'd recommend checking airflow around the housing and confirming load is within rated capacity.";
  return "I can help with that. Based on current sensor data across your 24 monitored assets, everything outside Compressor CP-17 and Boiler B-01 is operating within normal parameters. Want a full plant health summary?";
}
function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- REPORTS ---------- */
function renderReports(){
  $('#reportsGrid').innerHTML = IKIP_DATA.reports.map(r=>`
    <div class="card report-card">
      <div class="r-top">
        <div class="report-ic">📊</div>
        <span class="status-badge ${r.status==='Completed'?'status-healthy':'status-warning'}">${r.status}</span>
      </div>
      <div class="r-name">${r.name}</div>
      <div class="r-meta">${r.type} · ${r.date}</div>
      <div class="report-actions">
        <button class="icon-btn" title="Preview" onclick="toast('Preview coming soon')">👁</button>
        <button class="icon-btn" title="Download" onclick="toast('Report downloaded')">⬇</button>
        <button class="icon-btn" title="Share" onclick="toast('Share link copied')">🔗</button>
      </div>
    </div>`).join('');
}

/* ---------- NOTIFICATIONS ---------- */
function renderNotifications(){
  const groups = {critical:[],warning:[],info:[],success:[]};
  IKIP_DATA.notifications.forEach(n => groups[n.level]?.push(n));
  const iconMap = {critical:'🔴',warning:'🟠',info:'🔵',success:'🟢'};
  const bgMap = {critical:'glow-danger',warning:'glow-warning',info:'glow-success',success:'glow-success'};
  const titles = {critical:'Critical', warning:'Warning', info:'Information', success:'Success'};
  let html = '';
  Object.keys(groups).forEach(k=>{
    if(!groups[k].length) return;
    html += `<div class="notif-section"><h4>${titles[k]}</h4>`;
    html += groups[k].map(n=>`
      <div class="notif-row ${n.unread?'unread':''}">
        <div class="notif-ic" style="background:var(--${bgMap[k]});color:${TONE_COLOR[k]}">${iconMap[k]}</div>
        <div><div class="n-title">${n.title}</div><div class="n-desc">${n.desc}</div></div>
        <div class="n-time">${n.time}</div>
      </div>`).join('');
    html += `</div>`;
  });
  $('#notifList').innerHTML = html || emptyStateHTML('🔔','No notifications','You are all caught up.');
}

/* ---------- PROFILE ---------- */
function renderProfile(){
  const u = IKIP_DATA.currentUser;
  $('#profileInitials').textContent = u.name.split(' ').map(n=>n[0]).join('');
  $('#profileName').textContent = u.name;
  $('#profileRole').textContent = u.role;
  $('#pStatReports').textContent = u.stats.reports;
  $('#pStatMachines').textContent = u.stats.machines;
  $('#pStatTasks').textContent = u.stats.tasks;
  $('#pDept').textContent = u.department;
  $('#pEmpId').textContent = u.employeeId;
  $('#pPhone').textContent = u.phone;
  $('#pEmail').textContent = u.email;
}

/* ---------- CHARTS (lightweight canvas line chart, no deps) ---------- */
function drawLineChart(sel, {values, color}){
  const canvas = $(sel);
  if(!canvas) return;
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const max = Math.max(...values), min = Math.min(...values);
  const pad = 10;
  const stepX = (w - pad*2) / (values.length-1);
  const scaleY = (h - pad*2) / ((max-min)||1);
  const pts = values.map((v,i)=>[pad + i*stepX, h - pad - (v-min)*scaleY]);

  // gradient fill
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, color+'55');
  grad.addColorStop(1, color+'02');
  ctx.beginPath();
  ctx.moveTo(pts[0][0], h-pad);
  pts.forEach(p=>ctx.lineTo(p[0],p[1]));
  ctx.lineTo(pts[pts.length-1][0], h-pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  pts.forEach((p,i)=> i===0 ? ctx.moveTo(p[0],p[1]) : ctx.lineTo(p[0],p[1]));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.stroke();

  // dots
  ctx.fillStyle = color;
  pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p[0],p[1],3,0,Math.PI*2); ctx.fill(); });
}

/* ---------- TOAST ---------- */
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- INIT / EVENT WIRING ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Splash -> Onboarding after delay
  setTimeout(()=> showScreen('screen-onboarding'), 2200);
  goOnboard(0);

  $('#onboardSkip').addEventListener('click', ()=> showScreen('screen-login'));
  $('#onboardNext').addEventListener('click', ()=>{
    if(obIndex===2) showScreen('screen-login'); else goOnboard(obIndex+1);
  });

  $$('.onboard-dots span').forEach((d,i)=> d.addEventListener('click', ()=>goOnboard(i)));

  // Auth
  $('#loginForm').addEventListener('submit', e=>{ e.preventDefault(); enterApp(); });
  $('#goSignup').addEventListener('click', ()=> showScreen('screen-signup'));
  $('#goLogin').addEventListener('click', ()=> showScreen('screen-login'));
  $('#signupForm').addEventListener('submit', e=>{ e.preventDefault(); enterApp(); });
  $$('.google-btn').forEach(b=> b.addEventListener('click', enterApp));

  // Sidebar / bottom nav
  $$('.nav-item, .bn-item').forEach(n=> n.addEventListener('click', ()=> showPage(n.dataset.page)));

  // Logout
  $$('.logout-btn').forEach(b=> b.addEventListener('click', ()=>{
    showScreen('screen-login');
  }));

  // Machine detail tabs
  $$('.tab-btn').forEach(b=> b.addEventListener('click', ()=> setDetailTab(b.dataset.tab)));

  // Machines filters
  $$('#machineFilters .filter-chip').forEach(c=> c.addEventListener('click', ()=> setMachineFilter(c.dataset.filter, c)));

  // AI input
  $('#aiInput').addEventListener('keydown', e=>{ if(e.key==='Enter') sendAIMessage(); });
  $('#aiSendBtn').addEventListener('click', ()=> sendAIMessage());

  // Theme
  $('#themeToggleBtn')?.addEventListener('click', toggleTheme);
  $$('.theme-opt').forEach(o=> o.addEventListener('click', ()=>{
    const root=document.documentElement;
    root.setAttribute('data-theme', o.dataset.theme);
    $$('.theme-opt').forEach(x=>x.classList.toggle('active', x===o));
  }));

  // Settings switches
  $$('.switch').forEach(sw=> sw.addEventListener('click', ()=> sw.classList.toggle('on')));

  // Quick actions on dashboard
  $$('.qa-btn').forEach(b=> b.addEventListener('click', ()=>{
    const target = b.dataset.goto;
    if(target) showPage(target); else toast(b.dataset.toast || 'Coming soon');
  }));

  // Notifications dismiss AI card
  $('#aiCardDismiss')?.addEventListener('click', (e)=>{ e.target.closest('.ai-card').style.display='none'; });
  $('#aiCardView')?.addEventListener('click', ()=> navigateToMachine('M-101'));

  // Initial render of all modules (mock data is static, cheap to render upfront)
  renderDashboard();
  renderMachinesList();
  renderAI();
  renderReports();
  renderNotifications();
  renderProfile();

  window.addEventListener('resize', ()=>{
    if($('#page-dashboard').classList.contains('active')){
      const activeTab = $('.chart-tab.active')?.dataset.metric || 'temp';
      drawLineChart('#dashChart', dashChartData(activeTab));
    }
  });
});

function enterApp(){
  showScreen('screen-app');
  showPage('dashboard');
  toast('Welcome back, ' + IKIP_DATA.currentUser.name.split(' ')[0]);
}
