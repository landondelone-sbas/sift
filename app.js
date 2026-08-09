"use strict";

/* ============================================================
   1. REFERENCE DATA — 50 exception names.
   Each carries the one variant question that separates the real
   thing from the hyped thing. No prices anywhere: this tool
   flags candidates, it does not appraise.
   ============================================================ */


/* ============================================================
   1. STORAGE — localStorage, with an in-memory fallback + banner
   ============================================================ */
const KEY = "sift.session.v2";
let storageOK = true;
try{ localStorage.setItem(KEY+".probe","1"); localStorage.removeItem(KEY+".probe"); }
catch(e){ storageOK = false; }

function blank(){ return { started:new Date().toISOString(), records:[] }; }
function load(){
  if(!storageOK){ document.getElementById("storagewarn").hidden = false; return blank(); }
  try{ const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : blank(); }
  catch(e){ return blank(); }
}
function save(){
  if(!storageOK) return;
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }
  catch(e){ storageOK = false; document.getElementById("storagewarn").hidden = false; }
}
let state = load();

/* ============================================================
   3. TRIAGE FLOW
   Name comes first. A confirmed watchlist variant sets a TIER
   FLOOR immediately and pins a flag to every later screen.
   The tag questions then run as normal and can only pull the
   tier UP, never down:  final = min(floor, tagTier)
   ============================================================ */
const STAGES = ["NAME","TAG","GENERATION","DETAIL"];
let cur = null, screen = null, keymap = [];
const SORT = document.getElementById("view-sort");

function startItem(){
  cur = { name:"", watch:null, floor:null, floorWhy:"",
          hang_tag:null, poem:null, thin_ty:null, pellets:null, mismatch:null,
          tier:null, reason:"", note:"", hold:false };
  go("name");
}
function go(s){ screen = s; render(); }

function render(){
  keymap = [];
  document.getElementById("seqlabel").textContent = "#" + (state.records.length + 1);
  document.getElementById("undo").disabled = state.records.length === 0;
  counts();
  ({ name:screenName, variant:screenVariant, hangtag:screenHangTag, poem:screenPoem,
     thinty:screenThinTy, pellets:screenPellets, mismatch:screenMismatch, result:screenResult })[screen]();
}

function stageBar(i){
  return `<div class="stage"><span>${STAGES[i]}</span>` +
    STAGES.map((_,x)=>`<i class="${x<=i?"on":""}"></i>`).join("") + `</div>`;
}
function flagBar(){
  if(!cur.floor) return "";
  return `<div class="flag f${cur.floor}">
    <b>FLAGGED · TIER ${cur.floor}</b><span>${esc(cur.name)} — ${esc(cur.floorWhy)}</span></div>`;
}
function frame(stage, question, hint, body, extra){
  SORT.innerHTML = stageBar(stage) + flagBar() +
    `<div class="card g"><h2 class="q">${question}</h2>${hint?`<p class="hint">${hint}</p>`:""}</div>` +
    (extra||"") + body;
}
function opts(list){
  return `<div class="opts">` + list.map((o,i)=>
    `<button class="opt ${o.cls||""}" data-i="${i}">
       <span class="k">${i+1}</span>
       <span><span class="lbl">${o.label}</span>${o.sub?`<span class="sub">${o.sub}</span>`:""}</span>
     </button>`).join("") + `</div>`;
}
function bindOpts(list){
  keymap = list.map(o=>o.act);
  SORT.querySelectorAll(".opt").forEach(b=>{ b.onclick = ()=> list[+b.dataset.i].act(); });
}

