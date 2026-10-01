import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("Burmese default, language, navigation, all requested screens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "my");
  await expect(page.locator("h1")).toContainText("အခြေအနေ");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("h1")).toContainText("Know the conditions");
  for (const route of [
    "map",
    "warnings",
    "impacts",
    "prepare",
    "learn",
    "data",
    "region/MM-18",
  ]) {
    await page.goto(`./#/${route}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".page-loading")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
test("map boundaries, keyboard region selection, layer controls and zoom", async ({
  page,
}) => {
  await page.goto("./#/map");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".region-shape")).toHaveCount(15);
  const path = page.locator('.region-shape[aria-label^="Shan"]');
  await path.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".regional-profile h2")).toHaveText("Shan");
  await expect(path).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Map layer").selectOption("temperatureAnomaly");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pan north", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset map", exact: true }).click();
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-18");
  await expect(page.locator(".regional-profile")).toContainText("Nay Pyi Taw");
});
test("preparedness progress persists and remains group-specific", async ({
  page,
}) => {
  await page.goto("./#/prepare");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("checkbox").first().check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByRole("button", { name: /Farmers/ }).click();
  await expect(page.getByRole("checkbox").first()).not.toBeChecked();
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
});
test("unavailable data cannot display an all-clear; history and filters work", async ({
  page,
}) => {
  await page.goto("./#/warnings");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page
    .getByRole("button", { name: "Official warnings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Regional warning status is unavailable",
    }),
  ).toBeVisible();
  await page.getByLabel("Severity", { exact: true }).selectOption("severe");
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-04");
  await expect(
    page.getByRole("heading", {
      name: "Regional warning status is unavailable",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No archived bulletins" }),
  ).toBeVisible();
});
test("ENSO educational diagram and scenario controls change content", async ({
  page,
}) => {
  await page.goto("./#/learn");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "El Niño", exact: true }).click();
  await expect(page.locator(".diagram-caption")).toContainText(
    "trade winds weaken",
  );
  await page.locator("summary").first().click();
  await expect(page.locator(".lesson-body").first()).toBeVisible();
  await page.goto("./#/impacts");
  await page.getByRole("button", { name: "Agriculture", exact: true }).click();
  await expect(page.locator("main")).toContainText("crop loss");
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  await expect(page.locator("main")).toContainText(
    "No outage or generation forecast",
  );
});
test("invalid and failed data have explicit fallbacks", async ({ page }) => {
  await page.route("**/data/current.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"bad":"payload"}',
    }),
  );
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("main")).toContainText(
    "latest data could not be loaded",
  );
  await expect(page.locator(".national-strip")).toContainText(
    "Coverage unavailable",
  );
  await expect(page.locator(".enso-v2")).toContainText(
    "ENSO assessment unavailable",
  );
});
test("stale ENSO bulletin is visibly historical", async ({ page }) => {
  await page.route("**/data/current.json", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.enso.issuedAt = "2020-01-01T00:00:00Z";
    json.enso.validUntil = "2020-02-01T00:00:00Z";
    await route.fulfill({ response, json });
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".enso-v2")).toContainText("Stale assessment");
});
test("map failure preserves the location list", async ({ page }) => {
  await page.route("**/data/myanmar.geojson", (r) => r.abort());
  await page.goto("./#/map");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".map-fallback")).toContainText("Map unavailable");
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-06");
  await expect(page.locator(".regional-profile h2")).toHaveText("Yangon");
});
test("WCAG automated checks in both languages", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".region-shape")).toHaveCount(15);
  await page.evaluate(() => document.fonts.ready);
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to English" }).click();
  for (const route of [
    "prepare",
    "learn",
    "map",
    "warnings",
    "impacts",
    "data",
  ]) {
    await page.goto(`./#/${route}`);
    await expect(page.locator("h1")).toBeVisible();
    result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations, `${route} accessibility`).toEqual([]);
  }
});

test("V2 regional metrics, layers, low data and stale operational safety", async ({
  page,
}) => {
  await page.goto("./#/region/MM-04");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".weather-now strong")).toContainText("°C");
  await expect(page.locator("main")).toContainText("1991–2020");
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.getByRole("button", { name: /Low data/ }).click();
  await page.goto("./#/map");
  await expect(page.locator(".region-shape")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("Map paused");
  await page.getByRole("button", { name: /Low data/ }).click();
  await expect(page.locator(".region-shape")).toHaveCount(15);
  for (const layer of [
    "overall",
    "temperature",
    "temperatureAnomaly",
    "rain",
    "rainAnomaly",
    "heat",
    "dryness",
    "agriculture",
    "official",
    "system",
  ]) {
    await page.getByLabel("Map layer").selectOption(layer);
    await expect(page.locator(".map-legend")).toBeVisible();
  }
  await page.route("**/data/operational.json", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.weather.fetchedAt = "2020-01-01T00:00:00Z";
    await route.fulfill({ response, json });
  });
  await page.reload();
  await expect(page.locator(".regional-profile")).toContainText(
    "Stale — not current",
  );
  await page.getByLabel("Map layer").selectOption("temperature");
  await expect(page.locator(".region-shape").first()).toHaveAttribute(
    "fill",
    /url/,
  );
});
