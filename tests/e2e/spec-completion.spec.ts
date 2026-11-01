import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
async function english(page: import("@playwright/test").Page, route = "") {
  await page.goto(`./#/${route}`);
  await page.getByRole("button", { name: "Switch to English" }).click();
}
async function accessible(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
test("city/town names are discoverable, saved separately, and visible on the map", async ({
  page,
}, info) => {
  await english(page);
  await page.locator(".location-button").click();
  await expect(page.getByRole("dialog")).toContainText(
    "Cities, towns & settlements",
  );
  await expect(page.locator(".location-options button").first()).toContainText(
    "Mandalay",
  );
  await accessible(page);
  if (info.project.name === "desktop")
    await page.screenshot({ path: "docs/qa/v32-location-picker-en.png" });
  await page
    .getByLabel("Search cities, towns, regions or townships")
    .fill("Rangoon");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cities / towns", exact: true })
    .click();
  await page.locator(".location-options button").first().click();
  await expect(page.locator(".location-button")).toContainText("Yangon");
  await page
    .getByRole("button", { name: "Save current place", exact: true })
    .click();
  await page.locator(".township-context a").click();
  await expect(page.locator("h1")).toHaveText("Yangon");
  await expect(page.locator("main")).toContainText(
    "distinct from an administrative township",
  );
  await expect(page.locator("main")).toContainText("GeoNames 1298824");
  await page.reload();
  await expect(page.locator(".location-button")).toContainText("Yangon");
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mokinn-saved-places")!),
    ),
  ).toContain("settlement:1298824");
  await page.goto("./#/map");
  await expect(page.getByTestId("settlement-label-1298824")).toContainText(
    "Yangon",
  );
  await page.getByLabel("City / town names", { exact: true }).uncheck();
  await expect(page.locator(".settlement-labels text")).toHaveCount(0);
  await page.getByLabel("City / town names", { exact: true }).check();
  await expect(page.getByTestId("settlement-label-1298824")).toBeVisible();
  await accessible(page);
  if (info.project.name === "desktop")
    await page.screenshot({
      path: "docs/qa/v32-cities-map-en.png",
      fullPage: false,
    });
  await page.getByRole("button", { name: "Switch to Burmese" }).click();
  await expect(page.getByTestId("settlement-label-1298824")).toContainText(
    "ရန်ကုန်",
  );
  await accessible(page);
});
test("hourly data loads on demand, retains sample precision, and exports provenance", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith("weather-details.json")) requests.push(r.url());
  });
  await english(page);
  expect(requests).toHaveLength(0);
  await page.goto("./#/weather");
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "Hourly", exact: true }).click();
  await expect(page.locator(".hourly-forecast tbody tr")).toHaveCount(24);
  expect(requests).toHaveLength(1);
  await expect(
    page
      .getByRole("combobox", { name: "Grid sample", exact: true })
      .locator("option"),
  ).toHaveCount(3);
  await expect(
    page
      .getByRole("combobox", { name: "Myanmar calendar day", exact: true })
      .locator("option"),
  ).toHaveCount(7);
  await expect(page.locator(".hourly-forecast")).toContainText(
    "neither a regional chance nor a flooding probability",
  );
  await page.getByRole("checkbox", { name: /Show humidity/ }).check();
  await expect(page.locator(".hourly-forecast thead")).toContainText(
    "Mean sea-level pressure",
  );
  await expect(page.locator(".hourly-forecast thead")).toContainText(
    "Soil moisture",
  );
  await accessible(page);
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Hourly CSV", exact: true }).click();
  const file = await waiting;
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv).toContain("precipitation_probability [%]");
  expect(csv).toContain("ECMWF IFS ensemble 0.25° via Open-Meteo");
  expect(csv).toContain("not a station or city/township measurement");
  expect(csv.split("\r\n")).toHaveLength(169);
  if (info.project.name === "desktop")
    await page.screenshot({ path: "docs/qa/v32-hourly-en.png" });
  await page.getByRole("button", { name: "Switch to Burmese" }).click();
  await expect(page.locator(".hourly-forecast thead")).toContainText(
    "မြေဆီလွှာအစိုဓာတ်",
  );
  await accessible(page);
});
test("missing optional measurements remain unavailable and failed detailed source does not fabricate a table", async ({
  page,
}) => {
  const payload = await (
    await page.request.get("./data/weather-details.json")
  ).json();
  for (const point of payload.points) point.values.pressure_msl = null;
  await page.route("**/data/weather-details.json", (route) =>
    route.fulfill({ json: payload }),
  );
  await english(page, "weather");
  await page.getByRole("button", { name: "Hourly", exact: true }).click();
  await page.getByRole("checkbox", { name: /Show humidity/ }).check();
  await expect(
    page.locator(".hourly-forecast tbody tr").first().locator("td").nth(8),
  ).toHaveText("—");
  await page.unroute("**/data/weather-details.json");
  await page.route("**/data/weather-details.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.reload();
  await page.getByRole("button", { name: "Hourly", exact: true }).click();
  await expect(page.locator("main")).toContainText("No values are substituted");
  await expect(page.locator(".hourly-forecast table")).toHaveCount(0);
});

test.describe("on-demand hourly offline cache", () => {
  test.use({ serviceWorkers: "allow" });
  test("detail is cached only after use and keeps its original dates offline", async ({
    page,
    context,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "One service-worker cache policy check is sufficient; responsive hourly views run on all projects.",
    );
    await english(page);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    expect(
      await page.evaluate(
        async () =>
          !!(await caches.match(
            new URL("data/weather-details.json", document.baseURI).href,
          )),
      ),
    ).toBe(false);
    await page.goto("./#/weather");
    await page.getByRole("button", { name: "Hourly", exact: true }).click();
    await expect(page.locator(".hourly-forecast tbody tr")).toHaveCount(24);
    const payload = await (
      await page.request.get("./data/weather-details.json")
    ).json();
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            !!(await caches.match(
              new URL("data/weather-details.json", document.baseURI).href,
            )),
        ),
      )
      .toBe(true);
    await context.setOffline(true);
    await page.reload();
    await page.getByRole("button", { name: "Hourly", exact: true }).click();
    await expect(page.locator(".hourly-forecast tbody tr")).toHaveCount(24);
    await expect(page.locator(".offline-banner")).toBeVisible();
    await expect(
      page.locator(".hourly-forecast .status-pill.delayed"),
    ).toBeVisible();
    const retained = await page.evaluate(
      async () =>
        (
          await (await caches.match(
            new URL("data/weather-details.json", document.baseURI).href,
          ))!.json()
        ).fetchedAt,
    );
    expect(retained).toBe(payload.fetchedAt);
    await context.setOffline(false);
  });
});

