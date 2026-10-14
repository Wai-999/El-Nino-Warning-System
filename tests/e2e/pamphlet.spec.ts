import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

// The printed leaflet carries ONE QR code that points at pamphlet/el-nino/. These checks keep that URL working:
// the app's service worker must not precache or intercept the hub, and the hub must load with its full content.
const HUB = "./pamphlet/el-nino/";

test("app service worker neither precaches nor intercepts the pamphlet hub", async () => {
  const sw = await readFile("dist/sw.js", "utf8");
  const shell = JSON.parse(sw.match(/const SHELL=(\[.*?\]);/)![1]) as string[];
  expect(shell.filter((u) => u.includes("pamphlet/"))).toEqual([]);
  expect(sw).toContain("self.registration.scope+'pamphlet/'");
  const version = JSON.parse(
    await readFile("dist/pamphlet/el-nino/version.json", "utf8"),
  ) as { canonical: string; files: { path: string }[] };
  expect(version.canonical).toBe(
    "https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/",
  );
  expect(version.files.map((f) => f.path)).toContain("index.html");
});

test.describe("with the app's service worker installed", () => {
  test.use({ serviceWorkers: "allow" });
  test("the QR URL still opens the complete hub", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    await page.goto(HUB);
    await expect(page.locator("h1")).toContainText("အယ်လ်နီညို");
    await expect(page.locator("section.panel")).toHaveCount(4);
    const facebook = await page
      .locator(".fbcard")
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
    expect(facebook).toEqual([
      "https://www.facebook.com/GiHmanHAICT",
      "https://www.facebook.com/DaweiUniSU",
    ]);
    const href = await page
      .locator('a[download][href$=".pdf"]')
      .getAttribute("href");
    const pdf = await page.request.get(HUB + href);
    expect(pdf.status()).toBe(200);
    expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  });
});
