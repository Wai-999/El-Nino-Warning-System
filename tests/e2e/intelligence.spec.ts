import { test, expect } from "@playwright/test";
test("keyboard map, simplified layers, persisted preferences and list fallback", async ({
  page,
}) => {
  await page.goto("./#/map");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".region-shape")).toHaveCount(15);
  await expect(page.getByLabel("Map layer")).toHaveValue("temperature");
  const shan = page.locator('.region-shape[aria-label^="Shan"]');
  await shan.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".weather-main h2")).toHaveText("Shan");
  await expect(shan).toHaveAttribute("aria-pressed", "true");
  for (const layer of [
    "temperature",
    "rain",
    "temperatureAnomaly",
    "rainAnomaly",
    "dryness",
    "official",
  ]) {
    await page.getByLabel("Map layer").selectOption(layer);
    await expect(page.locator(".map-legend")).toBeVisible();
  }
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pan north", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset map", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Map layer")).toHaveValue("official");
  await page.route("**/data/myanmar.geojson", (r) => r.abort());
  await page.reload();
  await expect(page.locator(".map-fallback")).toContainText("Map unavailable");
  await page.getByLabel("Filter regions").fill("Naypyidaw");
  await page.locator(".region-list button").click();
  await expect(page.locator(".weather-main h2")).toHaveText("Nay Pyi Taw");
});
test("stale model data is dated and never paints a current map value", async ({
  page,
}) => {
  await page.route("**/data/operational.json", async (route) => {
    const response = await route.fetch(),
      json = await response.json();
    json.weather.fetchedAt = "2020-01-01T00:00:00Z";
    await route.fulfill({ response, json });
  });
  await page.goto("./#/map");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".weather-summary")).toContainText(
    "Delayed · not current",
  );
  await expect(page.locator(".region-shape").first()).toHaveAttribute(
    "fill",
    /url/,
  );
  await page.goto("./#/safety");
  await page
    .getByText("Automated screening estimates · not official warnings", {
      exact: true,
    })
    .click();
  await expect(page.locator(".screening-list")).toContainText("Unavailable");
});
test("invalid source snapshots leave honest unavailable states and static guidance", async ({
  page,
}) => {
  await page.route(/\/data\/(current|operational|climate)\.json/, (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"bad":"payload"}',
    }),
  );
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".weather-summary")).toContainText(
    "forecast source is unavailable",
  );
  await expect(page.locator(".climate-summary")).toContainText(
    "Assessment unavailable",
  );
  await expect(page.locator("main")).toContainText("could not be refreshed");
  await page.goto("./#/safety");
  await expect(page.locator(".official-health")).toContainText(
    "Weather never generates these notices",
  );
  await expect(page.locator(".warning-center")).toContainText(
    "no listed warning is not an all-clear",
  );
});
test("320-pixel layout, zoom-sized text and legacy deep links stay usable", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Explicit viewport matrix runs once",
  );
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("./");
  for (const locale of ["my", "en"]) {
    if (locale === "en")
      await page.getByRole("button", { name: "Switch to English" }).click();
    for (const route of [
      "",
      "weather",
      "climate",
      "map",
      "safety",
      "sources",
      "learn",
      "data",
      "warnings",
      "region/MM-18",
    ]) {
      await page.goto(`./#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} ${locale}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");
  await page.locator("html").evaluate((el) => (el.style.fontSize = "200%"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
