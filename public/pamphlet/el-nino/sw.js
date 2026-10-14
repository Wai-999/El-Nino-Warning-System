// Offline reader for the DUSU El Niño leaflet (scope: /El-Nino-Warning-System/pamphlet/el-nino/).
// - Network first. Only files the reader explicitly saved ("Save for offline", stored in IndexedDB by hub.js)
//   are ever served without the network; nothing is cached implicitly.
// - Never touches Cache Storage, so it cannot interfere with other sites on this origin (and their cache
//   clean-up cannot delete this copy). Third-party pages (Facebook, source sites) are never intercepted.
const DB_NAME = "dusu-elnino-pamphlet";
const DB_VERSION = 1;
const NAV_TIMEOUT_MS = 4000;
const SCOPE_PATH = new URL(self.registration.scope).pathname;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

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
  });
}
const done = (r) =>
  new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

async function lookup(path) {
  const db = await openDb();
  try {
    const tx = db.transaction(["files", "meta"]);
    const meta = await done(tx.objectStore("meta").get("current"));
    if (!meta) return null;
    const rec = await done(tx.objectStore("files").get(path));
    return rec ? { rec, meta } : null;
  } finally {
    db.close();
  }
}

function fromSaved(hit) {
  return new Response(hit.rec.body, {
    status: 200,
    headers: { "Content-Type": hit.rec.type, "X-Pamphlet-Offline": "1", "X-Pamphlet-Saved-At": hit.meta.savedAt },
  });
}

function relPath(url) {
  let p = decodeURIComponent(url.pathname.slice(SCOPE_PATH.length));
  if (p === "" || p.endsWith("/")) p += "index.html";
  return p;
}

const FALLBACK = `<!doctype html><html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>အော့ဖ်လိုင်း — El Niño leaflet</title></head><body style="font-family:'Noto Sans Myanmar',system-ui,sans-serif;max-width:34rem;margin:2rem auto;padding:0 1rem;line-height:1.8;color:#1d1b1a">
<h1 style="color:#a3101a;font-size:1.4rem">အင်တာနက် မရှိပါ</h1>
<p>ဤဖုန်း/ဘရောက်ဇာတွင် လက်ကမ်းစာစောင်ကို အော့ဖ်လိုင်း မသိမ်းရသေးပါ (သို့) သိမ်းထားသော မိတ္တူကို ဘရောက်ဇာက ဖျက်လိုက်ပြီ ဖြစ်သည်။</p>
<p>အင်တာနက် ချိတ်ဆက်ပြီး ပြန်ဖွင့်ပါ၊ ထို့နောက် “အော့ဖ်လိုင်း သိမ်းမည်” ကို နှိပ်ပါ။</p>
<p lang="en" style="color:#4f4945">You are offline and no saved copy of the El Niño leaflet is available in this browser. Reconnect, reload, then tap “Save for offline”.</p>
<p><a href="./">ပြန်ကြိုးစားရန် / Retry</a></p></body></html>`;

async function networkFirst(request, path) {
  const saved = lookup(path).catch(() => null);
  const net = fetch(request);
  net.catch(() => {});
  if (request.mode === "navigate") {
    try {
      const timer = new Promise((resolve) => setTimeout(() => resolve("timeout"), NAV_TIMEOUT_MS));
      const first = await Promise.race([net, timer]);
      if (first !== "timeout") return first;
      const hit = await saved;
      return hit ? fromSaved(hit) : await net;
    } catch {
      const hit = await saved;
      return hit ? fromSaved(hit) : new Response(FALLBACK, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
  }
  try {
    return await net;
  } catch {
    const hit = await saved;
    return hit ? fromSaved(hit) : Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;
  const path = request.mode === "navigate" ? "index.html" : relPath(url);
  if (path === "sw.js" || path === "version.json") return;
  if (request.headers.get("X-Pamphlet-Offline-Test") === "1") {
    // self-test used by "Save for offline": answer strictly from the saved copy, never from the network
    event.respondWith(lookup(relPath(url)).then((hit) => (hit ? fromSaved(hit) : new Response("not saved", { status: 504 }))));
    return;
  }
  event.respondWith(networkFirst(request, path));
});
