/* ==========================================================================
   POOL OF EXPERTS — data.js
   26 architect profiles (6 women / 20 men) from Katy's source material.

   Each profile carries five SIGNALS on a 0..3 scale. Four are weightable by
   the player ("the AI learns these"); the fifth is the honest competence path.

     availability  — full-time / 60h-week readiness        → pulls MALE
     assertiveness — leadership / "decisive" vocabulary     → pulls MALE
     prestige      — elite school + honours (DOUBLE FLOOR)  → pulls FEMALE
     seniority     — years in continuous practice           → pulls MALE
     publicValue   — sustainability / accessibility / civic → pulls FEMALE (fair path, not weightable)

   gender is hidden metadata: never shown in the UI, only used at the reveal.
   Signal values are a FIRST PASS — the profile audit (see concept §9) still
   has to even out text length & seniority before the final build.
   ========================================================================== */

const CRITERIA = [
  { key:"availability",  label:"Availability",   hint:"Full-time, on-site, long hours" },
  { key:"assertiveness", label:"Assertiveness",  hint:"Leadership & decisiveness" },
  { key:"prestige",      label:"Prestige",       hint:"Elite school, top honours" },
  { key:"seniority",     label:"Seniority",      hint:"Years of continuous practice" },
];
const COMPETENCE = { key:"publicValue", label:"Public-good fit",
  hint:"Sustainability, accessibility, civic use" };

