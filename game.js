/* ==========================================================================
   POOL OF EXPERTS — game.js  (v2: pressure instead of AI assistant)
   Flow: intro → P1 hand-pick → P2 applications-under-pressure → pool reveal → outro
   The "AI assistant" is gone. The middle is now a one-by-one application review
   with a deadline, extension cost, and a quota warning — adapted from the older
   prototype, dropped onto Katy's 26 architects and the pool aesthetic.
   ========================================================================== */

const WEEK_COST = 50000;
const JURY_SIZE = 10;
const WOMEN_TARGET = 5, MEN_TARGET = 5;   // the prepared 50:50 structure
const FIRST_BATCH_M = 16, FIRST_BATCH_W = 4;  // ~80/20 applicant field
const EXTEND_M = 8, EXTEND_W = 2;             // each extension adds this
const DEADLINE_WEEKS_PER_EXT = 4;
const WARN_AT = 6;     // deadline prompt fires after this many invites
const QUOTA_AT = 8;    // quota warning fires after this many invites

const PHASES = [
  ["intro",  "Start"],
  ["p1",     "1 · You decide"],
  ["apps",   "2 · The real call"],
  ["reveal", "3 · The pool"],
  ["outro",  "4 · What happened"],
];

const state = {
  screen:"intro",
  order:[],
  selected:new Set(),          // phase-1 hand-pick
  weights:{ availability:0, assertiveness:0, prestige:0, seniority:0 },
  peekedCompetence:0,
  phase1Women:null,            // women in YOUR phase-1 jury

  // phase-2 application review
  candidates:[],               // ordered applicant list (80/20)
  idx:0,                       // current applicant index
  invited:[], reserve:[], rejected:[],
  delayWeeks:0, extensions:0, rep:100, p1Idx:0,
  warnShown:false, quotaShown:false, kitchenShown:false, holidayShown:false,
  foreignersShown:false, moreMenShown:false,
};

const stage = document.getElementById("stage");
const phasebar = document.getElementById("phasebar");

/* ---------- helpers ---------- */
function byId(id){ return PROFILES.find(p=>p.id===id); }
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function el(h){const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstElementChild;}
function countSel(set=state.selected){
  let w=0,m=0; set.forEach(id=>{ byId(id).gender==="woman"?w++:m++; }); return {w,m};
}
function countInvited(){
  let w=0,m=0; state.invited.forEach(id=>{ byId(id).gender==="woman"?w++:m++; }); return {w,m};
}
function totalWeight(){ return Object.values(state.weights).reduce((a,b)=>a+b,0); }

function renderPhasebar(){
  phasebar.innerHTML="";
  const idx = PHASES.findIndex(p=>p[0]===state.screen);
  PHASES.forEach(([key,label],i)=>{
    const b=document.createElement("b"); b.textContent=label;
    if(i===idx) b.classList.add("on"); else if(i<idx && idx>=0) b.classList.add("done");
    phasebar.appendChild(b);
  });
  phasebar.style.display = state.screen==="intro" ? "none":"flex";
}
function go(screen){
  state.screen=screen; renderPhasebar(); renderHUD(); stage.scrollTop=0;
  ({ intro:rIntro, p1:rPhase1, handoff:rHandoff, appsMail:rAppsMail, apps:rApps,
     kitchen:rKitchen, kronepress:rKronepress, holiday:rHoliday,
     foreigners:rForeigners, foreignerspress:rForeignersPress, moremen:rMoreMen, standardpress:rStandardpress,
     extend:rExtend, quota:rQuota, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
     reveal:rReveal, outro:rOutro, reflect:rReflect })[screen]();
}