/* --- Stage 1: NAME. Watchlist match sets the floor. --- */
function screenName(){
  SORT.innerHTML = stageBar(0) +
    `<div class="card g">
       <h2 class="q">What's the name on the tag?</h2>
       <p class="hint">Type it as printed. A few names need one extra question — the rest are decided by their tags.</p>
     </div>
     <input class="search" id="q" placeholder="Start typing…" autocomplete="off" autocapitalize="words" spellcheck="false">
     <div class="hits" id="hits"></div>
     <button class="primary" id="next">Continue</button>
     <div style="height:10px"></div>
     <button class="secondary" id="skip">No readable name</button>`;

  const box = document.getElementById("q"), hits = document.getElementById("hits");
  const proceed = ()=>{ cur.name = box.value.trim(); go("hangtag"); };
  document.getElementById("next").onclick = proceed;
  document.getElementById("skip").onclick = ()=>{ cur.name = ""; go("hangtag"); };
  box.onkeydown = e=>{ if(e.key === "Enter"){ e.preventDefault(); proceed(); } };

  const draw = ()=>{
    const t = box.value.trim().toLowerCase();
    if(t.length < 2){ hits.innerHTML = `<div class="empty">${WATCHLIST.length} names need one extra question. Most don't — that's normal.</div>`; return; }
    const found = WATCHLIST.filter(w => w.n.toLowerCase().includes(t) || w.a.some(x=>x.includes(t))).slice(0,6);
    if(!found.length){ hits.innerHTML = `<div class="empty">No extra question for this name. Tap Continue — the tags still decide.</div>`; return; }
    hits.innerHTML = found.map(w =>
      `<button class="hit" data-n="${esc(w.n)}"><span>${esc(w.n)}</span>
        <span class="why ${w.hyped?"myth":""}">${w.hyped?"USUALLY A MYTH<br>1 QUESTION":"COULD BE RARE<br>1 QUESTION"}</span></button>`).join("");
    hits.querySelectorAll(".hit").forEach(b=>{
      b.onclick = ()=>{
        cur.watch = WATCHLIST.find(w => w.n === b.dataset.n);
        cur.name = cur.watch.n;
        go("variant");
      };
    });
  };
  box.oninput = draw; draw();
  if(!("ontouchstart" in window)) box.focus();
}

/* --- The variant question decides whether the floor is real --- */
function screenVariant(){
  const w = cur.watch;
  const list = [
    {label:"Yes — it matches", cls:"hot", sub:`Locks a Tier ${w.yes} floor before the tag checks`,
      act:()=>{ cur.floor = w.yes; cur.floorWhy = "variant confirmed";
                toast(`Flagged Tier ${w.yes} — ${w.n}`); go("hangtag"); }},
    {label:"No — it doesn't", cls:"cool", sub:"No flag. The tag questions still decide.",
      act:()=>{ cur.floorWhy = "variant not present"; go("hangtag"); }}
  ];
  frame(0, esc(w.q), `<strong>${esc(w.n)}</strong> — ${esc(w.note)}`, opts(list));
  bindOpts(list);
}

/* --- Stage 2: is the hang tag there at all? --- */
function screenHangTag(){
  const list = [
    {label:"Yes — heart tag attached", sub:"Paper heart still on the ear or head",
      act:()=>{ cur.hang_tag = true; go("poem"); }},
    {label:"No tag", cls:"cool", sub:"A missing heart tag removes most of the value",
      act:()=>{ cur.hang_tag = false; settle(3, "No hang tag"); }}
  ];
  frame(1, "Is the heart-shaped paper tag still attached?", "", opts(list));
  bindOpts(list);
}

/* --- Stage 3: a poem means 4th generation or later --- */
function screenPoem(){
  const list = [
    {label:"Yes — poem and birthday", sub:"Made 1996 or later, during peak production",
      act:()=>{ cur.poem = true; settle(3, "Peak-era tag (4th generation or later)"); }},
    {label:"No poem", cls:"hot", sub:"Made 1993–1996. This is where value lives.",
      act:()=>{ cur.poem = false; go("thinty"); }}
  ];
  frame(2, "Open the heart tag. Is there a poem inside?",
    "A poem and a birthday mean it was made during the years when tens of millions were produced.",
    opts(list));
  bindOpts(list);
}

