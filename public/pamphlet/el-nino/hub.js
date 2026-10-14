// DUSU El Niño digital leaflet — progressive enhancement only: the page is fully readable without this script.
// Adds: source search/filter, online/offline status, and an explicit, verified "Save for offline" copy that lives in
// IndexedDB (read by sw.js). Nothing is downloaded for offline use unless the reader asks for it.
const DB_NAME = "dusu-elnino-pamphlet";
const DB_VERSION = 1;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const MYD = (v) => String(v).replace(/\d/g, (d) => "၀၁၂၃၄၅၆၇၈၉"[Number(d)]);
const BUILD = document.body.dataset.build;
const ui = {
  save: $("#save-offline"),
  update: $("#update-offline"),
  remove: $("#remove-offline"),
  status: $("#off-status"),
  bar: $("#off-progress"),
  net: $("#netbar"),
};

// ---------- small IndexedDB helpers ----------
function openDb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}
const done = (r) =>
  new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
const committed = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("transaction aborted"));
  });
async function sha256(buf) {
  const h = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function readMeta() {
  try {
    const db = await openDb();
    const m = await done(db.transaction("meta").objectStore("meta").get("current"));
    db.close();
    return m || null;
  } catch {
    return null;
  }
}

// ---------- status text ----------
const MONTHS = ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"];
// Burmese date + 24 h local time, independent of the browser's locale data
const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return MYD(`${d.getDate()} `) + MONTHS[d.getMonth()] + MYD(` ${d.getFullYear()}၊ ${hh}:${mm}`);
};
const kb = (n) => MYD(Math.round(n / 1024));
function say(text, kind = "") {
  ui.status.textContent = text;
  ui.status.className = "off-status " + kind;
}
function showSaved(meta) {
  ui.save.classList.add("is-saved");
  ui.remove.hidden = false;
  say(`သိမ်းပြီးပါပြီ — ${fmtDate(meta.savedAt)} (${kb(meta.totalBytes)} KB၊ ဖိုင် ${MYD(meta.count)} ခု)။ ဤဖုန်း/ဘရောက်ဇာတွင် အင်တာနက်မရှိဘဲ ဖတ်နိုင်သည်။`, "ok");
}

// ---------- network indicator ----------
let savedMeta = null;
function renderNet(online) {
  if (online) {
    ui.net.hidden = true;
    return;
  }
  ui.net.hidden = false;
  ui.net.className = "netbar warn";
  ui.net.textContent = savedMeta
    ? `အော့ဖ်လိုင်း — အင်တာနက် မရှိပါ။ ${fmtDate(savedMeta.savedAt)} က သိမ်းထားသော မိတ္တူကို ပြသနေသည်။ Facebook နှင့် ရင်းမြစ် လင့်ခ်များ အင်တာနက် လိုသည်။`
    : "အော့ဖ်လိုင်း — အင်တာနက် မရှိပါ။ ဤစာမျက်နှာကို အော့ဖ်လိုင်း မသိမ်းရသေးပါ။";
}
addEventListener("online", () => renderNet(true));
addEventListener("offline", () => renderNet(false));