test("advanced NOAA indices preserve distinct methods and periods in both languages", async ({
  page,
}) => {
  const source = await (
    await page.request.get("./data/enso-indices.json")
  ).json();
  await english(page, "climate");
  await page
    .getByText("Drought, seasonal outlooks & advanced indicators", {
      exact: true,
    })
    .click();
  await expect(page.locator(".published-indices")).toContainText(
    "ONI · ERSSTv6",
  );
  await expect(page.locator(".published-indices .index-latest")).toContainText(
    source.series.oni.points.at(-1).label,
  );
  await page
    .getByRole("button", { name: "SOI · CPC standardized", exact: true })
    .click();
  await expect(page.locator(".published-indices")).toContainText(
    "STANDARDIZED DATA",
  );
  await page
    .getByRole("button", { name: "MEI.v2 · NOAA PSL", exact: true })
    .click();
  await expect(page.locator(".published-indices .index-latest")).toContainText(
    source.series.mei.points.at(-1).label,
  );
  await expect(
    page.locator(".published-indices tbody tr").last(),
  ).toContainText(
    `${source.series.mei.points.at(-1).startMonth} → ${source.series.mei.points.at(-1).endMonth}`,
  );
  await accessible(page);
  await page.getByRole("button", { name: "Switch to Burmese" }).click();
  await expect(page.locator(".published-indices")).toContainText(
    "ဒီဇင်ဘာ–ဇန်နဝါရီ",
  );
  await accessible(page);
});

test("unknown saved place references survive a geography upgrade without reassignment", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("mokinn-saved-places", '["township:MMR999999"]');
  });
  await english(page);
  await expect(page.locator(".saved-place-list")).toContainText(
    "Original ID retained; no replacement assigned",
  );
  await expect(page.locator(".saved-place-list")).toContainText(
    "township:MMR999999",
  );
  await page
    .getByRole("button", {
      name: "Remove unavailable saved reference township:MMR999999",
      exact: true,
    })
    .click();
  await expect(page.locator(".saved-place-list article")).toHaveCount(0);
});