/* --- Stage 4a: lettering weight splits 1st–2nd from 3rd gen --- */
function screenThinTy(){
  const figs = `<div class="figs">
    <figure class="fig g">${heart("thin")}<figcaption>THIN / SKINNY</figcaption></figure>
    <figure class="fig g">${heart("bold")}<figcaption>PUFFY / BOLD</figcaption></figure></div>`;
  const list = [
    {label:"Thin and skinny", cls:"hot", sub:"1st or 2nd generation",
      act:()=>{ cur.thin_ty = true; go("mismatch"); }},
    {label:"Puffy and bold", sub:"3rd generation",
      act:()=>{ cur.thin_ty = false; go("pellets"); }}
  ];
  frame(3, "Look at the ty on the front. Thin, or puffy?", "", opts(list), figs);
  bindOpts(list);
}

/* --- Stage 4b: pellet type off the tush tag --- */
function screenPellets(){
  const list = [
    {label:"P.V.C. PELLETS", cls:"hot", sub:"Earlier production",
      act:()=>{ cur.pellets = "pvc"; go("mismatch"); }},
    {label:"P.E. PELLETS", sub:"Later production",
      act:()=>{ cur.pellets = "pe"; go("mismatch"); }},
    {label:"Can't read it", cls:"cool", sub:"Routes up a tier — never down",
      act:()=>{ cur.pellets = "unknown"; go("mismatch"); }}
  ];
  frame(3, "Read the fabric tush tag. Which pellets does it list?",
    "The tush tag is sewn into the rear seam. Fill type is printed on it in small caps.",
    opts(list));
  bindOpts(list);
}

/* --- Cross-tag check: overrides everything --- */
function screenMismatch(){
  const list = [
    {label:"Same name on both", act:()=>{ cur.mismatch = false; resolveEarly(); }},
    {label:"Different names!", cls:"hot", sub:"Forces Tier 1 regardless of anything else",
      act:()=>{ cur.mismatch = true; settle(1, "Hang tag and tush tag names disagree", true); }}
  ];
  frame(3, "Do the heart tag and the fabric tush tag show the same name?",
    "A genuine mismatch on an early piece is the strongest single signal in this whole process.",
    opts(list));
  bindOpts(list);
}

function resolveEarly(){
  if(cur.thin_ty)           return settle(1, "No poem + thin ty — 1st or 2nd generation tag");
  if(cur.pellets === "pvc") return settle(1, "No poem + PVC pellets — early production");
  return settle(2, "No poem — 3rd generation candidate, needs a closer look");
}

/* ============================================================
   4. RESOLUTION + LOGGING
   settle() merges the tag verdict with any name floor.
   ============================================================ */
const ACTIONS = {1:"SET ASIDE — PHOTOGRAPH BOTH TAGS", 2:"REVIEW PILE", 3:"BULK BIN"};

function settle(tagTier, tagReason, override){
  let tier = tagTier, reason = tagReason;
  if(!override && cur.floor && cur.floor < tagTier){
    tier = cur.floor;
    reason = `${cur.name} variant confirmed — held at Tier ${cur.floor}. Tag check said: ${tagReason.toLowerCase()}.`;
  } else if(cur.floor && cur.floor >= tagTier && tagTier < 3){
    reason = `${tagReason}. Name also flagged (Tier ${cur.floor} candidate).`;
  }
  cur.tier = tier; cur.reason = reason;
  if(tier === 3 && !cur.watch){ commit(); return; }   // fast path, no confirmation screen
  go("result");
}

function screenResult(){
  const t = cur.tier;
  SORT.innerHTML =
    `<div class="verdict t${t}">
       <div class="tier">TIER ${t}${cur.hold?" · KEEP":""}</div>
       <div class="action">${ACTIONS[t]}</div>
       <p class="why2">${esc(cur.reason)}</p>
     </div>
     ${cur.watch && cur.watch.hyped ? `<div class="myth"><b>REALITY CHECK</b>${esc(cur.watch.note)}</div>` : ""}
     ${t === 3 ? "" : compLinkHTML(cur.name)}
     <label class="fl" for="nm">NAME ON TAG</label>
     <input class="fieldin" id="nm" value="${esc(cur.name)}" placeholder="e.g. Peanut" autocomplete="off">
     <label class="fl" for="nt">NOTES</label>
     <textarea class="fieldin" id="nt" placeholder="Condition, tag damage, anything odd"></textarea>
     <label class="toggle"><input type="checkbox" id="hold"><span>Keep — sentimental, not for sale</span></label>
     <button class="primary" id="log">Log and next</button>`;

  /* The name is still editable on this screen, so the link would go
     stale the moment the operator corrects a spelling. Keep it in sync. */
  const compEl = SORT.querySelector(".comp-link");
  if(compEl){
    document.getElementById("nm").addEventListener("input", e=>{
      compEl.href = buildCompUrl(e.target.value.trim());
    });
  }

  document.getElementById("log").onclick = ()=>{
    cur.name = document.getElementById("nm").value.trim();
    cur.note = document.getElementById("nt").value.trim();
    cur.hold = document.getElementById("hold").checked;
    commit();
  };
}

