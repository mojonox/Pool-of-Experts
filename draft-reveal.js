/* ============================================================
   draft-reveal.js
   Replacement for rReveal(), makeLane(), rIntermezzo()
   Depends on globals: stage, state, el, countInvited,
                       WOMEN_TARGET, MEN_TARGET, go, WEEK_COST
   ============================================================ */

/* ----------------------------------------------------------
   SVG HELPERS
   ---------------------------------------------------------- */

function _paperDoll({ overflow = false, empty = false } = {}) {
  if (empty) {
    // Leerer Sitz: gestricheltes Rechteck
    return `<svg width="50" height="80" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="42" height="72" rx="6"
        fill="none" stroke="#143041" stroke-width="2"
        stroke-dasharray="6 4" opacity="0.35"/>
      <text x="25" y="46" text-anchor="middle"
        font-family="VT323,monospace" font-size="22"
        fill="#143041" opacity="0.3">?</text>
    </svg>`;
  }

  const outlineColor = overflow ? '#e53935' : '#143041';
  const bgColor      = overflow ? '#ffc2df' : 'none';
  const bodyFill     = '#e8cfa0';
  const strokeW      = overflow ? '3' : '2.5';

  return `<svg width="50" height="80" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
    ${bgColor !== 'none' ? `<rect x="0" y="0" width="50" height="80" rx="7" fill="${bgColor}" opacity="0.45"/>` : ''}
    <!-- head -->
    <circle cx="25" cy="14" r="10"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- eyes -->
    <circle cx="21" cy="13" r="1.5" fill="${outlineColor}"/>
    <circle cx="29" cy="13" r="1.5" fill="${outlineColor}"/>
    <!-- torso -->
    <rect x="14" y="26" width="22" height="24" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- left arm -->
    <rect x="4" y="27" width="9" height="18" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- right arm -->
    <rect x="37" y="27" width="9" height="18" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- left leg -->
    <rect x="14" y="51" width="9" height="22" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
    <!-- right leg -->
    <rect x="27" y="51" width="9" height="22" rx="4"
      fill="${bodyFill}" stroke="${outlineColor}" stroke-width="${strokeW}"/>
  </svg>`;
}

function _cabinIcon(label) {
  // Kleines Häuschen als Pool-Kabine
  return `<svg width="54" height="36" viewBox="0 0 54 36" xmlns="http://www.w3.org/2000/svg">
    <!-- Dach -->
    <polygon points="27,3 51,18 3,18"
      fill="#5cb9da" stroke="#143041" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Wand -->
    <rect x="8" y="17" width="38" height="18" rx="2"
      fill="#fffdf6" stroke="#143041" stroke-width="2.5"/>
    <!-- Nummer -->
    <text x="27" y="31" text-anchor="middle"
      font-family="VT323,monospace" font-size="13" fill="#143041">${label}</text>
  </svg>`;
}


/* ----------------------------------------------------------
   makeLane(label, count, target, overflowStyle)
   Renders one row of pool cabins with paper-doll figures.

   label        – row heading string
   count        – how many people are actually in this lane
   target       – how many slots the pool prepared (WOMEN_TARGET or MEN_TARGET)
   overflowStyle– 'overflow' | 'missing'  (not used directly; derived from count vs target)
   ---------------------------------------------------------- */
function makeLane(label, count, target) {
  const slots     = Math.max(count, target); // total visual slots
  const overflow  = Math.max(0, count - target);
  const missing   = Math.max(0, target - count);
  const normal    = count - overflow;

  let figuresHTML = '';

  for (let i = 0; i < slots; i++) {
    const isOverflow = i >= target;          // beyond prepared slots
    const isEmpty    = i >= count;           // no person assigned

    figuresHTML += `<div class="dr-slot" title="${isEmpty ? 'Leer' : (isOverflow ? 'Überzählig' : 'Besetzt')}">
      ${_cabinIcon(i + 1)}
      <div class="dr-doll">${_paperDoll({ overflow: isOverflow && !isEmpty, empty: isEmpty })}</div>
    </div>`;
  }

  const balanceNote = overflow > 0
    ? `<span class="dr-overflow-note">+${overflow} ohne Kabine</span>`
    : missing > 0
      ? `<span class="dr-missing-note">${missing} Kabine${missing > 1 ? 'n' : ''} leer</span>`
      : `<span class="dr-ok-note">Perfekt belegt</span>`;

  return `<div class="dr-lane">
    <div class="dr-lane-label">${label} ${balanceNote}</div>
    <div class="dr-slots-row">${figuresHTML}</div>
  </div>`;
}


