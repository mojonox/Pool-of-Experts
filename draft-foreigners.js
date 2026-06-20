/* ==========================================================================
   draft-foreigners.js
   Drop-in replacements for rForeigners() and new rForeignersPress().

   Globals used (defined in game.js — do NOT redeclare):
     stage, state, el, go, viennaMail, hudAddRep, hudAddDelay, hudFeed,
     newspaper, VIENNA
   ========================================================================== */

/* ---------- Step 1: Vienna mail — rejection ---------- */
function rForeigners(){
  stage.innerHTML="";
  // "Send the enquiry" is the first-pass label; on click we show the rejection
  // result inline, then the player clicks "Verstanden" to proceed to the press screen.
  stage.appendChild(viennaMail(
    "foreigners",
    "Verstanden",
    ()=>{ rForeignersPress(); }   // direct call — no go() needed, no screen-state
  ));
}

/* ---------- Step 2: newspaper fallout ---------- */
function rForeignersPress(){
  // Apply HUD effects
  hudAddDelay(2);
  hudAddRep(-15);
  hudFeed("Kronen Zeitung","Jury-Suche: Woher kommen die Experten?");

  // Build the newspaper SVG inline so we can keep the style consistent
  // with KRONE_SVG but use a different headline.
  const FOREIGNERS_SVG = newspaper({
    masthead:  "KRONEN ZEITUNG",
    mastColor: "#d81e2c",
    paper:     "#fffdf6",
    line1:     "Wettbewerbsbüro sucht",
    line2:     "Experten im Ausland?",
    sub:       "Jury-Suche für Alte WU: Keine geeigneten Österreicher gefunden?"
  });

  stage.innerHTML="";
  const card = el(`<div class="appcard">
    <span class="badge">In der Presse</span>
    <div class="art">${FOREIGNERS_SVG}</div>
    <h2>Das stand heute Früh in der Zeitung</h2>
    <p>Ein Bericht spekuliert, warum die Jury-Suche stockt.
       Kein Vorwurf — aber die Frage steht im Raum. Die Anfrage
       hat zwei Wochen gekostet, und nichts gewonnen.</p>
    <div class="btnbar col" style="margin-top:16px">
      <button class="btn" id="fp-close">Close</button>
    </div>
  </div>`);
  stage.appendChild(card);
  document.getElementById("fp-close").onclick = ()=>go("apps");
}

/* ==========================================================================
   go()-Map change required in game.js
   -------------------------------------------------------------------------
   BEFORE (line ~70–74):
     ({ intro:rIntro, p1:rPhase1, handoff:rHandoff, appsMail:rAppsMail, apps:rApps,
        kitchen:rKitchen, kronepress:rKronepress, holiday:rHoliday,
        foreigners:rForeigners, moremen:rMoreMen, standardpress:rStandardpress,
        extend:rExtend, quota:rQuota, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
        reveal:rReveal, outro:rOutro, reflect:rReflect })[screen]();

   AFTER — add  foreignerspress:rForeignersPress  :
     ({ intro:rIntro, p1:rPhase1, handoff:rHandoff, appsMail:rAppsMail, apps:rApps,
        kitchen:rKitchen, kronepress:rKronepress, holiday:rHoliday,
        foreigners:rForeigners, foreignerspress:rForeignersPress, moremen:rMoreMen, standardpress:rStandardpress,
        extend:rExtend, quota:rQuota, confirm:rConfirm, sendletter:rSendLetter, intermezzo:rIntermezzo,
        reveal:rReveal, outro:rOutro, reflect:rReflect })[screen]();
   ========================================================================== */