/* ---------- HUD ---------- */
const HUD_SCREENS = new Set(["appsMail","apps","extend","quota","confirm","sendletter","intermezzo","reveal","outro","reflect"]);
function hudDeadline(){
  const d=new Date(2026,7,1); d.setDate(d.getDate()+state.delayWeeks*7);
  return "deadline: "+d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
const repWord  = ()=> state.rep>=80?"Solid":state.rep>=55?"Shaky":state.rep>=30?"Damaged":"In crisis";
const repColor = ()=> state.rep>=80?"var(--ok)":state.rep>=55?"var(--gold)":state.rep>=30?"var(--warn)":"var(--danger)";
function hudFlash(id){const g=document.getElementById(id);if(!g)return;g.classList.remove("gflash");void g.offsetWidth;g.classList.add("gflash");}
function renderHUD(){
  const show = HUD_SCREENS.has(state.screen);
  document.getElementById("hud").style.display  = show ? "flex" : "none";
  document.getElementById("feed").style.display = show ? "flex" : "none";
  if(!show) return;
  document.getElementById("hud-money").textContent   = "€"+( state.delayWeeks*WEEK_COST).toLocaleString("en-GB");
  document.getElementById("hud-weeks").textContent   = state.delayWeeks ? "+"+state.delayWeeks+"w late" : "on time";
  document.getElementById("hud-deadline").textContent= hudDeadline();
  document.getElementById("hud-repword").textContent  = repWord();
  const f=document.getElementById("hud-repfill"); f.style.width=state.rep+"%"; f.style.background=repColor();
}
function hudAddDelay(weeks){ state.delayWeeks+=weeks; hudFlash("g-money"); hudFlash("g-time"); renderHUD(); }
function hudAddRep(delta){ state.rep=Math.max(0,Math.min(100,state.rep+delta)); hudFlash("g-rep"); renderHUD(); }
function hudFeed(src,text){ document.getElementById("feed").innerHTML=`<span class="src">${src}</span> — <b>${text}</b>`; }

/* ---------- Vienna email helper ---------- */
function viennaMail(which, ctaLabel, onCta, secondary){
  const m = VIENNA[which];
  const wrap = el(`<div>
    <div class="mail">
      <div class="from">
        <div class="crest">WIEN</div>
        <div class="who">Stadt Wien<small>Competition Office</small></div>
      </div>
      <div class="subject">${m.subject}</div>
      <div class="body">${m.body}</div>
    </div>
    <div class="btnbar"></div>
  </div>`);
  const bar = wrap.querySelector(".btnbar");
  if(secondary){
    const s=el(`<button class="btn ghost">${secondary.label}</button>`);
    s.onclick=secondary.onClick; bar.appendChild(s);
  }
  const c=el(`<button class="btn">${ctaLabel}</button>`); c.onclick=onCta; bar.appendChild(c);
  return wrap;
}

/* ========================================================================
   INTRO — multi-beat opening scene (the Alte WU place-setter)
   Ported from wu-opening-scene.html. Plays first, before phase 1; the final
   CTA hands off into the brief via go("p1"), exactly like the old single slide.
   NO theme spoilers: no "bias", "gender", "discrimination", "quota", ratios.
   ======================================================================== */

/* SVG art: the Alte WU over the railway (flat, thick-ink, limited palette) */
const ALTEWU_SVG = `<svg viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The old WU campus: a long concrete building raised on a platform over the railway tracks of the Franz-Josefs-Bahnhof, Augasse, Vienna">
  <rect x="0" y="0" width="620" height="240" fill="#d6f0fb" stroke="none"/>
  <circle cx="548" cy="36" r="20" fill="#ffcf4d" stroke="#143041" stroke-width="3"/>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <!-- distant Gründerzeit rooftops of the Augasse -->
    <g fill="#cfe6ef">
      <rect x="20" y="78" width="34" height="34"/>
      <path d="M20 78 l17 -14 l17 14 z"/>
      <rect x="60" y="84" width="30" height="28"/>
      <path d="M60 84 l15 -12 l15 12 z"/>
    </g>
    <!-- the platform ("die Platte") raised over the tracks -->
    <rect x="0" y="112" width="620" height="14" fill="#9fb6c0"/>
    <!-- the long concrete slab building (UZA 1) -->
    <rect x="70" y="40" width="480" height="72" fill="#e7edf0"/>
    <!-- grid of windows -->
    <g fill="#a3e5f7" stroke-width="2">
      <rect x="88" y="52" width="22" height="18"/><rect x="120" y="52" width="22" height="18"/>
      <rect x="152" y="52" width="22" height="18"/><rect x="184" y="52" width="22" height="18"/>
      <rect x="216" y="52" width="22" height="18"/><rect x="248" y="52" width="22" height="18"/>
      <rect x="280" y="52" width="22" height="18"/><rect x="312" y="52" width="22" height="18"/>
      <rect x="344" y="52" width="22" height="18"/><rect x="376" y="52" width="22" height="18"/>
      <rect x="408" y="52" width="22" height="18"/><rect x="440" y="52" width="22" height="18"/>
      <rect x="472" y="52" width="22" height="18"/><rect x="504" y="52" width="22" height="18"/>
      <rect x="88" y="80" width="22" height="18"/><rect x="120" y="80" width="22" height="18"/>
      <rect x="152" y="80" width="22" height="18"/><rect x="184" y="80" width="22" height="18"/>
      <rect x="216" y="80" width="22" height="18" fill="#fffdf6"/><rect x="248" y="80" width="22" height="18"/>
      <rect x="280" y="80" width="22" height="18"/><rect x="312" y="80" width="22" height="18" fill="#fffdf6"/>
      <rect x="344" y="80" width="22" height="18"/><rect x="376" y="80" width="22" height="18"/>
      <rect x="408" y="80" width="22" height="18"/><rect x="440" y="80" width="22" height="18" fill="#fffdf6"/>
      <rect x="472" y="80" width="22" height="18"/><rect x="504" y="80" width="22" height="18"/>
    </g>
    <!-- concrete support pillars carrying the slab down to track level -->
    <rect x="96" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="216" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="336" y="126" width="20" height="78" fill="#cdd9df"/>
    <rect x="456" y="126" width="20" height="78" fill="#cdd9df"/>
    <!-- the active goods railway running underneath -->
    <rect x="0" y="204" width="620" height="36" fill="#bcdfe9"/>
    <g stroke="#3a6378" stroke-width="2">
      <line x1="0" y1="214" x2="620" y2="214"/>
      <line x1="0" y1="230" x2="620" y2="230"/>
    </g>
    <!-- a small train passing through the shadow under the platform -->
    <rect x="150" y="180" width="120" height="24" rx="4" fill="#5cb9da"/>
    <rect x="160" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <rect x="186" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <rect x="212" y="186" width="20" height="12" rx="2" fill="#fffdf6"/>
    <circle cx="172" cy="206" r="5" fill="#143041"/>
    <circle cx="248" cy="206" r="5" fill="#143041"/>
    <!-- a lone tree of the Augasse, surviving at the edge -->
    <line x1="586" y1="204" x2="586" y2="150"/>
    <circle cx="586" cy="140" r="16" fill="#6fc08c"/>
  </g>
</svg>`;

/* the narrative beats: building, history, the people, the neighbourhood, your part */
const BEATS = [
  {
    label:"AUGASSE · 9th DISTRICT",
    art: ALTEWU_SVG,
    h:"There is a building over the tracks",
    body:`
      <p class="lede">In Vienna's 9th district, Alsergrund, the Augasse runs quietly past
      ordinary blocks until the ground simply lifts. A long concrete structure stands raised
      on a platform — the locals call it <em>die Platte</em> — bridging the railway lines of the
      Franz-Josefs-Bahnhof some metres above the street.</p>
      <p class="lede">Trains still move through the shadow beneath it. For decades, students moved
      through the floors above. People who grew up here just call it <strong>the old WU</strong>.</p>`
  },
  {
    label:"1975 — TODAY",
    h:"A campus the city built, then outgrew",
    body:`
      <p class="lede">It went up in the mid-1970s as the railway platform was constructed,
      and from 1982 it housed the Vienna University of Economics and Business.
      <!-- TODO: verify / fill from briefing — architects (briefing names "Büro Kurt Hlaweniczka" but flags as unverified) --></p>
      <p class="lede">The WU moved on to a new campus in 2013. The University of Vienna held part of it
      until 2021. Then the lecture halls fell silent. The signs came down, the corridors emptied,
      and a building made for tens of thousands of people was left waiting — half in use, half asleep.</p>`
  },
  {
    label:"GENERATIONS",
    h:"Almost everyone here knows it",
    body:`
      <p class="lede">Ask around the Augasse and the stories come easily. The first exam taken on the
      upper floors. The coffee from the machine that never quite worked. The friends made in a stairwell,
      the all-nighters, the graduation walked out through those doors.</p>
      <p class="lede">It was never a postcard. It was a place that decades of ordinary life passed through —
      and the kind of building a neighbourhood quietly measures itself against, even when it's standing empty.</p>`
  },
  {
    label:"NOW",
    h:"And now its future is open",
    body:`
      <p class="lede">The city has decided: the old WU will not stay as it is. The plan is to turn
      this concrete island over the tracks into a new education campus — open to the street again,
      greener, made for many thousands of people once more.</p>
      <p class="lede">But what it becomes is not yet decided. A competition is under way to choose the
      vision that wins. And a competition needs a jury — a small group of experts trusted to decide,
      on everyone's behalf, what this piece of Vienna turns into next.</p>`
  },
  {
    label:"YOUR PART",
    h:"That jury is your job",
    body:`
      <p class="lede">Choosing those experts is the task in front of you. You have a shortlist of
      candidates, a budget, and a deadline. The city is watching. The clock is already running.</p>
      <p class="lede">Pick the best people. That's the whole job.</p>`,
    cta:true
  }
];

let introStep=0;

function rIntro(){
  stage.innerHTML="";
  const b = BEATS[introStep];
  const last = introStep === BEATS.length - 1;

  const wrap = el(`<div class="slide fadein"></div>`);
  wrap.appendChild(el(`<div class="beatlabel">${b.label}</div>`));
  if(b.art) wrap.appendChild(el(`<div class="art">${b.art}</div>`));
  wrap.appendChild(el(`<h1>${b.h}</h1>`));
  const bodyHost = el(`<div></div>`);
  bodyHost.innerHTML = b.body;
  while(bodyHost.firstChild) wrap.appendChild(bodyHost.firstChild);

  // progress dots
  const nav = el(`<div class="dotnav"></div>`);
  BEATS.forEach((_,i)=>nav.appendChild(el(`<i class="${i===introStep?"on":""}"></i>`)));
  wrap.appendChild(nav);

  // buttons
  const bar = el(`<div class="btnbar"></div>`);
  if(introStep > 0){
    const back = el(`<button class="btn ghost">Back</button>`);
    back.onclick = ()=>{ introStep--; rIntro(); };
    bar.appendChild(back);
  }
  if(!last){
    const next = el(`<button class="btn">Continue →</button>`);
    next.onclick = ()=>{ introStep++; rIntro(); };
    bar.appendChild(next);
  } else {
    // final CTA — hands off into Phase 1, exactly like the old intro
    const goBtn = el(`<button class="btn" id="go">Open the brief</button>`);
    goBtn.onclick = ()=>{ introStep=0; go("p1"); };
    bar.appendChild(goBtn);
  }
  wrap.appendChild(bar);
  stage.appendChild(wrap);
}

/* ========================================================================
   PHASE 1 — hand-pick from the full pool, criteria are peekable
   ======================================================================== */
function rPhase1(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("phase1","Start choosing",()=>renderHandPick()));
}