function commit(){
  state.records.push({
    seq: state.records.length + 1,
    ts: new Date().toISOString(),
    name: cur.name || "(unnamed)",
    tier: cur.tier, hold: cur.hold, reason: cur.reason,
    watch: cur.watch ? cur.watch.n : "", floor: cur.floor || "",
    hang_tag: cur.hang_tag, poem: cur.poem, thin_ty: cur.thin_ty,
    pellets: cur.pellets, mismatch: cur.mismatch,
    verify: cur.tier === 3 ? "n/a" : "pending",
    note: cur.note
  });
  save();
  toast(`#${state.records.length} → ${cur.hold ? "KEEP" : ACTIONS[cur.tier].split(" —")[0]}`);
  startItem();
}

let toastT;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove("show"), 1500);
}

document.getElementById("undo").onclick = ()=>{
  const r = state.records.pop();
  if(!r) return;
  save(); toast(`Removed #${r.seq} (${r.name})`); startItem(); renderReview();
};

function counts(){
  const r = state.records;
  document.getElementById("n1").textContent = r.filter(x=>x.tier===1 && !x.hold).length;
  document.getElementById("n2").textContent = r.filter(x=>x.tier===2 && !x.hold).length;
  document.getElementById("n3").textContent = r.filter(x=>x.tier===3 && !x.hold).length;
  document.getElementById("nh").textContent = r.filter(x=>x.hold).length;
}

