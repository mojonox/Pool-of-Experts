/* ==========================================================================
   draft-p1-cards.js  — Phase 1: one-by-one swipe replacement
   Drop these functions into game.js, replacing the originals.
   Global vars used (NOT redefined here):
     stage, state, el, CRITERIA, COMPETENCE, PROFILES, JURY_SIZE,
     byId, shuffle, go, countSel
   ========================================================================== */

/* ---------- CSS to add to style.css (or a <style> block) ----------
   Add once — these are the new styles needed for the swipe card view.

  .p1-shell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px 16px 40px;
  }
  .p1-progress {
    width: 100%;
    max-width: 500px;
    font-size: 13px;
    color: var(--ink-soft);
  }
  .p1-progressbar {
    width: 100%;
    max-width: 500px;
    height: 6px;
    background: var(--ink-muted, #dde4e8);
    border-radius: 99px;
    overflow: hidden;
  }
  .p1-progressbar-fill {
    height: 100%;
    background: var(--ok);
    border-radius: 99px;
    transition: width 0.3s ease;
  }
  .p1-card {
    width: 100%;
    max-width: 500px;
    background: var(--card, #fff);
    border: 2px solid var(--ink);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 4px 4px 0 var(--ink);
    animation: slideInRight 0.25s ease;
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .p1-card .nm   { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .p1-card .ti   { font-size: 13px; color: var(--ink-soft); margin-bottom: 6px; }
  .p1-card .sp   { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
  .p1-card .bio  { font-size: 14px; line-height: 1.55; margin-bottom: 14px; }
  .p1-card .crit { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .p1-actions {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .btn-add {
    font-size: 20px;
    padding: 14px 24px;
    background: var(--ok);
    color: #fff;
    border: 2px solid var(--ok);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
    text-align: center;
  }
  .btn-add:hover { filter: brightness(1.08); }
  .btn-skip {
    font-size: 16px;
    padding: 10px 24px;
    background: transparent;
    color: var(--ink);
    border: 2px solid var(--ink-soft, #9aacb4);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    text-align: center;
  }
  .btn-skip:hover { border-color: var(--ink); }
  .btn-back-card {
    font-size: 13px;
    background: none;
    border: none;
    color: var(--ink-soft);
    cursor: pointer;
    text-decoration: underline;
    font-family: inherit;
    padding: 0;
    align-self: flex-start;
  }
  .p1-done {
    width: 100%;
    max-width: 500px;
    text-align: center;
    padding: 32px 16px;
  }
  ---------------------------------------------------------------- */

/* -----------------------------------------------------------------------
   _ensureP1Styles()  — inject the phase-1 card styles once.
   (The CSS above lives in a comment as documentation; this puts it on the page.)
   ----------------------------------------------------------------------- */
function _ensureP1Styles() {
  if (document.getElementById("p1-styles")) return;
  const s = document.createElement("style");
  s.id = "p1-styles";
  s.textContent = `
  .p1-shell { display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px 16px 40px; }
  .p1-progress { width:100%; max-width:500px; font-size:13px; color:var(--ink-soft); }
  .p1-progressbar { width:100%; max-width:500px; height:6px; background:var(--ink-muted,#dde4e8); border-radius:99px; overflow:hidden; }
  .p1-progressbar-fill { height:100%; background:var(--ok); border-radius:99px; transition:width .3s ease; }
  .p1-card { width:100%; max-width:500px; background:var(--paper,#fff); border:3px solid var(--ink); border-radius:10px; padding:24px; box-shadow:4px 4px 0 rgba(20,48,65,.16); animation:slideInRight .25s ease; }
  @keyframes slideInRight { from{opacity:0;transform:translateX(48px);} to{opacity:1;transform:translateX(0);} }
  .p1-card .nm  { font-family:'VT323',monospace; font-size:26px; line-height:1; margin-bottom:4px; }
  .p1-card .ti  { font-size:13px; color:var(--ink-soft); margin-bottom:6px; }
  .p1-card .sp  { font-size:14px; font-weight:700; margin-bottom:10px; }
  .p1-card .bio { font-size:14px; line-height:1.55; margin-bottom:14px; }
  .p1-card .crit { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
  .p1-actions { width:100%; max-width:500px; display:flex; flex-direction:column; gap:10px; }
  .btn-add { font-family:'VT323',monospace; font-size:24px; letter-spacing:1px; padding:10px 24px; background:var(--ok); color:#fff; border:4px solid var(--ink); border-radius:10px; box-shadow:4px 4px 0 var(--ink); cursor:pointer; text-align:center; transition:transform .05s, box-shadow .05s; }
  .btn-add:hover { transform:translate(2px,2px); box-shadow:2px 2px 0 var(--ink); }
  .btn-skip { font-family:'VT323',monospace; font-size:20px; padding:8px 24px; background:var(--ui,#d7f4ff); color:var(--ink); border:4px solid var(--ink); border-radius:10px; box-shadow:4px 4px 0 var(--ink); cursor:pointer; text-align:center; transition:transform .05s, box-shadow .05s; }
  .btn-skip:hover { transform:translate(2px,2px); box-shadow:2px 2px 0 var(--ink); }
  .btn-back-card { font-size:13px; background:none; border:none; color:var(--ink-soft); cursor:pointer; text-decoration:underline; font-family:inherit; padding:0; align-self:flex-start; }
  .p1-done { width:100%; max-width:500px; text-align:center; padding:32px 16px; }
  `;
  document.head.appendChild(s);
}