const PROFILES = [
  // ---------------- WOMEN (6) ----------------
  { id:"alexander", name:"Johanna Alexander", title:"Dipl.-Ing.", gender:"woman",
    spec:"Ecological Housing & Timber Construction",
    edu:"TU Wien — with Honours",
    bio:"Sustainable urban housing. Winner of the New European Bauhaus award for circular construction. 8 years in renewable raw materials.",
    sig:{ availability:1, assertiveness:1, prestige:3, seniority:1, publicValue:3 } },

  { id:"ameling", name:"Antonia Ameling", title:"Dipl.-Ing. MA", gender:"woman",
    spec:"Historic Preservation & Revitalisation",
    edu:"Kunstuni Linz — with Distinction",
    bio:"Gentle transformation of historic fabric. Master's in Heritage Conservation, Florence. Expert in regulatory approvals.",
    sig:{ availability:1, assertiveness:1, prestige:3, seniority:2, publicValue:2 } },

  { id:"berger", name:"Elena Berger", title:"Dipl.-Ing.", gender:"woman",
    spec:"Urban Transformation & Neighbourhood Development",
    edu:"TU Graz — with Honours",
    bio:"Resilient urban planning and public participation processes. Master planning of mixed-use neighbourhoods.",
    sig:{ availability:1, assertiveness:2, prestige:3, seniority:2, publicValue:3 } },

  { id:"binder", name:"Angelika Binder", title:"Dipl.-Ing.", gender:"woman",
    spec:"Building Biology, Renovation & Energy Efficiency",
    edu:"TU Wien — Good",
    bio:"Certified building biologist. Pollutant-free materials, healthy indoor climate, energy retrofits of public institutions.",
    sig:{ availability:2, assertiveness:1, prestige:2, seniority:2, publicValue:3 } },

  { id:"danneberg", name:"Birgit Danneberg", title:"Dipl.-Ing.", gender:"woman",
    spec:"Large-Scale Calculation & Construction Management",
    edu:"TU Wien — with Honours",
    bio:"Lean Construction and digital construction management. Financial control of budget-intensive cultural and educational buildings.",
    sig:{ availability:2, assertiveness:2, prestige:3, seniority:2, publicValue:1 } },

  { id:"brandstaetter", name:"Marion Brandstätter", title:"Dipl.-Ing.", gender:"woman",
    spec:"Open Space Planning & Landscape Architecture",
    edu:"BOKU Wien — with Distinction",
    bio:"Structural engineering meets green infrastructure. Roof greening, sponge-city principles, public-space design.",
    sig:{ availability:1, assertiveness:1, prestige:3, seniority:1, publicValue:3 } },

  // ---------------- MEN (20) ----------------
  { id:"resch", name:"Reinhard Resch", title:"Dipl.-Ing.", gender:"man",
    spec:"Reinforced Concrete & Skeleton Construction",
    edu:"TU Wien — Good",
    bio:"Complex structural frameworks. Over 15 years turnkey delivery of large commercial and infrastructure projects.",
    sig:{ availability:3, assertiveness:3, prestige:2, seniority:3, publicValue:0 } },

  { id:"brunner", name:"Gerald Brunner", title:"Dipl.-Ing. Dr.", gender:"man",
    spec:"Safety Engineering & Fire Protection",
    edu:"TU Graz — Satisfactory",
    bio:"Doctorate in civil engineering. State-certified expert witness for fire protection and safety concepts for public venues.",
    sig:{ availability:3, assertiveness:3, prestige:1, seniority:3, publicValue:1 } },

  { id:"doppler", name:"Klemens Doppler", title:"Dipl.-Ing.", gender:"man",
    spec:"Industrial Architecture & Logistics Centres",
    edu:"TU Wien — Good",
    bio:"Decades of general planning of industrial facilities. Functional, modular, economically optimised hall structures.",
    sig:{ availability:3, assertiveness:2, prestige:2, seniority:3, publicValue:0 } },

  { id:"ebner", name:"Matthias Ebner", title:"Dipl.-Ing.", gender:"man",
    spec:"Conceptual Architecture & Cultural Buildings",
    edu:"Kunstuni Linz — Good",
    bio:"Museums, galleries, temporary exhibition spaces. Avant-garde geometries and sculptural building volumes.",
    sig:{ availability:2, assertiveness:2, prestige:2, seniority:2, publicValue:1 } },

  { id:"deutsch", name:"Gregor Deutsch", title:"Dipl.-Ing.", gender:"man",
    spec:"Classic Structural Engineering & Residential Complexes",
    edu:"TU Wien — Sufficient",
    bio:"Large-scale Viennese residential construction. Building regulations, zoning procedures, cost-efficient methods.",
    sig:{ availability:3, assertiveness:2, prestige:1, seniority:3, publicValue:1 } },

  { id:"eder", name:"Benjamin Eder", title:"Dipl.-Ing.", gender:"man",
    spec:"Commercial Architecture & Office Complexes",
    edu:"TU Graz — Satisfactory",
    bio:"Corporate headquarters at home and abroad. Flexible floor plans, New Work concepts, glass-metal façades.",
    sig:{ availability:3, assertiveness:3, prestige:1, seniority:2, publicValue:0 } },

  { id:"gruber", name:"Oliver Gruber", title:"Dipl.-Ing.", gender:"man",
    spec:"Hospital Architecture & Healthcare Facilities",
    edu:"TU Wien — Good",
    bio:"Complex logistics of hospital and care-home construction. Medical hygiene, technology, radiation-protection standards.",
    sig:{ availability:2, assertiveness:2, prestige:2, seniority:3, publicValue:2 } },

  { id:"gasser", name:"Kilian Gasser", title:"Mag.arch.", gender:"man",
    spec:"Interface Design & Digital Fabrication",
    edu:"Angewandte Wien — with Distinction",
    bio:"Parametric design, algorithmic architecture, 3D-printing. Agency stints in London and Rotterdam.",
    sig:{ availability:2, assertiveness:2, prestige:3, seniority:1, publicValue:1 } },

  { id:"hofer", name:"Gerald Hofer", title:"Dipl.-Ing.", gender:"man",
    spec:"Underground Car Parks & Complex Infrastructure",
    edu:"TU Wien — Good",
    bio:"Substructures, deep foundations, tunnel works, urban transport hubs. Structural stabilisation during underpinning.",
    sig:{ availability:3, assertiveness:3, prestige:2, seniority:3, publicValue:0 } },

  { id:"wagner", name:"Albert Wagner", title:"Dipl.-Arch. FH", gender:"man",
    spec:"Façade Technology & Building Envelopes",
    edu:"FH Kärnten — Good",
    bio:"Intelligent, kinetic façade systems for daylight and energy generation. Technical consulting for large projects.",
    sig:{ availability:2, assertiveness:2, prestige:1, seniority:2, publicValue:2 } },

  { id:"winkler", name:"Manuel Winkler", title:"Dipl.-Ing.", gender:"man",
    spec:"Residential Project Management & Procurement",
    edu:"TU Wien — Good",
    bio:"Structuring, tendering and procurement under the Federal Procurement Act. General project manager for municipal projects.",
    sig:{ availability:3, assertiveness:3, prestige:2, seniority:3, publicValue:1 } },

  { id:"vogler", name:"Peter Vogler", title:"Dipl.-Ing.", gender:"man",
    spec:"Building Physics & Acoustics",
    edu:"TU Graz — Satisfactory",
    bio:"Thermal, energetic and acoustic building simulations. Room acoustics for lecture halls, sound insulation in dense areas.",
    sig:{ availability:2, assertiveness:1, prestige:1, seniority:2, publicValue:2 } },

  { id:"stadler", name:"Daniel Stadler", title:"Dipl.-Ing.", gender:"man",
    spec:"BIM Management & CAD Coordination",
    edu:"TU Wien — Good",
    bio:"Digital planning methods across all phases. Interface coordination and training of interdisciplinary teams.",
    sig:{ availability:2, assertiveness:2, prestige:2, seniority:2, publicValue:1 } },

  { id:"schwarz", name:"Samuel Schwarz", title:"Dipl.-Ing.", gender:"man",
    spec:"Tendering & On-site Supervision (ÖBA)",
    edu:"TU Wien — Good",
    bio:"On-site supervision, scheduling, quality control. Assertive crisis and claim management directly on site.",
    sig:{ availability:3, assertiveness:3, prestige:2, seniority:3, publicValue:0 } },

  { id:"salzmann", name:"Benedikt Salzmann", title:"Dipl.-Ing.", gender:"man",
    spec:"Interior Design & Lighting Design",
    edu:"Kunstuni Linz — with Distinction",
    bio:"Atmospheric interiors, bespoke furniture concepts, daylight and artificial lighting for educational buildings.",
    sig:{ availability:1, assertiveness:1, prestige:3, seniority:1, publicValue:2 } },

  { id:"kofler", name:"Christian Kofler", title:"Dipl.-Ing.", gender:"man",
    spec:"Urban Planning & Master Planning",
    edu:"TU Wien — Good",
    bio:"Large-scale urban concepts, framework plans, zoning. Extensive work with city governments and developers.",
    sig:{ availability:2, assertiveness:3, prestige:2, seniority:3, publicValue:2 } },

  { id:"graf", name:"Gregor Graf", title:"Dipl.-Ing.", gender:"man",
    spec:"Alpine Architecture & Tourism Buildings",
    edu:"Uni Innsbruck — Good",
    bio:"Resource-saving construction in high-alpine regions, cable-car stations, ecological hotel structures.",
    sig:{ availability:3, assertiveness:2, prestige:1, seniority:2, publicValue:2 } },

  { id:"mayr", name:"Michael Mayr", title:"Dipl.-Ing.", gender:"man",
    spec:"Educational & School Buildings",
    edu:"TU Graz — Good",
    bio:"Modern educational clusters, open learning landscapes. Focus on contemporary pedagogy and accessibility.",
    sig:{ availability:2, assertiveness:2, prestige:2, seniority:2, publicValue:3 } },

  { id:"boemmel", name:"Felix Bömmel", title:"Dipl.-Ing.", gender:"man",
    spec:"Modular Construction & Prefabrication",
    edu:"TU Wien — Satisfactory",
    bio:"Serial and modular methods in timber and system engineering. Fast, cost-efficient factory prefabrication.",
    sig:{ availability:3, assertiveness:2, prestige:1, seniority:2, publicValue:1 } },

  { id:"dietl", name:"Gabriel Dietl", title:"Mag.arch.", gender:"man",
    spec:"Glass Architecture & Solar Energy",
    edu:"Angewandte Wien — with Distinction",
    bio:"Passive solar utilisation and transparent, intelligent envelopes. Fusion of outdoor space, daylight and interior.",
    sig:{ availability:2, assertiveness:2, prestige:3, seniority:2, publicValue:3 } },
];

