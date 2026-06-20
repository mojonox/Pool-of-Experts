/* ==========================================================================
   draft-letter.js — rSendLetter()
   Visual transition screen: formal Austrian invitation letter
   Sits between "confirm" and "intermezzo" in the game flow.
   Globals used from game.js: stage, state, el, go, countInvited
   ========================================================================== */

function rSendLetter() {
  stage.innerHTML = "";

  const dateStr = new Date().toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const stampSVG = `
    <svg viewBox="0 0 80 80" width="80" height="80" style="flex-shrink:0">
      <circle cx="40" cy="40" r="36" fill="none" stroke="#143041" stroke-width="3"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="#143041" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="40" y="32" text-anchor="middle" font-family="VT323,monospace" font-size="14" fill="#143041">STADT</text>
      <text x="40" y="48" text-anchor="middle" font-family="VT323,monospace" font-size="18" fill="#143041">WIEN</text>
      <text x="40" y="60" text-anchor="middle" font-family="VT323,monospace" font-size="10" fill="#143041">WETTBEWERB</text>
    </svg>`;

  const wrap = el(`
    <div class="slide" style="
      display:flex;
      flex-direction:column;
      align-items:center;
      padding:32px 16px 40px;
      background:var(--water);
    ">
      <p style="
        font-family:'Space Grotesk',sans-serif;
        font-size:13px;
        color:var(--ink);
        opacity:0.6;
        margin:0 0 16px;
        letter-spacing:0.05em;
        text-transform:uppercase;
      ">Einladungsschreiben wird versendet …</p>

      <div id="letter" style="
        max-width:600px;
        width:100%;
        background:#fffdf6;
        border:3px solid #143041;
        box-shadow:6px 6px 0 #143041;
        padding:40px 44px 44px;
        font-family:'Space Grotesk',sans-serif;
        color:#143041;
        letter-spacing:-0.01em;
        line-height:1.6;
        position:relative;
      ">
        <!-- Header row: sender block + stamp -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;opacity:0.5;margin-bottom:4px">Absender</div>
            <div style="font-size:13px;font-weight:600;">Wettbewerbsbüro Wien</div>
            <div style="font-size:13px;">Ringstraße 1, 1010 Wien</div>
          </div>
          <div style="opacity:0.75">
            ${stampSVG}
          </div>
        </div>

        <!-- Date -->
        <div style="font-size:13px;text-align:right;margin-bottom:28px;opacity:0.7;">
          Wien, ${dateStr}
        </div>

        <!-- Subject -->
        <div style="
          font-size:14px;
          font-weight:700;
          margin-bottom:24px;
          border-left:3px solid #143041;
          padding-left:12px;
          line-height:1.4;
        ">
          Einladung zur Jurytätigkeit — Architekturwettbewerb Alte WU, Augasse
        </div>

        <!-- Salutation -->
        <p style="margin:0 0 18px;font-size:15px;">Sehr geehrte Damen und Herren,</p>

        <!-- Body paragraphs -->
        <p style="margin:0 0 16px;font-size:14px;text-align:justify;">
          Im Namen der Stadt Wien laden wir Sie herzlich ein, als Mitglied der Fachjury
          für den Architekturwettbewerb auf dem Areal der Alten WU, Augasse, 1090 Wien,
          tätig zu sein.
        </p>
        <p style="margin:0 0 32px;font-size:14px;text-align:justify;">
          Die Jury umfasst zehn unabhängige Expertinnen und Experten. Der erste Arbeitstag
          ist für Donnerstag, 09:00 Uhr, im Expertinnen- und Expertenpool geplant. Wir
          ersuchen Sie um Bestätigung Ihrer Teilnahme.
        </p>

        <!-- Closing -->
        <p style="margin:0;font-size:14px;">Mit freundlichen Grüßen</p>
        <div style="height:36px;"></div>
        <p style="margin:0;font-size:14px;font-weight:600;">Stadt Wien, Wettbewerbsbüro</p>
      </div>

      <!-- Action buttons -->
      <div class="btnbar" style="margin-top:28px;max-width:600px;width:100%;justify-content:space-between;display:flex;gap:12px;">
        <button class="btn ghost" id="sl-back" style="font-size:15px;">← Zurück</button>
        <button class="btn" id="sl-send" style="
          font-size:20px;
          padding:10px 36px;
          background:var(--ok);
          color:#fff;
          border-color:var(--ok);
        ">Absenden ✉</button>
      </div>
    </div>
  `);

  stage.appendChild(wrap);

  document.getElementById("sl-back").onclick = () => go("confirm");
  document.getElementById("sl-send").onclick = () => go("intermezzo");
}