function renderHandPick(){
  stage.innerHTML="";
  if(state.order.length===0) state.order=shuffle(PROFILES.map(p=>p.id));
  state.selected=new Set();

  stage.appendChild(el(`
    <div class="selbar">
      <div class="counter"><span id="cnt">0</span>/${JURY_SIZE}<small>chosen</small></div>
      <div class="hint">Tap a name to add them. Tap a criterion chip to see how a person scores.</div>
      <button class="btn" id="confirm" disabled>Confirm jury</button>
    </div>`));
  const grid=el(`<div class="grid" id="grid"></div>`);
  state.order.forEach(id=>grid.appendChild(makeCard(byId(id))));
  stage.appendChild(grid);
  document.getElementById("confirm").onclick=onConfirmHandPick;
  refreshSel();
}

function makeCard(p){
  const c=el(`
    <div class="card" data-id="${p.id}">
      <div class="nm">${p.name}</div>
      <div class="ti" style="font-size:12px;color:var(--ink-soft)">${p.title} · ${p.edu}</div>
      <div class="sp">${p.spec}</div>
      <div class="bio">${p.bio}</div>
      <div class="crit"></div>
    </div>`);
  const crit=c.querySelector(".crit");
  CRITERIA.forEach(cr=>{
    const chip=el(`<span class="chip shown" data-k="${cr.key}">${cr.label} <span class="val">${"●".repeat(p.sig[cr.key])||"–"}</span></span>`);
    crit.appendChild(chip);
  });
  const comp=el(`<span class="chip comp shown">${COMPETENCE.label} <span class="val">${"●".repeat(p.sig.publicValue)||"–"}</span></span>`);
  crit.appendChild(comp);
  c.onclick=()=>toggleCard(p,c);
  return c;
}
function peek(chip,p,cr){
  if(!chip.classList.contains("shown")){
    chip.classList.add("shown","peeked");
    chip.innerHTML=`${cr.label} <span class="val">${"●".repeat(p.sig[cr.key])||"–"}</span>`;
    state.weights[cr.key]++;
  }
}
function peekComp(chip,p){
  if(!chip.classList.contains("shown")){
    chip.classList.add("shown");
    chip.innerHTML=`${COMPETENCE.label} <span class="val">${"●".repeat(p.sig.publicValue)||"–"}</span>`;
    state.peekedCompetence++;
  }
}
function toggleCard(p,c){
  if(state.selected.has(p.id)){ state.selected.delete(p.id); c.classList.remove("sel"); }
  else{
    if(state.selected.size>=JURY_SIZE){ flashFull(); return; }
    state.selected.add(p.id); c.classList.add("sel");
  }
  refreshSel();
}
function refreshSel(){
  const n=state.selected.size;
  document.getElementById("cnt").textContent=n;
  const c=document.getElementById("confirm");
  c.disabled=n!==JURY_SIZE;
  c.textContent = n===JURY_SIZE ? "Confirm jury" : `Pick ${JURY_SIZE-n} more`;
}
function flashFull(){
  const bar=document.querySelector(".selbar");
  bar.style.borderColor="var(--danger)";
  setTimeout(()=>bar.style.borderColor="var(--ink)",1200);
}

function onConfirmHandPick(){
  state.phase1Women=countSel().w;
  go("handoff");
}

