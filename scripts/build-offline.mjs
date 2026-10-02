import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
await writeFile(
  "dist/release.json",
  JSON.stringify({ version: pkg.version }) + "\n",
);
const html = await readFile("dist/index.html", "utf8");
await writeFile(
  "dist/index.html",
  html.replace(
    "<head>",
    `<head><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">`,
  ),
);
async function files(dir) {
  const results = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...(await files(p)));
    else results.push(p);
  }
  return results;
}
const paths = (await files("dist")).filter((p) => !p.endsWith("/sw.js"));
const hash = createHash("sha256");
for (const p of paths) hash.update(await readFile(p));
const version = hash.digest("hex").slice(0, 12);
const urls = paths
  .filter((p) => !p.endsWith("myanmar.geojson"))
  .map((p) => "./" + path.relative("dist", p));
await writeFile(
  "dist/sw.js",
  `const CACHE='mokinn-${version}';
const SHELL=${JSON.stringify(["./", ...urls])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mokinn-')&&k!==CACHE).slice(0,-1).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if((url.pathname.endsWith('/data/current.json')||url.pathname.endsWith('/data/operational.json')||url.pathname.endsWith('/data/archive.json'))){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(!response.ok)throw Error('Unavailable');await cache.put(req,response.clone());return response;}catch{const cached=await cache.match(req,{ignoreVary:true});if(!cached)return Response.error();const headers=new Headers(cached.headers);headers.set('X-Mokinn-Cache','true');return new Response(await cached.arrayBuffer(),{status:200,headers});}})());return;
 }
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=req.mode==='navigate'?await cache.match('./index.html'):(await cache.match(req,{ignoreVary:true}))||(await caches.match(req,{ignoreVary:true}));if(saved)return saved;try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response;}catch{if(req.mode==='navigate')return (await cache.match('./index.html'))||Response.error();return Response.error();}})());
});\n`,
);
console.log(
  `Offline shell ${version}: ${urls.length} local resources, ${(await Promise.all(paths.map(async (p) => (await readFile(p)).length))).reduce((a, b) => a + b, 0)} bytes.`,
);