async function fetchVersion() {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch("version.json", { cache: "no-store", signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

// ---------- save / update / remove ----------
let busy = false;
async function saveOffline() {
  if (busy) return;
  busy = true;
  ui.save.disabled = ui.update.disabled = ui.remove.disabled = true;
  ui.bar.hidden = false;
  ui.bar.value = 0;
  const previous = await readMeta();
  try {
    say("ပြင်ဆင်နေသည်…");
    const reg = await navigator.serviceWorker.register("sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    const v = await fetchVersion();
    if (navigator.storage && navigator.storage.estimate) {
      const { quota = 0, usage = 0 } = await navigator.storage.estimate();
      if (quota && quota - usage < v.total_bytes * 1.3) throw new Error("ဖုန်း၏ သိုလှောင်ခန်း မလုံလောက်ပါ");
    }
    // 1) download every file, checking size + SHA-256 against version.json
    const got = [];
    let bytes = 0;
    for (const f of v.files) {
      const r = await fetch(f.path, { cache: "no-store" });
      if (!r.ok) throw new Error(`${f.path} — HTTP ${r.status}`);
      const body = await r.arrayBuffer();
      if (body.byteLength !== f.bytes || (await sha256(body)) !== f.sha256) throw new Error(`${f.path} — ဖိုင် မကိုက်ညီပါ (ဗားရှင်းအသစ် တင်နေဆဲ ဖြစ်နိုင်သည်)`);
      got.push({ ...f, body });
      bytes += f.bytes;
      ui.bar.value = Math.round((bytes / v.total_bytes) * 90);
      say(`ဒေါင်းလုဒ် ${MYD(Math.round((bytes / v.total_bytes) * 100))}% (${kb(bytes)} / ${kb(v.total_bytes)} KB)`);
    }
    // 2) one atomic transaction: either the whole new copy replaces the old one, or nothing changes
    const meta = { edition: v.edition, build: v.build, savedAt: new Date().toISOString(), totalBytes: v.total_bytes, count: got.length, paths: got.map((f) => f.path) };
    const db = await openDb();
    const tx = db.transaction(["files", "meta"], "readwrite");
    tx.objectStore("files").clear();
    for (const f of got) tx.objectStore("files").put({ body: f.body, type: f.type, sha256: f.sha256, bytes: f.bytes }, f.path);
    tx.objectStore("meta").put(meta, "current");
    await committed(tx);
    // 3) read back and re-hash what was stored
    say("သိမ်းထားသည်ကို ပြန်စစ်နေသည်…");
    const rtx = db.transaction(["files", "meta"]);
    for (const f of got) {
      const rec = await done(rtx.objectStore("files").get(f.path));
      if (!rec || rec.bytes !== f.bytes || (await sha256(rec.body)) !== f.sha256) throw new Error(`${f.path} — သိမ်းဆည်းမှု မပြည့်စုံပါ`);
    }
    db.close();
    ui.bar.value = 95;
    // 4) prove the service worker can serve the saved copy without the network
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true });
        setTimeout(resolve, 5000);
      });
    }
    if (!navigator.serviceWorker.controller) {
      reg.update();
      ui.bar.value = 100;
      say("သိမ်းပြီးပါပြီ — သို့သော် အော့ဖ်လိုင်း ဖတ်ရှုမှု စတင်ရန် အင်တာနက်ရှိစဉ် ဤစာမျက်နှာကို တစ်ကြိမ် ပြန်ဖွင့် (reload) ပါ။", "err");
      savedMeta = meta;
      ui.remove.hidden = false;
      return;
    }
    for (const path of ["index.html", v.files.find((f) => f.path.startsWith("pdf/")).path]) {
      const want = got.find((f) => f.path === path);
      const r = await fetch(path === "index.html" ? "./?offline-selftest=" + Date.now() : path, { cache: "no-store", headers: { "X-Pamphlet-Offline-Test": "1" } });
      if (!r.ok || r.headers.get("X-Pamphlet-Offline") !== "1" || (await sha256(await r.arrayBuffer())) !== want.sha256) throw new Error("အော့ဖ်လိုင်း စမ်းသပ်မှု မအောင်မြင်ပါ");
    }
    ui.bar.value = 100;
    let persisted = false;
    try {
      persisted = navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false;
    } catch {
      persisted = false;
    }
    savedMeta = meta;
    showSaved(meta);
    if (!persisted) ui.status.textContent += " (ဖုန်းသိုလှောင်ခန်း ပြည့်လျှင် ဘရောက်ဇာက ဖျက်နိုင်သည်)";
    ui.update.hidden = true;
  } catch (err) {
    say(`မသိမ်းနိုင်ပါ — ${err && err.message ? err.message : err}။ ${previous ? "ယခင် သိမ်းထားသော မိတ္တူ မပြောင်းလဲပါ။" : "အင်တာနက် ချိတ်ဆက်ပြီး ထပ်ကြိုးစားပါ (သို့) PDF ကို ဒေါင်းလုဒ်လုပ်ပါ။"}`, "err");
    savedMeta = await readMeta();
    if (savedMeta) ui.remove.hidden = false;
  } finally {
    busy = false;
    ui.save.disabled = ui.update.disabled = ui.remove.disabled = false;
    setTimeout(() => (ui.bar.hidden = true), 1200);
  }
}