function rHandoff(){
  stage.innerHTML="";
  const {w:fw}=countSel();
  stage.appendChild(el(`
    <div class="slide">
      <h1>Your shortlist is set</h1>
      <p class="lede">You picked ${fw} women and ${JURY_SIZE-fw} men — a strong, qualified panel.</p>
      <p class="lede" style="font-size:15px">But a shortlist isn't a jury yet. The City still
      has to run the official public call — and that's where it gets interesting.</p>
      <div class="btnbar"><button class="btn" id="go">Open the public call →</button></div>
    </div>`));
  document.getElementById("go").onclick=()=>go("appsMail");
}

/* ========================================================================
   PHASE 2 — the official call: review applications one by one, under pressure
   ======================================================================== */
function rAppsMail(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("applications","Begin reviewing",()=>{ prepareCandidates(); go("apps"); }));
}

function prepareCandidates(){
  const men   = shuffle(PROFILES.filter(p=>p.gender==="man"));
  const women = shuffle(PROFILES.filter(p=>p.gender==="woman"));
  const batch=[];
  for(let i=0;i<FIRST_BATCH_M;i++) batch.push(men[i % men.length]);
  for(let i=0;i<FIRST_BATCH_W;i++) batch.push(women[i % women.length]);
  state.candidates=shuffle(batch);
  state.idx=0; state.invited=[]; state.reserve=[]; state.rejected=[];
  state.delayWeeks=0; state.extensions=0; state.warnShown=false; state.quotaShown=false;
  state.kitchenShown=false; state.holidayShown=false;
}
function addCandidates(){
  const men   = shuffle(PROFILES.filter(p=>p.gender==="man"));
  const women = shuffle(PROFILES.filter(p=>p.gender==="woman"));
  const extra=[];
  for(let i=0;i<EXTEND_M;i++) extra.push(men[i % men.length]);
  for(let i=0;i<EXTEND_W;i++) extra.push(women[i % women.length]);
  state.candidates=state.candidates.concat(shuffle(extra));
}

function afterDecision(){
  if(state.invited.length>=JURY_SIZE){ go("confirm"); return; }
  if(!state.kitchenShown && state.invited.length>=3){ go("kitchen"); return; }
  if(!state.holidayShown && state.invited.length>=5){ go("holiday"); return; }
  if(!state.warnShown && state.invited.length>=WARN_AT){ go("extend"); return; }
  if(!state.quotaShown && state.invited.length>=QUOTA_AT){ go("quota"); return; }
  if(!state.foreignersShown && state.invited.length>=QUOTA_AT+1){ go("foreigners"); return; }
  if(!state.moreMenShown && state.invited.length>=QUOTA_AT+2){ go("moremen"); return; }
  go("apps");
}

function deadlineString(){
  const base=new Date(2026,7,1);
  base.setDate(base.getDate()+state.delayWeeks*7);
  return base.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}

function rApps(){
  stage.innerHTML="";
  const {w,m}=countInvited();

  const status=el(`
    <div class="selbar">
      <div class="counter"><span>${state.invited.length}</span>/${JURY_SIZE}<small>invited</small></div>
      <div class="hint">Reserve: ${state.reserve.length} · Rejected: ${state.rejected.length}<br>
        Current jury: ${w}♀ ${m}♂ · Deadline: ${deadlineString()}${state.delayWeeks?` (+${state.delayWeeks}w)`:""}</div>
    </div>`);
  stage.appendChild(status);

  if(state.idx>=state.candidates.length){
    const box=el(`<div class="slide">
      <h2>No more applications</h2>
      <p>The applicant pool is exhausted. You invited ${state.invited.length} of ${JURY_SIZE}.</p>
      <div class="btnbar">
        ${state.invited.length>0?'<button class="btn" id="finish">Send the invitations</button>':''}
        <button class="btn ghost" id="ext">Extend the call (+${DEADLINE_WEEKS_PER_EXT}w)</button>
      </div></div>`);
    stage.appendChild(box);
    const f=box.querySelector("#finish"); if(f) f.onclick=()=>go("confirm");
    box.querySelector("#ext").onclick=()=>{ addCandidates(); state.delayWeeks+=DEADLINE_WEEKS_PER_EXT; state.extensions++; go("apps"); };
    return;
  }

  const p=state.candidates[state.idx];
  const card=el(`
    <div class="appcard">
      <div class="apphead">
        <span class="badge">${p.spec}</span>
        <h2 style="margin:6px 0 0">${p.name}</h2>
        <div style="font-size:13px;color:var(--ink-soft)">${p.title} · ${p.edu}</div>
      </div>
      <p style="margin:12px 0">${p.bio}</p>
      <div class="appcrit"></div>
      <div class="appactions">
        <button class="btn" id="invite">Invite</button>
        <button class="btn ghost" id="reserve">Reserve</button>
        <button class="btn ghost" id="reject">Reject</button>
      </div>
    </div>`);
  const cr=card.querySelector(".appcrit");
  CRITERIA.forEach(c=>{
    const chip=el(`<span class="chip shown" data-k="${c.key}">${c.label} <span class="val">${"●".repeat(p.sig[c.key])||"–"}</span></span>`);
    cr.appendChild(chip);
  });
  const comp=el(`<span class="chip comp shown">${COMPETENCE.label} <span class="val">${"●".repeat(p.sig.publicValue)||"–"}</span></span>`);
  cr.appendChild(comp);

  card.querySelector("#invite").onclick=()=>{ state.invited.push(p.id); state.idx++; afterDecision(); };
  card.querySelector("#reserve").onclick=()=>{ state.reserve.push(p.id); state.idx++; afterDecision(); };
  card.querySelector("#reject").onclick=()=>{ state.rejected.push(p.id); state.idx++; afterDecision(); };
  stage.appendChild(card);
  stage.appendChild(makeStacks());
}

function makeStacks(){
  const wrap=el(`<div class="stacks"></div>`);
  const make=(title,list)=>{
    const s=el(`<div class="stack"><h4>${title}</h4><ul></ul></div>`);
    const ul=s.querySelector("ul");
    list.forEach(id=>{ const p=byId(id); ul.appendChild(el(`<li>${p?p.name:id}</li>`)); });
    return s;
  };
  wrap.appendChild(make(`Invited (${state.invited.length})`, state.invited));
  wrap.appendChild(make(`Reserve (${state.reserve.length})`, state.reserve));
  wrap.appendChild(make(`Rejected (${state.rejected.length})`, state.rejected));
  return wrap;
}

