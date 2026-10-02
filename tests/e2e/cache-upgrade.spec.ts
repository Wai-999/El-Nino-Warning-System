import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

// A prior release with a still-fresh HTTP cache reproduces the production bug.
// The new release uses the real built service worker and all real assets.
test("new shell replaces HTTP-cached HTML and retains the previous shell's lazy assets", async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Same service-worker lifecycle in every viewport",
  );
  const prefix = "/El-Nino-Warning-System/";
  let upgraded = false;
  const requested: string[] = [];
  const legacy = {
    "index.html":
      '<!doctype html><html><body><h1>Previous release</h1><script src="./legacy.js"></script></body></html>',
    "legacy.js": 'navigator.serviceWorker.register("./sw.js");',
    "sw.js": `const CACHE='mokinn-previous';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./legacy.js'])).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`,
  };
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".webmanifest": "application/manifest+json",
    ".png": "image/png",
  };
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url!, "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const name = pathname.slice(prefix.length) || "index.html";
    try {
      const body = upgraded
        ? await readFile(path.join("dist", name))
        : legacy[name as keyof typeof legacy];
      if (!body) throw Error("No prior asset");
      if (upgraded) requested.push(name);
      res.writeHead(200, {
        "Content-Type": types[path.extname(name)] || "application/octet-stream",
        "Cache-Control": name === "sw.js" ? "no-cache" : "public, max-age=600",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw Error("Missing test server address");
  const base = `http://127.0.0.1:${address.port}${prefix}`;
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(base);
    await expect(page.locator("h1")).toHaveText("Previous release");
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    // Also check that obsolete caches are pruned while the immediate prior one survives.
    await page.evaluate(async () => {
      await caches.open("mokinn-obsolete");
      await caches.delete("mokinn-previous");
      const c = await caches.open("mokinn-previous");
      await c.addAll(["./", "./index.html", "./legacy.js"]);
    });
    upgraded = true;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const changed = new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
      await registration!.update();
      await changed;
    });
    await page.reload();
    await expect(page.getByTestId("release-version")).toHaveText("v2.1.0");
    expect(requested).toContain("index.html");
    expect(
      await page.evaluate(
        async () => await (await fetch("./legacy.js")).text(),
      ),
    ).toBe(legacy["legacy.js"]);
    await expect.poll(() => page.evaluate(() => caches.keys())).toHaveLength(2);
    expect(await page.evaluate(() => caches.keys())).toContain(
      "mokinn-previous",
    );
    await page.getByRole("button", { name: "Switch to English" }).click();
    await expect(page.locator(".refresh-button")).toBeEnabled();
    await context.setOffline(true);
    for (const route of ["/", "/warnings", "/records", "/prepare"]) {
      await page.goto(base + "?release=2.1.0#" + route);
      await page.reload();
      await expect(page.getByTestId("release-version")).toHaveText("v2.1.0");
      await expect(page.locator(".offline-banner")).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  }
});