/* -----------------------------------------------------------------------
   renderHandPick()  — replaces the original
   ----------------------------------------------------------------------- */
function renderHandPick() {
  _ensureP1Styles();
  stage.innerHTML = "";

  // Initialise order once per game
  if (state.order.length === 0) state.order = shuffle(PROFILES.map(p => p.id));
  // p1Idx tracks current position; reset only from resetGame()
  if (state.p1Idx === undefined) state.p1Idx = 0;

  _drawP1Card();
}

/* Internal: draw the card at state.p1Idx */
function _drawP1Card() {
  stage.innerHTML = "";

  const total   = state.order.length;
  const idx     = state.p1Idx;
  const chosen  = state.selected.size;
  const pct     = Math.round((idx / total) * 100);

  // ---- Finished all cards ----
  if (idx >= total) {
    _drawP1Done();
    return;
  }

  const shell = el(`<div class="p1-shell"></div>`);

  // Progress text + bar
  shell.appendChild(el(`<div class="p1-progress">
    Kandidat ${idx + 1} von ${total} &nbsp;·&nbsp; ${chosen}/${JURY_SIZE} gewählt
  </div>`));
  shell.appendChild(el(`<div class="p1-progressbar">
    <div class="p1-progressbar-fill" style="width:${pct}%"></div>
  </div>`));

  // The card
  const p    = byId(state.order[idx]);
  const card = _makeP1Card(p);
  shell.appendChild(card);

  // Action buttons
  const actions = el(`<div class="p1-actions"></div>`);

  const isSelected = state.selected.has(p.id);

  if (chosen >= JURY_SIZE && !isSelected) {
    // Jury full — show a disabled add button with feedback
    const full = el(`<button class="btn-add" disabled style="opacity:.45;cursor:not-allowed">
      Jury bereits voll (${JURY_SIZE}/${JURY_SIZE})
    </button>`);
    actions.appendChild(full);
  } else if (isSelected) {
    // Already in jury — allow removing
    const rem = el(`<button class="btn-add" style="background:var(--danger,#c0392b);border-color:var(--danger,#c0392b)">
      ✓ In der Jury — Entfernen
    </button>`);
    rem.onclick = () => {
      state.selected.delete(p.id);
      state.p1Idx++;
      _drawP1Card();
    };
    actions.appendChild(rem);
  } else {
    const add = el(`<button class="btn-add">Zur Jury hinzufügen</button>`);
    add.onclick = () => {
      state.selected.add(p.id);
      state.p1Idx++;
      _drawP1Card();
    };
    actions.appendChild(add);
  }

  const skip = el(`<button class="btn-skip">Überspringen</button>`);
  skip.onclick = () => {
    state.p1Idx++;
    _drawP1Card();
  };
  actions.appendChild(skip);

  // Back button (optional nice-to-have)
  if (idx > 0) {
    const back = el(`<button class="btn-back-card">← Vorherige Karte</button>`);
    back.onclick = () => {
      state.p1Idx--;
      _drawP1Card();
    };
    actions.appendChild(back);
  }

  // Confirm button — only show once 10 are chosen
  if (chosen === JURY_SIZE) {
    const confirm = el(`<button class="btn" style="margin-top:8px;font-size:18px">
      Jury bestätigen →
    </button>`);
    confirm.onclick = onConfirmHandPick;
    actions.appendChild(confirm);
  }

  shell.appendChild(actions);
  stage.appendChild(shell);
}

/* Shown when all cards are exhausted */
function _drawP1Done() {
  const chosen = state.selected.size;
  const shell  = el(`<div class="p1-shell"></div>`);

  if (chosen >= JURY_SIZE) {
    // Happy path — all 10 chosen
    shell.appendChild(el(`<div class="p1-done">
      <h2>Alle Kandidaten gesehen</h2>
      <p>${chosen}/${JURY_SIZE} gewählt. Du kannst die Jury jetzt bestätigen.</p>
    </div>`));
    const confirm = el(`<button class="btn" style="font-size:20px;padding:14px 32px">
      Jury bestätigen →
    </button>`);
    confirm.onclick = onConfirmHandPick;
    shell.appendChild(confirm);
  } else {
    // Not enough chosen
    shell.appendChild(el(`<div class="p1-done">
      <h2>Alle Kandidaten gesehen</h2>
      <p>Du hast nur ${chosen} von ${JURY_SIZE} Plätzen besetzt.
         Gehe zurück und wähle ${JURY_SIZE - chosen} weitere.</p>
    </div>`));
    const restart = el(`<button class="btn ghost" style="font-size:16px">
      Von vorne durchblättern
    </button>`);
    restart.onclick = () => {
      state.p1Idx = 0;
      _drawP1Card();
    };
    shell.appendChild(restart);
  }

  stage.appendChild(shell);
}

/* -----------------------------------------------------------------------
   _makeP1Card(p)  — builds the large single card (no click-to-reveal)
   makeCard(p) is kept as an alias so nothing else in game.js breaks.
   ----------------------------------------------------------------------- */
function _makeP1Card(p) {
  const c = el(`
    <div class="p1-card">
      <div class="nm">${p.name}</div>
      <div class="ti">${p.title} · ${p.edu}</div>
      <div class="sp">${p.spec}</div>
      <div class="bio">${p.bio}</div>
      <div class="crit"></div>
    </div>`);

  const crit = c.querySelector(".crit");

  CRITERIA.forEach(cr => {
    const chip = el(`<span class="chip shown" data-k="${cr.key}">
      ${cr.label} <span class="val">${"●".re