/* ---------- SVG art ---------- */
function newspaper({masthead,mastColor,paper,line1,line2,sub}){
  return `<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${masthead}: ${line1} ${line2}">
    <g stroke="#143041" stroke-width="3" stroke-linejoin="round">
      <rect x="0" y="0" width="620" height="250" fill="${paper}" stroke="none"/>
      <rect x="0" y="0" width="620" height="48" fill="${mastColor}" stroke="none"/>
      <text x="20" y="35" font-family="'VT323',monospace" font-size="34" fill="#fff" stroke="none" letter-spacing="1">${masthead}</text>
      <path d="M560 14 l8 12 l10 -14 l10 14 l8 -12 v18 h-44 z" fill="#ffcf4d"/>
      <text x="20" y="66" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#3a6378" stroke="none">WIEN · FREITAG · UNABHÄNGIG · € 1,20</text>
      <line x1="0" y1="74" x2="620" y2="74" stroke="#143041" stroke-width="2"/>
      <text x="20" y="118" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="34" fill="#143041" stroke="none">${line1}</text>
      <text x="20" y="156" font-family="'Space Grotesk',sans-serif" font-weight="700" font-size="34" fill="#143041" stroke="none">${line2}</text>
      <text x="20" y="182" font-family="'Space Grotesk',sans-serif" font-size="14" fill="#3a6378" stroke="none">${sub}</text>
      <rect x="20" y="196" width="150" height="44" rx="4" fill="#d9e7ee"/>
      <g stroke="#c3d5dd" stroke-width="6"><line x1="190" y1="204" x2="600" y2="204"/><line x1="190" y1="218" x2="600" y2="218"/><line x1="190" y1="232" x2="520" y2="232"/></g>
    </g></svg>`;
}
const KRONE_SVG = newspaper({masthead:"KRONEN ZEITUNG",mastColor:"#d81e2c",paper:"#fffdf6",
  line1:"Freunderlwirtschaft",line2:"bei der Alten WU?",
  sub:"Vergabe unter Verdacht – Jury soll Bekannte bevorzugt haben."});
const ALTEDONAU_SVG = `<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Crowds swimming and lounging at the Alte Donau on a summer day, the Donauturm in the background">
  <rect x="0" y="0" width="620" height="200" fill="#d6f0fb"/>
  <circle cx="548" cy="34" r="22" fill="#ffcf4d" stroke="#143041" stroke-width="3"/>
  <g stroke="#143041" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <rect x="0" y="82" width="620" height="22" fill="#8bd0a0" stroke="none"/>
    <path d="M108 96 L112 40 M112 40 L116 96" fill="none"/>
    <ellipse cx="112" cy="44" rx="17" ry="7" fill="#d7f4ff"/>
    <line x1="112" y1="37" x2="112" y2="28"/>
    <line x1="206" y1="92" x2="206" y2="80"/><circle cx="206" cy="74" r="12" fill="#6fc08c"/>
    <line x1="250" y1="92" x2="250" y2="82"/><circle cx="250" cy="78" r="10" fill="#6fc08c"/>
    <line x1="420" y1="92" x2="420" y2="80"/><circle cx="420" cy="74" r="12" fill="#6fc08c"/>
    <rect x="0" y="100" width="620" height="100" fill="#5cb9da" stroke="none"/>
    <circle cx="70" cy="126" r="9" fill="#ffe1ef"/><path d="M58 132 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="150" cy="138" r="9" fill="#ffd9c2"/><path d="M138 144 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="225" cy="128" r="9" fill="#ffe1ef"/><path d="M213 134 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="470" cy="132" r="9" fill="#ffd9c2"/><path d="M458 138 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="540" cy="146" r="9" fill="#ffe1ef"/><path d="M528 152 q12 8 24 0" fill="none" stroke-width="2"/>
    <circle cx="370" cy="150" r="9" fill="#ffd9c2"/><path d="M358 156 q12 8 24 0" fill="none" stroke-width="2"/>
    <path d="M280 130 q40 22 70 0 z" fill="#ffc2df"/>
    <circle cx="300" cy="120" r="8" fill="#ffe1ef"/><circle cx="330" cy="120" r="8" fill="#ffd9c2"/>
    <g stroke="#a3e5f7" stroke-width="3" fill="none">
      <path d="M0 112 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
      <path d="M0 168 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/>
    </g>
    <rect x="0" y="180" width="620" height="20" fill="#ffe9b8" stroke="none"/>
    <line x1="0" y1="180" x2="620" y2="180"/>
    <rect x="40" y="184" width="60" height="10" rx="3" fill="#ff9bbf"/>
    <circle cx="60" cy="180" r="7" fill="#ffe1ef"/>
    <rect x="180" y="186" width="60" height="9" rx="3" fill="#ffcf4d"/>
    <circle cx="200" cy="182" r="7" fill="#ffd9c2"/>
    <rect x="470" y="185" width="60" height="9" rx="3" fill="#ff9bbf"/>
    <circle cx="500" cy="181" r="7" fill="#ffe1ef"/>
  </g></svg>`;

