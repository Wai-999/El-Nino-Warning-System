// Read-only deployment verification. Optional first argument targets a local preview.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
const base =
  process.argv[2] || "https://wai-999.github.io/El-Nino-Warning-System/";
const browser = await chromium.launch();
const results = {
  base,
  verifiedAt: new Date().toISOString(),
  routes: [],
  viewports: [],
  resources: [],
  console: [],
  failedRequests: [],
  httpErrors: [],
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
try {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => results.console.push(e.message));
  page.on("console", (m) => {
    if (
      m.type() === "error" ||
      (m.type() === "warning" &&
        !m.text().includes("Service Worker registration blocked by Playwright"))
    )
      results.console.push(m.text());
  });
  page.on("requestfailed", (r) => results.failedRequests.push(r.url()));
  page.on("response", (r) => {
    if (r.status() >= 400)
      results.httpErrors.push({ url: r.url(), status: r.status() });
  });
  for (const route of ["", "#/impacts", "?release=2.0.0#/impacts"]) {
    await page.goto(base + route);
    await page.locator("h1").waitFor();
    if (await page.getByRole("button", { name: "Switch to English" }).count())
      await page.getByRole("button", { name: "Switch to English" }).click();
    await page.waitForFunction(
      () => !document.querySelector(".refresh-button")?.disabled,
    );
    if (route)
      assert(
        (await page.locator("h1").innerText()) ===
          "El Niño impacts, in context.",
        "Wrong impacts build",
      );
    results.routes.push({ route, title: await page.locator("h1").innerText() });
  }
  await page.reload();
  await page.locator(".impact-snapshot").waitFor();
  await page.getByRole("button", { name: "Agriculture", exact: true }).click();
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-18");
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("historical");
  await page.reload();
  await page.locator(".impact-history").waitFor();
  assert(
    (await page.getByLabel("Evidence type", { exact: true }).inputValue()) ===
      "historical",
    "Filter lost on refresh",
  );
  assert(
    (await page.getByLabel("State / Region", { exact: true }).inputValue()) ===
      "MM-18",
    "Region lost on refresh",
  );
  assert(
    new URL(page.url()).searchParams.get("release") === "2.0.0",
    "Release query lost",
  );
  await page.goBack();
  await page.getByTestId("impact-forecast").waitFor();
  await page.goForward();
  await page.locator(".impact-history").waitFor();
  assert(
    (await page.getByLabel("Evidence type", { exact: true }).inputValue()) ===
      "historical",
    "Forward failed",
  );
  await page.getByLabel("Evidence type", { exact: true }).selectOption("all");
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height });
    for (const lang of ["en", "my"]) {
      if ((await page.locator("html").getAttribute("lang")) !== lang)
        await page
          .getByRole("button", {
            name: lang === "my" ? "Switch to Burmese" : "Switch to English",
          })
          .click();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      assert(!overflow, `Overflow ${width} ${lang}`);
      assert(
        !axe.violations.length,
        `Accessibility ${width} ${lang}: ${axe.violations.map((v) => v.id)}`,
      );
      results.viewports.push({
        width,
        height,
        lang,
        overflow,
        violations: axe.violations.length,
      });
    }
  }
  await context.close();
  const live = await browser.newContext({
    serviceWorkers: "allow",
    viewport: { width: 390, height: 844 },
  });
  const p = await live.newPage();
  const swErrors = [];
  p.on("pageerror", (e) => swErrors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") swErrors.push(m.text());
  });
  await p.goto(
    base + "?audit=impacts#/impacts?sector=water&region=MM-04&evidence=all",
  );
  await p.getByRole("button", { name: "Switch to English" }).click();
  await p.getByTestId("impact-forecast").waitFor();
  await p.waitForFunction(
    () => !document.querySelector(".refresh-button").disabled,
  );
  results.resources = await p.evaluate(() =>
    performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      encodedBytes: r.encodedBodySize,
      duration: r.duration,
    })),
  );
  results.forecastText = await p.getByTestId("impact-forecast").innerText();
  results.reanalysisText = await p.getByTestId("impact-reanalysis").innerText();
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  assert(
    !swErrors.length,
    `Service-worker-enabled runtime errors: ${swErrors}`,
  );
  await live.setOffline(true);
  await p.reload();
  await p.locator(".offline-banner").waitFor();
  await p.getByTestId("impact-forecast").waitFor();
  assert(
    (await p.getByLabel("State / Region", { exact: true }).inputValue()) ===
      "MM-04",
    "Offline filter failed",
  );
  results.offline = "passed";
  await live.close();
  assert(!results.console.length, `Console errors: ${results.console}`);
  assert(!results.failedRequests.length, "Failed production requests");
  assert(!results.httpErrors.length, "Failed production assets");
  results.status = "passed";
  console.log(JSON.stringify(results, null, 2));
  if (process.argv[3])
    await writeFile(process.argv[3], JSON.stringify(results, null, 2) + "\n");
} finally {
  await browser.close();
}
