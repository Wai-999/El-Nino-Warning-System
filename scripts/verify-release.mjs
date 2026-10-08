// Read-only checks against an existing preview or the real GitHub Pages deployment.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile, readFile } from "node:fs/promises";
import { snapshotSchema } from "../src/data/schema.ts";
import { validateOperational } from "../src/data/operational.ts";
import { validateArchive } from "../src/data/archive.ts";
const base =
  process.argv[2] || "https://wai-999.github.io/El-Nino-Warning-System/";
const expected = JSON.parse(await readFile("package.json", "utf8")).version;
const results = {
  base,
  version: expected,
  verifiedAt: new Date().toISOString(),
  routes: [],
  contentOwnership: [],
  viewports: [],
  console: [],
  failedRequests: [],
  httpErrors: [],
};
const assert = (ok, message) => {
  if (!ok) throw Error(message);
};
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => results.console.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") results.console.push(m.text());
  });
  page.on("requestfailed", (r) => results.failedRequests.push(r.url()));
  page.on("response", (r) => {
    if (r.status() >= 400)
      results.httpErrors.push({ url: r.url(), status: r.status() });
  });
  await page.addInitScript(() => localStorage.setItem("mokinn-language", "en"));
  const ready = async () => {
    await page.locator("h1").waitFor();
    await page.waitForFunction(
      () => !document.querySelector(".refresh-button")?.disabled,
    );
  };
  for (const route of [
    "/",
    "/warnings",
    "/records",
    "/map",
    "/region/MM-04",
    "/data",
    "/impacts",
    "/health",
    "/learn",
    "/prepare",
  ]) {
    await page.goto(base + "?release=" + expected + "#" + route);
    // Hash-only navigation preserves the resource timeline. Reload these routes
    // to measure their own initial requests rather than a previously visited map.
    if (["/health", "/learn"].includes(route)) await page.reload();
    await ready();
    if (route === "/map") await page.locator(".region-shape").first().waitFor();
    assert(
      (await page.getByTestId("release-version").innerText()) ===
        "v" + expected,
      "Wrong deployed release",
    );
    const content = { route, title: await page.locator("h1").innerText() };
    for (const [key, selector] of Object.entries({
      enso: ".enso-v2",
      coverage: ".data-quality",
      videos: ".video-card",
      health: ".health-topic",
      history: ".historical-record",
      map: ".region-shape",
      kpis: "[data-kpi]",
      seasonal: ".regional-context",
    }))
      content[key] = await page.locator(selector).count();
    assert(
      content.enso === (route === "/" ? 1 : 0),
      "ENSO primary home violated",
    );
    assert(
      content.coverage === (route === "/data" ? 1 : 0),
      "Coverage primary home violated",
    );
    assert(
      content.health === (route === "/health" ? 1 : 0),
      "Health primary home violated",
    );
    assert(
      content.videos === (route === "/learn" ? 2 : 0),
      "Video primary home violated",
    );
    results.contentOwnership.push(content);
    if (route === "/") {
      const resources = await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .map((r) => ({ url: r.name, bytes: r.encodedBodySize })),
      );
      assert(
        !resources.some(
          (r) =>
            r.url.includes("MyanmarMap") || r.url.includes("myanmar.geojson"),
        ),
        "Overview loaded map",
      );
      results.overviewResources = resources;
      results.changes = await page.locator(".changes-panel").innerText();
    }
    if (route === "/warnings")
      assert(
        (await page.locator(".warning-matrix tbody tr").count()) === 15,
        "Missing regional rows",
      );
    if (route === "/records")
      assert(
        (await page.locator(".historical-record").count()) === 2,
        "Missing sourced records",
      );
    if (route === "/map")
      assert(
        (await page.locator(".region-shape").count()) === 15,
        "Missing boundaries",
      );
    if (route === "/impacts") {
      assert(
        (await page.locator("h1").innerText()) ===
          "Potential impacts for Myanmar",
        "Impacts must default to Myanmar",
      );
      assert(
        (await page.locator("#impact-region").inputValue()) === "MM",
        "Invalid country default",
      );
      assert(
        (await page.locator(".enso-v2,.impact-history").count()) === 0,
        "Repeated major content on Impacts",
      );
      await page.locator("#impact-region").selectOption("MM-16");
      assert(
        (await page.locator("h1").innerText()).includes("Rakhine"),
        "Impacts selection failed",
      );
      assert(
        (await page.getByTestId("impact-forecast").count()) === 1,
        "Regional forecast missing",
      );
    }
    if (route === "/health") {
      assert(
        (await page.locator("#health-topic option").count()) === 9,
        "Required health topics missing",
      );
      assert(
        (await page.locator(".health-now").innerText()).includes(
          "Do not give drinks",
        ),
        "Unsafe swallowing safeguard missing",
      );
      for (const topic of [
        "dehydration",
        "cramps",
        "exhaustion",
        "heatstroke",
        "diarrhoea",
        "dengue",
        "malaria",
        "smoke",
        "food",
      ]) {
        await page.locator("#health-topic").selectOption(topic);
        assert(
          (await page.locator(".health-topic h3").count()) === 6,
          "Health triage sections missing",
        );
        assert(
          (await page.locator(".health-references a").count()) > 0,
          "Clinical references missing",
        );
      }
      await page.locator("#health-region").selectOption("MM-18");
      assert(
        (await page.locator(".surveillance").innerText()).includes(
          "does not establish zero cases",
        ),
        "Absent surveillance became zero",
      );
      results.healthSources = await page
        .locator(".health-references a")
        .evaluateAll((links) => links.map((a) => a.href));
    }
    if (route === "/learn") {
      assert(
        (await page.locator(".video-card").count()) === 2,
        "Video library missing",
      );
      assert(
        (await page.locator("iframe").count()) === 0,
        "Unexpected external video player",
      );
      results.videoLinks = await page
        .getByRole("link", { name: "Watch on YouTube", exact: false })
        .evaluateAll((links) => links.map((a) => a.href));
      assert(
        results.videoLinks.includes(
          "https://www.youtube.com/watch?v=2gZIJYf7y0c",
        ),
        "Verified candidate missing",
      );
    }
    if (["/health", "/learn"].includes(route)) {
      const urls = await page.evaluate(() =>
        performance.getEntriesByType("resource").map((r) => r.name),
      );
      assert(
        !urls.some((u) =>
          /MyanmarMap|myanmar.geojson|data\/archive.json|i.ytimg.com|youtube.com/.test(
            u,
          ),
        ),
        "Unexpected heavy or external request",
      );
    }
    results.routes.push({ route, title: await page.locator("h1").innerText() });
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/warnings",
      "/records",
      "/map",
      "/impacts",
      "/health",
      "/learn",
      "/data",
    ]) {
      await page.goto(base + "?release=" + expected + "#" + route);
      await ready();
      for (const lang of ["en", "my"]) {
        if ((await page.locator("html").getAttribute("lang")) !== lang)
          await page
            .getByRole("button", {
              name: lang === "en" ? "Switch to English" : "Switch to Burmese",
            })
            .click();
        await page.evaluate(() => document.fonts.ready);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `Overflow ${width} ${route} ${lang}`,
        );
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        assert(
          !axe.violations.length,
          `Accessibility ${width} ${route} ${lang}: ${axe.violations.map((v) => v.id)}`,
        );
        results.viewports.push({
          width,
          route,
          lang,
          overflow: false,
          violations: 0,
        });
      }
    }
  }
  const get = async (path) => {
    const response = await context.request.get(base + path);
    assert(response.ok(), `Data request ${path}`);
    return response.json();
  };
  const official = snapshotSchema.parse(await get("data/current.json")),
    op = validateOperational(await get("data/operational.json")),
    archive = validateArchive(await get("data/archive.json"));
  assert(
    (await get("release.json")).version === expected,
    "Release metadata mismatch",
  );
  results.data = {
    checkedAt: official.checkedAt,
    ensoIssuedAt: official.enso?.issuedAt,
    forecast: op.weather?.validAt,
    forecastRetrieved: op.weather?.fetchedAt,
    reanalysisPeriod: [op.history?.start, op.history?.end],
    weatherRegions: op.weather?.regions.length,
    reanalysisRegions: op.history?.regions.length,
    snapshots: archive.snapshots.length,
    sourceHealth: op.health,
  };
  await page.goto(base + "#/data");
  await ready();
  results.sourceLinks = await page
    .locator(".source-cards a")
    .evaluateAll((links) => links.map((a) => a.href));
  assert(results.sourceLinks.length === 8, "Source registry missing");
  await context.close();
  const offline = await browser.newContext({
    serviceWorkers: "allow",
    viewport: { width: 390, height: 844 },
  });
  const p = await offline.newPage();
  p.on("pageerror", (e) => results.console.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") results.console.push(m.text());
  });
  await p.goto(base + "?release=" + expected + "#/");
  await p.getByRole("button", { name: "Switch to English" }).click();
  await p.waitForFunction(
    () => !document.querySelector(".refresh-button")?.disabled,
  );
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  await offline.setOffline(true);
  await p.reload();
  for (const route of [
    "/",
    "/warnings",
    "/records",
    "/prepare",
    "/impacts",
    "/health",
    "/learn",
  ]) {
    await p.goto(base + "?release=" + expected + "#" + route);
    await p.locator("h1").waitFor();
    await p.locator(".offline-banner").waitFor();
    assert(
      (await p.getByTestId("release-version").innerText()) === "v" + expected,
      "Wrong offline release",
    );
  }
  results.offline = "passed";
  await offline.close();
  assert(!results.console.length, "Console errors");
  assert(!results.failedRequests.length, "Failed requests");
  assert(!results.httpErrors.length, "HTTP asset errors");
  results.status = "passed";
  if (process.argv[3])
    await writeFile(process.argv[3], JSON.stringify(results, null, 2) + "\n");
  console.log(
    JSON.stringify({
      status: results.status,
      version: expected,
      routes: results.routes.length,
      viewportLanguageChecks: results.viewports.length,
      offline: results.offline,
      snapshots: results.data.snapshots,
      consoleErrors: results.console.length,
      httpErrors: results.httpErrors.length,
    }),
  );
} catch (error) {
  results.status = "failed";
  results.error = String(error);
  if (process.argv[3])
    await writeFile(process.argv[3], JSON.stringify(results, null, 2) + "\n");
  throw error;
} finally {
  await browser.close();
}