const KITCHEN_SVG = `<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="130" width="320" height="12" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="60" y="142" width="320" height="40" fill="#a3e5f7" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="72" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="142" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="212" y="148" width="60" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="282" y="148" width="88" height="28" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <rect x="60" y="60" width="140" height="60" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
  <rect x="68" y="66" width="58" height="48" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <rect x="134" y="66" width="58" height="48" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <rect x="220" y="88" width="40" height="42" rx="2" fill="#143041" stroke="#143041" stroke-width="3"/>
  <rect x="226" y="94" width="28" height="16" rx="1" fill="#a3e5f7" stroke="#143041" stroke-width="2"/>
  <circle cx="240" cy="118" r="6" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
  <path d="M236 86 Q234 80 236 74" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <path d="M244 86 Q242 78 244 70" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <rect x="290" y="116" width="20" height="14" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <path d="M310 120 Q316 120 316 124 Q316 128 310 128" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <rect x="318" y="116" width="20" height="14" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <path d="M338 120 Q344 120 344 124 Q344 128 338 128" fill="none" stroke="#143041" stroke-width="2" stroke-linecap="round"/>
  <circle cx="116" cy="88" r="16" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="100" y="74" width="32" height="8" rx="4" fill="#143041"/>
  <rect x="100" y="104" width="32" height="36" rx="4" fill="#4fb286" stroke="#143041" stroke-width="3"/>
  <rect x="86" y="106" width="14" height="24" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="132" y="106" width="14" height="24" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <circle cx="182" cy="85" r="16" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <rect x="166" y="71" width="32" height="10" rx="4" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
  <rect x="166" y="101" width="32" height="36" rx="4" fill="#a3e5f7" stroke="#143041" stroke-width="3"/>
  <rect x="148" y="103" width="18" height="12" rx="4" fill="#ffc2df" stroke="#143041" stroke-width="3"/>
  <ellipse cx="148" cy="68" rx="26" ry="16" fill="#fffdf6" stroke="#143041" stroke-width="3"/>
  <polygon points="158,78 168,84 154,84" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
  <circle cx="136" cy="68" r="3" fill="#143041"/>
  <circle cx="148" cy="68" r="3" fill="#143041"/>
  <circle cx="160" cy="68" r="3" fill="#143041"/>
  <line x1="40" y1="182" x2="580" y2="182" stroke="#143041" stroke-width="3"/>
  <rect x="440" y="50" width="100" height="120" rx="4" fill="#a3e5f7" stroke="#143041" stroke-width="3"/>
  <line x1="490" y1="50" x2="490" y2="170" stroke="#143041" stroke-width="2"/>
  <line x1="440" y1="110" x2="540" y2="110" stroke="#143041" stroke-width="2"/>
  <ellipse cx="518" cy="158" rx="12" ry="10" fill="#4fb286" stroke="#143041" stroke-width="2"/>
</svg>`;

/* ---------- Teeküche ---------- */
function rKitchen(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">The kitchenette</span>
    <div class="art">${KITCHEN_SVG}</div>
    <h2>A colleague has a tip</h2>
    <p>Over coffee, a colleague leans in: "I know two brilliant people — want me to put them forward?" It would bring you two more applicants. It would also look a lot like an inside job.</p>
    <div class="btnbar col" style="margin-top:16px">
      <button class="btn" id="k-take">Take the tip<span class="cost">+2 applicants · reputation takes a hit</span></button>
      <button class="btn ghost" id="k-decline">Decline — keep it clean<span class="cost">no new applicants</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("k-take").onclick=()=>{
    const extra=shuffle(PROFILES.filter(p=>p.gender==="woman")).slice(0,2);
    state.candidates=state.candidates.concat(extra);
    state.kitchenShown=true;
    hudAddRep(-25);
    hudFeed("Krone","Freunderlwirtschaft bei der Alten WU?");
    go("kronepress");
  };
  document.getElementById("k-decline").onclick=()=>{ state.kitchenShown=true; go("apps"); };
}

function rKronepress(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">The press picks it up</span>
    <div class="art">${KRONE_SVG}</div>
    <h2>The headline is out</h2>
    <p>The cronyism story is spreading. You can bring in a crisis-PR agency to calm it down — or ride it out and risk losing people.</p>
    <div class="btnbar col" style="margin-top:16px">
      <button class="btn" id="kp-pr">Hire crisis PR<span class="cost">+2 weeks delay · reputation recovers</span></button>
      <button class="btn ghost" id="kp-ride">Ride it out<span class="cost">a qualified woman withdraws</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("kp-pr").onclick=()=>{
    hudAddDelay(2); hudAddRep(20);
    hudFeed("Stadt Wien","Statement issued. The story cools down.");
    go("apps");
  };
  document.getElementById("kp-ride").onclick=()=>{
    const wIdx=state.candidates.findIndex((p,i)=>i>=state.idx && p.gender==="woman");
    if(wIdx>=0) state.candidates.splice(wIdx,1);
    hudAddRep(-10);
    hudFeed("Inbox","“Given the press, I’m withdrawing my application.”");
    go("apps");
  };
}

/* ---------- Holiday ---------- */
function rHoliday(){
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">Summer at the Alte Donau</span>
    <div class="art">${ALTEDONAU_SVG}</div>
    <h2>Holiday season</h2>
    <p>Half of Vienna is out at the Alte Donau. Replies trickle in slowly and decisions stall. Nothing you did — just the calendar.</p>
    <div class="btnbar col" style="margin-top:16px">
      <button class="btn" id="h-wait">Wait it out<span class="cost">+2 weeks delay</span></button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("h-wait").onclick=()=>{
    state.holidayShown=true;
    hudAddDelay(2);
    hudFeed("Stadt Wien","Holiday season slows every reply. Two weeks lost.");
    go("apps");
  };
}

function rExtend(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("deadline",
    "Extend the call (+"+DEADLINE_WEEKS_PER_EXT+"w)",
    ()=>{ addCandidates(); state.delayWeeks+=DEADLINE_WEEKS_PER_EXT; state.extensions++; state.warnShown=true; go("apps"); },
    { label:"Continue without extending", onClick:()=>{ state.warnShown=true; go("apps"); } }
  ));
  const note=el(`<p class="lede" style="font-size:14px;max-width:60ch">
    You've invited ${state.invited.length} so far. An extension brings ${EXTEND_M+EXTEND_W} more
    applications (${EXTEND_M} men, ${EXTEND_W} women) and delays the project by ${DEADLINE_WEEKS_PER_EXT} weeks.</p>`);
  stage.appendChild(note);
}

function rQuota(){
  stage.innerHTML="";
  const {w,m}=countInvited();
  stage.appendChild(viennaMail("quota",
    "Continue",
    ()=>{ state.quotaShown=true; go("apps"); },
    { label:`Extend to wait for more (+${DEADLINE_WEEKS_PER_EXT}w)`,
      onClick:()=>{ addCandidates(); state.delayWeeks+=DEADLINE_WEEKS_PER_EXT; state.extensions++; state.quotaShown=true; go("apps"); } }
  ));
  stage.appendChild(el(`<p class="lede" style="font-size:14px;max-width:60ch">
    Right now your jury stands at <b>${w} women, ${m} men</b>. The target is 5/5 — hard to reach
    when only about one in five applicants is a woman. That's the structure, not you.</p>`));
}