let confirmRemove = 0;
async function removeOffline() {
  if (Date.now() - confirmRemove > 5000) {
    confirmRemove = Date.now();
    ui.remove.textContent = "ဖျက်ရန် သေချာပါက ထပ်နှိပ်ပါ";
    return;
  }
  confirmRemove = 0;
  ui.remove.textContent = "အော့ဖ်လိုင်း မိတ္တူ ဖျက်မည်";
  try {
    const db = await openDb();
    const tx = db.transaction(["files", "meta"], "readwrite");
    tx.objectStore("files").clear();
    tx.objectStore("meta").clear();
    await committed(tx);
    db.close();
    savedMeta = null;
    ui.remove.hidden = ui.update.hidden = true;
    ui.save.classList.remove("is-saved");
    say("အော့ဖ်လိုင်း မိတ္တူကို ဖျက်ပြီးပါပြီ။");
  } catch (err) {
    say("ဖျက်၍ မရပါ — " + (err && err.message ? err.message : err), "err");
  }
}

async function initOffline() {
  const supported = "serviceWorker" in navigator && "indexedDB" in window && window.isSecureContext && crypto && crypto.subtle;
  if (!supported) {
    say("ဤဘရောက်ဇာတွင် အော့ဖ်လိုင်း သိမ်းခြင်း မရနိုင်ပါ — PDF (သို့) offline-pamphlet.zip ကို ဒေါင်းလုဒ်လုပ်ပါ။", "err");
    return;
  }
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {
    say("Service worker မဖွင့်နိုင်ပါ (private mode ဖြစ်နိုင်သည်) — PDF ကို ဒေါင်းလုဒ်လုပ်ပါ။", "err");
  });
  ui.save.disabled = false;
  ui.save.addEventListener("click", saveOffline);
  ui.update.addEventListener("click", saveOffline);
  ui.remove.addEventListener("click", removeOffline);
  savedMeta = await readMeta();
  if (savedMeta) showSaved(savedMeta);
  else say("မသိမ်းရသေးပါ။ အင်တာနက်ရှိစဉ် “အော့ဖ်လိုင်း သိမ်းမည်” ကို နှိပ်ပါ။");
  renderNet(navigator.onLine);
  try {
    const v = await fetchVersion();
    ui.save.dataset.bytes = v.total_bytes;
    if (!savedMeta) say(`မသိမ်းရသေးပါ။ အင်တာနက်ရှိစဉ် “အော့ဖ်လိုင်း သိမ်းမည်” ကို နှိပ်ပါ (${kb(v.total_bytes)} KB)။`);
    if (savedMeta && savedMeta.build !== v.build) {
      ui.update.hidden = false;
      say(`ဗားရှင်းအသစ် ရှိသည် — သင့်မိတ္တူ (${fmtDate(savedMeta.savedAt)}) သည် အဟောင်း ဖြစ်သည်။ “အော့ဖ်လိုင်း မိတ္တူကို အသစ်ပြောင်းမည်” ကို နှိပ်ပါ။`, "err");
    }
    if (v.build !== BUILD) {
      ui.net.hidden = false;
      ui.net.className = "netbar ok";
      ui.net.textContent = "ဤစာမျက်နှာ၏ ဗားရှင်းအသစ် ရှိသည် — စာမျက်နှာကို ပြန်ဖွင့် (reload) ပါ။";
    }
  } catch {
    renderNet(false);
  }
}

// ---------- source library: search + category filter ----------
function initFilter() {
  const q = $("#q");
  const chips = $$(".chip-btn");
  const items = $$(".src");
  const groups = $$(".sgroup");
  const count = $("#src-count");
  let cat = "all";
  const apply = () => {
    const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    for (const li of items) {
      const ok = (cat === "all" || li.dataset.cat === cat) && terms.every((t) => li.dataset.text.includes(t));
      li.hidden = !ok;
      n += ok;
    }
    for (const g of groups) g.hidden = !g.querySelector(".src:not([hidden])");
    count.textContent = `ရင်းမြစ် ${MYD(n)} ခု ပြသနေသည် (စုစုပေါင်း ${MYD(items.length)})`;
  };
  q.disabled = false;
  q.addEventListener("input", apply);
  for (const c of chips)
    c.addEventListener("click", () => {
      cat = c.dataset.cat;
      for (const o of chips) o.setAttribute("aria-pressed", String(o === c));
      apply();
    });
  apply();
}

// highlight the cited sentence when arriving from the claim map
function initClaimHighlight() {
  for (const a of $$('.claims a[href^="#c-"]'))
    a.addEventListener("click", () => {
      const el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      el.classList.add("hl");
      setTimeout(() => el.classList.remove("hl"), 4000);
    });
}

initFilter();
initClaimHighlight();
initOffline();