document.addEventListener("keydown", e=>{
  if(/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  const i = parseInt(e.key,10) - 1;
  if(keymap[i]){ e.preventDefault(); keymap[i](); }
  if(e.key.toLowerCase() === "u") document.getElementById("undo").click();
});

/* ============================================================
   5. REVIEW
   ============================================================ */
function renderReview(){
  const keep = state.records.filter(r => r.tier !== 3 || r.hold);
  const el = document.getElementById("view-review");
  if(!keep.length){
    el.innerHTML = `<h3 class="sec">FLAGGED ITEMS</h3>
      <div class="panel g"><p>Nothing flagged yet. Items you set aside collect here with the reason they were flagged.</p></div>`;
    return;
  }
  el.innerHTML = `<h3 class="sec">FLAGGED ITEMS — ${keep.length}</h3>` + keep.slice().reverse().map(r=>
    `<div class="rec g ${r.hold?"hold":"t"+r.tier}" data-seq="${r.seq}">
       <div class="rec-h"><b>${esc(r.name)}</b><span class="n">#${r.seq} · ${r.hold?"KEEP":"TIER "+r.tier}</span></div>
       <p>${esc(r.reason)}${r.note?" — "+esc(r.note):""}</p>
       <div class="rec-a">
         ${r.hold?"":`<button class="chip ${r.verify==="verified"?"on":""}" data-v="verified">Comps checked</button>
         <button class="chip ${r.verify==="rejected"?"on":""}" data-v="rejected">Not worth it</button>`}
         <button class="chip del" data-del="1">Delete</button>
       </div>
       ${r.hold ? "" : compLinkHTML(r.name)}
     </div>`).join("");

  el.querySelectorAll(".rec").forEach(card=>{
    const seq = +card.dataset.seq, rec = state.records.find(x=>x.seq===seq);
    card.querySelectorAll("[data-v]").forEach(b=>{
      b.onclick = ()=>{ rec.verify = rec.verify === b.dataset.v ? "pending" : b.dataset.v; save(); renderReview(); };
    });
    card.querySelector("[data-del]").onclick = ()=>{
      state.records = state.records.filter(x=>x.seq!==seq); save(); renderReview(); counts();
    };
  });
}
function esc(s){ return String(s===null||s===undefined?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

/* ============================================================
   5b. SOLD-COMP DEEP LINK
   No API, no key, no network call from this app. We only build a
   URL string; nothing is requested until the operator taps it and
   the browser leaves the page. Offline behaviour is unchanged.

   `variant` is accepted but currently always empty — see note below.
   ============================================================ */
function buildCompUrl(name, variant){
  const terms = ["ty beanie", name || ""];
  if(variant) terms.push(variant);
  const params = new URLSearchParams({
    _nkw: terms.join(" ").replace(/\s+/g," ").trim(),
    LH_Sold: "1",       // sold only
    LH_Complete: "1",   // completed only
    _sop: "13"          // ended most recently; blank for Best Match
  });
  return "https://www.ebay.com/sch/i.html?" + params.toString();
}

/* URLSearchParams percent-encodes everything, so the result is safe
   inside a double-quoted href with no further escaping. */
function compLinkHTML(name, variant){
  return `<a class="comp-link" target="_blank" rel="noopener noreferrer" href="${buildCompUrl(name, variant)}">Check sold prices &rarr;</a>
     <p class="comp-note">Median of 5+ sales. Ignore Best Offer Accepted &mdash; the shown price is not what it sold for.</p>`;
}

/* ============================================================
   6. GUIDE
   ============================================================ */
document.getElementById("view-guide").innerHTML = `
<h3 class="sec">WHAT THIS TOOL DOES NOT DO</h3>
<div class="panel g">
  <p>It never tells you what something is worth. Online price guides quote <em>asking</em> prices, which is why the same bear appears at both $6 and $6,000. This tool tells you which few items are worth researching — you establish the price yourself, from completed sales.</p>
</div>

<h3 class="sec">WHAT THE NAME LIST MEANS</h3>
<div class="panel g">
  <p>Fifty names where the <em>name itself</em> changes the answer. Landing on the list is neither good nor bad — it means one extra question, nothing more.</p>
  <ul style="margin-top:11px">
    <li><strong>Could be rare</strong> — one physical feature separates a real find from a common one. Royal blue or periwinkle? Brownie or Cubbie?</li>
    <li><strong>Usually a myth</strong> — Princess, Millennium, Mystic and friends are on the list <em>because</em> they're hyped. One tap gives you a definitive no instead of a bear set aside for nothing.</li>
  </ul>
  <p style="margin-top:11px"><strong>Not being on the list does not mean worthless.</strong> The tag questions run on every item regardless of name — an unfamiliar bear with a no-poem, thin-<em>ty</em>, PVC tag still lands in Tier 1. The list is a supplement. The tags are the detector.</p>
</div>

<h3 class="sec">READING THE HEART TAG</h3>
<div class="panel g">
  <dl class="gen">
    <dt>1st gen</dt><dd>Single-sided heart, skinny <em>ty</em>. No poem, no birthday. 1993–94.</dd>
    <dt>2nd gen</dt><dd>Folds open. Still skinny <em>ty</em>. No poem. 1994–95.</dd>
    <dt>3rd gen</dt><dd>Puffy, bubbly <em>ty</em>. Still no poem. 1995–96.</dd>
    <dt>4th gen</dt><dd>Yellow star on the front, poem and birthday inside. 1996–97.</dd>
    <dt>5th +</dt><dd>Same star layout, different fonts. 1998 onward.</dd>
  </dl>
  <p style="margin-top:13px"><strong>If it has a poem, it is 4th generation or later.</strong> That covers the peak years, when production ran into the tens of millions.</p>
</div>

<h3 class="sec">CHECKING REAL PRICES</h3>
<div class="panel g">
  <ul>
    <li>Search the exact name on eBay, then filter to <strong>Sold items</strong>. Active listings are fiction.</li>
    <li><strong>Discard anything marked “Best Offer Accepted.”</strong> It shows the asking price, not what was paid.</li>
    <li>Take the <strong>median of at least five</strong> sales. Nine sales at $6 and one at $400 means you have a $6 bear.</li>
    <li>Subtract fees (~13%) and postage before deciding it is worth listing.</li>
    <li>Wash sales between colluding accounts are documented in this category. Treat any four-figure result with suspicion.</li>
  </ul>
</div>

<h3 class="sec">BEFORE SELLING ANYTHING ABOVE ~$200</h3>
<div class="panel g">
  <p>Send it to a third-party authenticator. Counterfeit tags exist, and serious buyers pay a premium for a graded, sealed piece — but only where the fee is a small fraction of the sale.</p>
</div>

<h3 class="sec">THE ${WATCHLIST.length} NAMES AND THEIR QUESTIONS</h3>
<div class="panel g"><ul>${WATCHLIST.map(w=>`<li><strong>${esc(w.n)}</strong> — ${esc(w.q)}</li>`).join("")}</ul></div>`;

/* ============================================================
   7. DATA
   ============================================================ */
function renderData(){
  document.getElementById("view-data").innerHTML = `
    <h3 class="sec">SESSION</h3>
    <div class="panel g"><p><strong>${state.records.length}</strong> items logged since ${new Date(state.started).toLocaleDateString()}.
      ${storageOK ? "Saved automatically in this browser." : "<strong>Not being saved — export before you close this tab.</strong>"}</p></div>
    <h3 class="sec">EXPORT</h3>
    <div class="btnrow"><button class="ghost" id="csv">Download CSV</button><button class="ghost" id="json">Download JSON</button></div>
    <h3 class="sec">DANGER</h3>
    <div class="btnrow"><button class="ghost" id="wipe">Erase this session</button></div>`;
  document.getElementById("csv").onclick = ()=> dl("sift-inventory.csv","text/csv",toCSV());
  document.getElementById("json").onclick = ()=> dl("sift-inventory.json","application/json",JSON.stringify(state,null,2));
  document.getElementById("wipe").onclick = ()=>{
    if(!confirm("Erase all "+state.records.length+" records? This cannot be undone.")) return;
    state = blank(); save(); startItem(); renderReview(); renderData();
  };
}
function toCSV(){
  const cols = ["seq","ts","name","tier","hold","reason","watch","floor","hang_tag","poem","thin_ty","pellets","mismatch","verify","note"];
  const q = v => `"${String(v===null||v===undefined?"":v).replace(/"/g,'""')}"`;
  return [cols.join(",")].concat(state.records.map(r=>cols.map(c=>q(r[c])).join(","))).join("\r\n");
}
function dl(name, mime, data){
  const b = new Blob([data], {type:mime+";charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
}

/* ============================================================
   8. TABS + BOOT
   ============================================================ */
["sort","review","guide","data"].forEach((t,_,all)=>{
  document.getElementById("tab-"+t).onclick = ()=>{
    all.forEach(x=>{
      document.getElementById("tab-"+x).setAttribute("aria-selected", String(x===t));
      document.getElementById("view-"+x).hidden = (x!==t);
    });
    if(t==="review") renderReview();
    if(t==="data") renderData();
    window.scrollTo(0,0);
  };
});

function heart(weight){
  const w = weight === "thin" ? 1.4 : 5.5, fs = weight === "thin" ? 26 : 30;
  return `<svg viewBox="0 0 100 70" aria-hidden="true">
    <path d="M50 66 C20 46 8 34 8 23 A15 15 0 0 1 50 15 A15 15 0 0 1 92 23 C92 34 80 46 50 66 Z"
      fill="rgba(255,59,78,.22)" stroke="#FF6B7A" stroke-width="2.5"/>
    <text x="50" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="${fs}"
      fill="none" stroke="#FFFFFF" stroke-width="${w}" stroke-linejoin="round">ty</text>
  </svg>`;
}

startItem();
renderReview();

/* ============================================================
   9. OFFLINE
   Registered only over http(s) — service workers are unavailable
   on file://, where the app still runs, just without caching.
   Relative path keeps the scope correct under /repo-name/ on Pages.
   ============================================================ */
if (location.protocol.startsWith("http") && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