function rForeigners(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("foreigners","Send the enquiry",
    ()=>{ state.foreignersShown=true; hudAddDelay(2);
          hudFeed("Stadt Wien","Enquiry answered: the call is restricted to the existing pool. No.");
          go("apps"); }
  ));
}

function rMoreMen(){
  stage.innerHTML="";
  stage.appendChild(viennaMail("moremen","Ask to relax the target",
    ()=>{ state.moreMenShown=true; hudAddDelay(2); hudAddRep(-20);
          hudFeed("Der Standard","Jury-Vorsitz will Frauen-Vorgabe lockern.");
          go("standardpress"); }
  ));
}

function rStandardpress(){
  const STANDARD_SVG = newspaper({masthead:"derStandard",mastColor:"#7a3b8f",paper:"#fbe9df",
    line1:"Jury-Vorsitz will",line2:"Frauen-Vorgabe lockern",
    sub:"Kritik an Plan, die 50/50-Zielvorgabe für die Alte WU aufzuweichen."});
  stage.innerHTML="";
  const card=el(`<div class="appcard">
    <span class="badge">It made the papers</span>
    <div class="art">${STANDARD_SVG}</div>
    <h2>The story is out there now</h2>
    <p>Nothing to decide — it just sits on your reputation. Every direction costs something.</p>
    <div class="btnbar col" style="margin-top:16px">
      <button class="btn" id="sp-cont">Carry on</button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("sp-cont").onclick=()=>go("apps");
}

/* ========================================================================
   CONFIRM → INTERMEZZO → POOL REVEAL
   ======================================================================== */
function rConfirm(){
  stage.innerHTML="";
  const {w,m}=countInvited();
  const list=state.invited.map(id=>{const p=byId(id);return `<li>${p.name} — ${p.spec}</li>`;}).join("");
  stage.appendChild(el(`
    <div class="slide">
      <h1>Jury complete</h1>
      <p class="lede">You've invited ${state.invited.length} experts: ${w} women, ${m} men.</p>
      <div class="verdict"><ul style="margin:0;padding-left:18px;line-height:1.6">${list}</ul></div>
      <div class="btnbar">
        <button class="btn ghost" id="back">Back to review</button>
        <button class="btn" id="send" style="font-size:28px;padding:10px 32px;background:var(--ok);color:#fff;border-color:var(--ok)">⚑ Send invitations</button>
      </div>
    </div>`));
  document.getElementById("back").onclick=()=>go("apps");
  document.getElementById("send").onclick=()=>go("sendletter");
}

let interStep=0;
function rIntermezzo(){
  const steps=[
    "Jury complete.",
    "Invitations sent.",
    state.delayWeeks>0?`Project start delayed by ${state.delayWeeks} weeks (${state.extensions} extension${state.extensions===1?"":"s"}).`:"Project starts on schedule.",
    "Next meeting: the Expert Pool. Thursday, 09:00.",
    "The organisers prepared 10 stations, 10 name tags, 10 towels — five a side.",
  ];
  stage.innerHTML="";
  const box=el(`<div class="slide"><h1>Getting ready</h1>
    <div class="verdict"><p id="step" style="font-size:18px;margin:0">${steps[interStep]}</p></div>
    <div class="btnbar"><button class="btn" id="go">${interStep<steps.length-1?"Next":"Enter the pool"}</button></div>
    </div>`);
  stage.appendChild(box);
  document.getElementById("go").onclick=()=>{
    if(interStep<steps.length-1){ interStep++; rIntermezzo(); }
    else { interStep=0; go("reveal"); }
  };
}

function rReveal(){
  stage.innerHTML="";
  const {w,m}=countInvited();
  const balanced = w===WOMEN_TARGET && m===MEN_TARGET;
  const wrap=el(`<div class="poolwrap">
    <h1>Welcome to the Expert Pool</h1>
    <p class="lede">The organisers prepared two rows of ${WOMEN_TARGET} — they expected a balanced
    jury. Here's how your invitations actually fill it.</p></div>`);
  const pool=el(`<div class="pool"></div>`);
  pool.appendChild(makeLane("women","Seats prepared for women",WOMEN_TARGET,w,"single_female.png"));
  pool.appendChild(makeLane("men","Seats prepared for men",MEN_TARGET,m,"single_male.png"));
  wrap.appendChild(pool);
  wrap.appendChild(el(`<div class="tally">
    <span>Your jury: <b>${w}</b> ♀ · <b>${m}</b> ♂</span>
    <span class="target">Prepared: ${WOMEN_TARGET} · ${MEN_TARGET}</span>
    ${state.delayWeeks?`<span class="target">Delay: ${state.delayWeeks}w</span>`:""}
  </div>`));
  wrap.appendChild(el(balanced
    ? `<p>Balanced — and every member is qualified. Worth asking: what did it cost in time, and would most people have pushed that hard?</p>`
    : `<p>Strong jury, but it doesn't fit the prepared structure. Some seats overflow, others sit empty. That's not a personal failure — here's what actually drove it.</p>`));
  wrap.appendChild(el(`<div class="btnbar"><button class="btn" id="go">So… what happened?</button></div>`));
  stage.appendChild(wrap);
  document.getElementById("go").onclick=()=>go("outro");
}

function makeLane(cls,label,slots,count,sprite){
  const lane=el(`<div class="lane ${cls}"><div class="label">${label}<span>${count} of ${slots} seats</span></div></div>`);
  for(let i=0;i<slots;i++){
    const filled=i<count;
    const st=el(`<div class="station${filled?" full":""}"></div>`);
    if(filled) st.appendChild(el(`<img src="assets/${sprite}" alt="">`));
    lane.appendChild(st);
  }
  const extra=count-slots;
  if(extra>0){
    for(let i=0;i<extra;i++){ const st=el(`<div class="station full over"></div>`); st.appendChild(el(`<img src="assets/${sprite}" alt="">`)); lane.appendChild(st); }
    lane.appendChild(el(`<span class="overflow">+${extra} with no seat</span>`));
  } else if(count<slots){
    lane.appendChild(el(`<span class="empties">${slots-count} seats empty</span>`));
  }
  return lane;
}

/* ========================================================================
   OUTRO — verdict on the pool you built, real numbers, reflection
   ======================================================================== */
let outroIdx=0;
function rOutro(){ outroIdx=0; drawOutro(); }

function verdict(){
  const {w}=countInvited();
  if(w>=4 && w<=6) return { tag:"You built a balanced jury.",
    text:[`Your final jury came out ${w} women, ${10-w} men — balanced, and all of them qualified. You reached the target.`,
      state.extensions>0
        ? `But look what it took: ${state.extensions} extension${state.extensions===1?"":"s"} and ${state.delayWeeks} weeks of delay. In reality, most people don't have that room — and the pressure is designed to make you stop sooner.`
        : `You managed it without extending — but notice how the deadline and the thin applicant field pushed against you the whole time. Most people give in to that.`] };
  if(w<=2) return { tag:"The structure won.",
    text:[`Your jury came out ${w} women, ${10-w} men. With only about one in five applicants a woman, "just pick the best" lands here almost on its own.`,
      `That's the leaky pipeline made visible: the skew was in who got to apply, long before you decided anything.`] };
  return { tag:"Close, but the field tilted it.",
    text:[`Your jury landed at ${w} women, ${10-w} men — near balance, but short. The applicant pool was ~80% men, and that pressure shows up in the result.`,
      `Reaching 5/5 here means actively working against the structure — and the deadline is built to discourage exactly that.`] };
}

const OUTRO=[
  {head:"Wait — what happened?", build:(w)=>{
    const v=verdict();
    const paras=v.text.map(t=>`<p>${t}</p>`).join("");
    w.appendChild(el(`<div class="slide">
      <p>You chose carefully. But the applicant field was skewed ~80/20 before you started,
      and a deadline pushed you to stop early. The result isn't really about who you are —
      it's about the structure you were handed.</p>
      <div class="verdict"><div class="tagline">${v.tag}</div>${paras}</div></div>`));
  }},
  {head:"This isn't just a game", build:(w)=>{
    w.appendChild(el(`<div class="slide">
      <p><b>First, the no-blame part:</b> if your experts didn't fit the system's swimwear,
      it doesn't mean you chose badly. You probably picked excellent people. The problem is
      the system, not you. Here's the reality in Austria:</p>
      <div class="stat-row">
        <div class="stat"><div class="n">60%</div><div class="t">of architecture students are women — often graduating top of their class.</div></div>
        <div class="stat"><div class="n">11–15%</div><div class="t">of active architecture licences are held by women.</div></div>
        <div class="stat"><div class="n">&lt; 2%</div><div class="t">women in civil engineering. Nearly 90% of independent firms are run by men.</div></div>
      </div>
      <p class="disc">Figures from the project's source material (verify before publishing).
      This prototype uses woman/man as simplified analytical categories to make one form of
      selection bias visible — it does not claim gender is fundamentally binary.</p></div>`));
  }},
  {head:"The leaky pipeline", build:(w)=>{
    w.appendChild(el(`<div class="slide">
      <p><b>Where do the qualified women go?</b> They're lost between university and leadership —
      rigid, family-unfriendly hours and male-dominated networks. By the time a public call goes
      out, the applicant pool is already thinned.</p>
      <p>We built this game to make those invisible filters visible. Fixing it isn't about
      blaming the chooser — it's about changing the structure so the system is ready for
      every talent.</p></div>`));
  }},
];

function drawOutro(){
  stage.innerHTML="";
  const s=OUTRO[outroIdx];
  const wrap=el(`<div></div>`);
  wrap.appendChild(el(`<h1>${s.head}</h1>`));
  s.build(wrap);
  const nav=el(`<div class="dotnav"></div>`);
  OUTRO.forEach((_,i)=>nav.appendChild(el(`<i class="${i===outroIdx?"on":""}"></i>`)));
  wrap.appendChild(nav);
  const bar=el(`<div class="btnbar"></div>`);
  if(outroIdx>0){const b=el(`<button class="btn ghost">Back</button>`);b.onclick=()=>{outroIdx--;drawOutro();};bar.appendChild(b);}
  const last=outroIdx===OUTRO.length-1;
  const n=el(`<button class="btn">${last?"To reflection":"Next"}</button>`);
  n.onclick=()=>{ if(last) go("reflect"); else {outroIdx++;drawOutro();} };
  bar.appendChild(n);
  wrap.appendChild(bar);
  stage.appendChild(wrap);
}

function rReflect(){
  stage.innerHTML="";
  const {w,m}=countInvited();
  stage.appendChild(el(`
    <div class="slide">
      <h1>What happened in there?</h1>
      <p class="lede">The interesting question isn't "who's to blame?" — it's which patterns formed,
      and how selection could be designed more fairly.</p>
      <div class="verdict"><p>Your jury: <b>${w}</b> women, <b>${m}</b> men${state.extensions?` · ${state.extensions} extension(s), ${state.delayWeeks}w delay`:""}.</p></div>
      <ol class="qlist">
        <li>How did the ~80/20 applicant field shape what felt possible?</li>
        <li>When the deadline appeared, did you change how you chose?</li>
        <li>Did extending feel worth the delay — and who, in reality, can afford that delay?</li>
        <li>Were the criteria that felt like "hard quality" fair ones for a public building?</li>
        <li>What would raise the number of women applying in the first place?</li>
      </ol>
      <div class="btnbar">
        <button class="btn" id="again">Play again</button>
      </div>
    </div>`));
  document.getElementById("again").onclick=resetGame;
}

function resetGame(){
  state.order=[]; state.selected=new Set();
  state.weights={availability:0,assertiveness:0,prestige:0,seniority:0};
  state.peekedCompetence=0; state.phase1Women=null;
  state.candidates=[]; state.idx=0; state.invited=[]; state.reserve=[]; state.rejected=[];
  state.delayWeeks=0; state.extensions=0; state.rep=100;
  state.warnShown=false; state.quotaShown=false; state.kitchenShown=false; state.holidayShown=false;
  state.foreignersShown=false; state.moreMenShown=false;
  state.p1Idx=0; outroIdx=0; interStep=0; introStep=0;
  go("intro");
}

/* boot — invoked from index.html AFTER all draft modules have loaded,
   so that go()'s dispatcher (which references rSendLetter / rForeignersPress
   defined in the draft files) has every handler defined. */