/* ----------------------------------------------------------
   rReveal()
   The final reveal scene.
   ---------------------------------------------------------- */
function rReveal() {
  const { w, m } = countInvited();

  const womenLane = makeLane('Kabinen für Frauen', w, WOMEN_TARGET);
  const menLane   = makeLane('Kabinen für Männer', m, MEN_TARGET);

  const totalSlots = WOMEN_TARGET + MEN_TARGET;
  const total      = w + m;

  // Summary bar colour
  const balanced   = w === WOMEN_TARGET && m === MEN_TARGET;
  const summaryClass = balanced ? 'dr-summary--ok' : 'dr-summary--off';

  stage.innerHTML = `
    <div class="dr-reveal">

      <h2 class="dr-title">Welcome to the Expert Pool.</h2>

      <div class="dr-venue-art" style="margin-bottom:1.2rem;border:3px solid var(--ink,#143041);border-radius:10px;overflow:hidden;line-height:0">
        <svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
          <rect x="0" y="0" width="620" height="200" fill="#fffdf6"/>
          <rect x="60" y="90" width="500" height="80" fill="#a3e5f7" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="60" y="90" width="500" height="6" fill="#ffcf4d" stroke="none"/>
          <line x1="60" y1="115" x2="560" y2="115" stroke="#143041" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.5"/>
          <line x1="60" y1="140" x2="560" y2="140" stroke="#143041" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.5"/>
          <path d="M60 105 Q80 100 100 105 Q120 110 140 105 Q160 100 180 105 Q200 110 220 105 Q240 100 260 105 Q280 110 300 105 Q320 100 340 105 Q360 110 380 105 Q400 100 420 105 Q440 110 460 105 Q480 100 500 105 Q520 110 540 105 Q560 100 560 105" fill="none" stroke="#143041" stroke-width="1.5" opacity="0.4"/>
          <rect x="56" y="86" width="508" height="8" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="56" y="168" width="508" height="8" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="50" y="86" width="10" height="90" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="560" y="86" width="10" height="90" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="62" y="72" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="68" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="62" y="97" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="93" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="62" y="122" width="30" height="16" rx="2" fill="#143041" stroke="#143041" stroke-width="2"/>
          <rect x="66" y="118" width="22" height="6" rx="1" fill="#ffcf4d" stroke="#143041" stroke-width="2"/>
          <rect x="440" y="36" width="130" height="54" rx="3" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="448" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="448" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="448" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="480" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="480" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="480" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="512" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="512" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="512" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="544" y="44" width="22" height="20" rx="2" fill="#ffc2df" stroke="#143041" stroke-width="2" stroke-linejoin="round"/>
          <rect x="544" y="62" width="22" height="6" rx="1" fill="#143041"/>
          <rect x="544" y="40" width="22" height="6" rx="2" fill="#143041"/>
          <rect x="440" y="26" width="130" height="12" rx="2" fill="#143041"/>
          <rect x="10" y="60" width="30" height="60" rx="2" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="4" y="56" width="42" height="8" rx="2" fill="#ffcf4d" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <rect x="14" y="118" width="6" height="24" fill="#143041"/>
          <rect x="30" y="118" width="6" height="24" fill="#143041"/>
          <rect x="14" y="128" width="22" height="4" fill="#143041"/>
          <rect x="10" y="42" width="30" height="16" rx="2" fill="#fffdf6" stroke="#143041" stroke-width="2"/>
          <line x1="25" y1="42" x2="25" y2="26" stroke="#143041" stroke-width="2"/>
          <polygon points="25,26 38,30 25,34" fill="#ffc2df" stroke="#143041" stroke-width="1.5" stroke-linejoin="round"/>
          <rect x="0" y="176" width="620" height="24" fill="#fffdf6" stroke="#143041" stroke-width="3" stroke-linejoin="round"/>
          <ellipse cx="200" cy="128" rx="30" ry="6" fill="#fffdf6" opacity="0.3"/>
          <ellipse cx="380" cy="118" rx="20" ry="4" fill="#fffdf6" opacity="0.3"/>
        </svg>
      </div>

      <p class="dr-subtitle">
        ${totalSlots} Kabinen — ${WOMEN_TARGET} für Frauen, ${MEN_TARGET} für Männer.
        Alle Plätze waren vorbereitet.
      </p>

      <div class="dr-pool-grid">
        ${womenLane}
        ${menLane}
      </div>

      <div class="dr-summary ${summaryClass}">
        <span>Deine Jury:</span>
        <strong>${w} Frau${w !== 1 ? 'en' : ''}</strong>
        <span>&amp;</span>
        <strong>${m} Mann / Männer</strong>
        ${!balanced ? `<span class="dr-imbalance">— ${Math.abs(w - m)} Platz${Math.abs(w-m)!==1?'e':''} falsch verteilt</span>` : '<span class="dr-balanced">— ausgewogen ✓</span>'}
      </div>

      <div class="dr-reflect">
        <p>
          Das Pool-Komitee hatte die Infrastruktur für eine gleichmäßige Verteilung geplant —
          Kabinen, Namensschilder, Handtücher, alles <em>five a side</em>.
          Wer nicht passte, stand draußen. Wer fehlte, hinterließ leere Plätze.
        </p>
      </div>

      <button class="dr-btn-primary" onclick="go('outro')">Was ist passiert? →</button>
    </div>

    <style>
      /* ---- Reveal scene styles ---- */
      .dr-reveal {
        max-width: 760px;
        margin: 0 auto;
        padding: 2rem 1rem 3rem;
        font-family: 'Space Grotesk', sans-serif;
        color: var(--ink, #143041);
      }

      .dr-title {
        font-family: 'VT323', monospace;
        font-size: clamp(2rem, 6vw, 3rem);
        color: var(--ink, #143041);
        margin: 0 0 .4rem;
        letter-spacing: .04em;
      }

      .dr-subtitle {
        font-size: .95rem;
        opacity: .75;
        margin: 0 0 1.8rem;
      }

      .dr-pool-grid {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
        margin-bottom: 1.8rem;
      }

      .dr-lane {
        background: var(--water, #a3e5f7);
        border: 3px solid var(--ink, #143041);
        border-radius: 10px;
        padding: .9rem 1rem 1rem;
      }

      .dr-lane-label {
        font-family: 'VT323', monospace;
        font-size: 1.3rem;
        margin-bottom: .6rem;
        display: flex;
        align-items: center;
        gap: .7rem;
      }

      .dr-overflow-note  { background:#e53935; color:#fff; font-size:.75rem; padding:2px 7px; border-radius:4px; font-family:'Space Grotesk',sans-serif; }
      .dr-missing-note   { background:var(--gold,#ffcf4d); color:var(--ink,#143041); font-size:.75rem; padding:2px 7px; border-radius:4px; font-family:'Space Grotesk',sans-serif; }
      .dr-ok-note        { background:var(--ok,#4fb286); color:#fff; font-size:.75rem; padding:2px 7px; border-radius:4px; font-family:'Space Grotesk',sans-serif; }

      .dr-slots-row {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
      }

      .dr-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        cursor: default;
      }

      .dr-doll svg {
        display: block;
      }

      /* Summary bar */
      .dr-summary {
        display: flex;
        align-items: center;
        gap: .6rem;
        flex-wrap: wrap;
        border: 3px solid var(--ink,#143041);
        border-radius: 8px;
        padding: .7rem 1rem;
        font-size: 1rem;
        margin-bottom: 1.4rem;
      }
      .dr-su