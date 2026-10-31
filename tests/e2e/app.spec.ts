import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const routes = ["", "weather", "climate", "map", "safety", "sources", "learn"];
test("Burmese default, persistent language, six pages and responsive layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "my");
  await expect(page.locator("h1")).toContainText("မိုးလေဝသ");
  await expect(page.locator(".big-temperature")).not.toHaveText("—°C");
  await page.evaluate(() => document.fonts.ready);
  await mkdir("docs/qa", { recursive: true });
  if (info.project.name === "mobile")
    await page.screenshot({
      path: "docs/qa/home-mobile-my.png",
      fullPage: true,
    });
  for (const locale of ["my", "en"]) {
    if (locale === "en")
      await page.getByRole("button", { name: "Switch to English" }).click();
    for (const route of routes) {
      await page.goto(`./#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".page-loading")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} ${locale} overflow`,
      ).toBe(true);
      if (info.project.name === "desktop" && locale === "en")
        await page.screenshot({
          path: `docs/qa/${route || "home"}-desktop-en.png`,
          fullPage: route === "",
        });
    }
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(errors).toEqual([]);
});
test("source-linked metric navigation, search and registry export", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .locator('a[href="#/sources?indicator=temperature"]')
    .first()
    .click();
  await expect(page.locator("#indicator-temperature")).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator("#indicator-temperature")).toContainText(
    "three ECMWF",
  );
  await page.getByLabel("Search indicators and sources").fill("SPI");
  await expect(page.locator("#indicator-spi")).toBeVisible();
  await expect(page.locator("#indicator-temperature")).toHaveCount(0);
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export registry" }).click();
  const file = await waiting;
  expect(file.suggestedFilename()).toBe("indicator-registry.json");
});
test("location dialog searches aliases and persists the chosen region", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.locator(".location-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Search regions").fill("Rangoon");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Yangon" })
    .click();
  await expect(page.locator(".weather-main h2")).toHaveText("Yangon");
  await page.reload();
  await expect(page.locator(".location-button")).toContainText("Yangon");
  await page.locator(".location-button").click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".location-button")).toBeFocused();
});
test("model values, daily extremes, historical dates and CSV provenance", async ({
  page,
}) => {
  const input = await (
    await page.request.get("./data/operational.json")
  ).json();
  const region = input.weather.regions.find(
    (r: { id: string }) => r.id === "MM-04",
  );
  await page.goto("./#/weather");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".temperature-line")).toContainText(
    String(Math.round(region.days[0].max)) + "°",
  );
  await expect(page.locator(".forecast-table tbody tr")).toHaveCount(7);
  await expect(page.locator(".forecast-table")).toContainText(
    "Peak heat index",
  );
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const file = await waiting;
  expect(file.suggestedFilename()).toBe("weather-with-provenance.csv");
  await page.getByRole("button", { name: "Past 30 days", exact: true }).click();
  await expect(page.locator("main")).toContainText("1991–2020");
  await expect(page.locator("main")).toContainText(input.history.end);
});
test("all pages pass automated WCAG rules in both languages", async ({
  page,
}) => {
  await page.goto("./");
  for (const locale of ["my", "en"]) {
    if (locale === "en")
      await page.getByRole("button", { name: "Switch to English" }).click();
    for (const route of routes) {
      await page.goto(`./#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".page-loading")).toHaveCount(0);
      if (route === "map")
        await expect(page.locator(".region-shape")).toHaveCount(15);
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations, `${route || "home"} ${locale}`).toEqual([]);
    }
  }
});