/* City-of-Vienna narrator messages for the new flow:
   hand-pick → applications under pressure → pool reveal. No more "assistant". */
const VIENNA = {
  phase1: {
    subject:"New jury commission — the Old WU site",
    body:"Dear partner, the City of Vienna is delighted to entrust you with the jury for our Old WU competition. Please assemble ten excellent experts. Take your time — quality first. Warm regards, Stadt Wien.",
  },
  applications: {
    subject:"The official call has opened",
    body:"Wonderful start! We've now opened the formal public call, so candidates apply one by one and you review each in turn. A heads-up: the applicant field skews heavily male — that's the reality of the profession, not your doing. There's also a deadline. Do your best. Stadt Wien.",
  },
  deadline: {
    subject:"Deadline approaching",
    body:"A gentle reminder that the application window is closing. You may extend the call to wait for more applicants — but every extension delays the project start and adds cost. Your decision. Stadt Wien.",
  },
  quota: {
    subject:"Equal-representation guidelines",
    body:"For the record, our guidelines target a 50/50 jury. We know that's hard given who actually applies — so this is not a reproach to you. We simply have to note it. Stadt Wien.",
  },
  foreigners: {
    subject:"May we invite experts from abroad?",
    body:"You ask the City whether the pool could be widened to architects from outside Austria. The answer takes two weeks to come back: the call is restricted to the existing pool. No. Stadt Wien.",
  },
  moremen: {
    subject:"May we relax the balance target?",
    body:"You ask whether the 50/50 guideline could be set aside — simply fill the jury with whoever applied. That, too, has consequences. The city will need to officially respond, and the press will notice. Stadt Wien.",
  },
};
