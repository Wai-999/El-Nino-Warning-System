import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const real = JSON.parse(readFileSync("public/data/operational.json", "utf8"));
async function english(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(
    page.getByRole("button", { name: "Refresh information" }),
  ).toBeEnabled();
}
test("impacts preserves release query, direct refresh, filters and back/forward", async ({
  page,
}) => {
  const errors: string[] = [];
  const bad: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) bad.push(r.url());
  });
  await page.goto("./?release=2.0.0#/impacts");
  await english(page);
  await expect(page.locator("h1")).toHaveText("El Niño impacts, in context.");
  await page.getByRole("button", { name: "Agriculture", exact: true }).click();
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-18");
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("historical");
  expect(new URL(page.url()).searchParams.get("release")).toBe("2.0.0");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Agriculture", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("State / Region", { exact: true })).toHaveValue(
    "MM-18",
  );
  await expect(page.locator(".impact-history")).toBeVisible();
  await expect(page.locator(".impact-snapshot")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByLabel("Evidence type", { exact: true })).toHaveValue(
    "all",
  );
  await page.goForward();
  await expect(page.getByLabel("Evidence type", { exact: true })).toHaveValue(
    "historical",
  );
  await page.getByRole("link", { name: "Open preparedness checklist" }).click();
  await expect(page.locator("h1")).not.toHaveText(
    "El Niño impacts, in context.",
  );
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Agriculture", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("./#/impacts?sector=invalid&region=wrong&evidence=bad");
  await expect(page.getByLabel("Evidence type", { exact: true })).toHaveValue(
    "all",
  );
  expect(errors).toEqual([]);
  expect(bad).toEqual([]);
});
test("impacts exposes source, date, baseline and separate evidence categories", async ({
  page,
}) => {
  await page.goto("./#/impacts");
  await english(page);
  await expect(page.locator(".enso-v2")).toContainText(
    "OFFICIAL ENSO ASSESSMENT",
  );
  await expect(page.getByTestId("impact-forecast")).toContainText(
    "FORECAST · NEXT 24 HOURS",
  );
  await expect(page.getByTestId("impact-reanalysis")).toContainText(
    "OBSERVED / REANALYSIS",
  );
  await expect(page.getByTestId("impact-reanalysis")).toContainText(
    "1991–2020",
  );
  await expect(page.getByTestId("impact-reanalysis")).toContainText(
    "not local station measurements",
  );
  await page.getByRole("button", { name: "Agriculture", exact: true }).click();
  await expect(page.locator(".impact-drivers .signal-card")).toHaveCount(3);
  await expect(page.locator(".impact-drivers")).toContainText("FORECAST");
  await expect(page.locator(".impact-drivers")).toContainText(
    "OBSERVED / REANALYSIS",
  );
  await expect(page.locator("#sector-title")).toContainText("Agriculture");
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("observed");
  await expect(page.locator(".impact-drivers .signal-card")).toHaveCount(1);
  await expect(page.getByTestId("impact-forecast")).toHaveCount(0);
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("forecast");
  await expect(page.locator(".impact-drivers .signal-card")).toHaveCount(2);
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("scenario");
  await expect(page.locator(".impact-drivers")).toHaveCount(0);
  await expect(page.locator("main")).toContainText(
    "SCENARIO · POTENTIAL IMPACT",
  );
});
test("impacts distinguishes loading, error and empty operational data", async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((r) => {
    release = r;
  });
  await page.route("**/data/operational.json", async (route) => {
    await gate;
    await route.fulfill({ status: 503, body: "unavailable" });
  });
  await page.goto("./#/impacts");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("main")).toContainText("Loading regional evidence");
  await expect(page.locator("main")).not.toContainText("0 / 15");
  release();
  await expect(page.locator("main")).toContainText(
    "Latest regional data could not be loaded",
  );
  await expect(page.getByTestId("impact-forecast")).toContainText(
    "Forecast data unavailable",
  );
  await expect(page.locator(".impact-drivers")).toContainText("Not assessed");
  await page.locator(".impact-coverage summary").click();
  await expect(page.locator("main")).toContainText(
    "Missing data does not mean zero risk",
  );
  await expect(page.locator(".impact-history")).toBeVisible();
  await page.unroute("**/data/operational.json");
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ json: { ...real, weather: null, history: null, nino: null } }),
  );
  await page.reload();
  await expect(page.getByTestId("impact-forecast")).toContainText(
    "Forecast data unavailable",
  );
  await expect(page.locator("main")).not.toContainText(
    "Latest regional data could not be loaded",
  );
});
test("stale and partial evidence cannot imply an all-clear; failed fetch preserves dates", async ({
  page,
}) => {
  const payload = structuredClone(real);
  payload.history = null;
  payload.weather.regions.forEach(
    (r: { next24: { heat: number; maxRain: number; gust: number } }) => {
      r.next24.heat = 20;
      r.next24.maxRain = 0;
      r.next24.gust = 10;
    },
  );
  await page.clock.setFixedTime(new Date(real.weather.fetchedAt));
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ json: payload }),
  );
  await page.goto("./#/impacts?sector=agriculture");
  await english(page);
  await expect(page.locator(".impact-drivers")).toContainText(
    "Incomplete evidence",
  );
  await expect(page.locator(".impact-drivers > p").first()).toContainText(
    "Not assessed",
  );
  await page.unroute("**/data/operational.json");
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.getByRole("button", { name: "Refresh information" }).click();
  await expect(page.locator(".impact-snapshot")).toContainText("Cached copy");
  await expect(page.getByTestId("impact-forecast")).toContainText(
    "Temperature range",
  );
  await page.clock.setFixedTime(
    new Date(Date.parse(real.weather.fetchedAt) + 20 * 3600000),
  );
  await page.getByRole("button", { name: "Refresh information" }).click();
  await expect(page.getByTestId("impact-forecast")).toContainText(
    "Stale — excluded from screening",
  );
  await expect(page.locator(".impact-drivers > p").first()).toContainText(
    "Not assessed",
  );
});
test("invalid observations fail safely without losing static scientific content", async ({
  page,
}) => {
  const invalid = structuredClone(real);
  invalid.history.regions[0].rainPercent = 99999;
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ json: invalid }),
  );
  await page.goto("./#/impacts");
  await english(page);
  await expect(page.locator("main")).toContainText(
    "Latest regional data could not be loaded",
  );
  await expect(page.locator(".impact-history")).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/NaN|undefined|99999/);
});
test("impacts mobile sizes, Burmese, keyboard and accessible sources", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Exact viewport matrix runs once",
  );
  test.setTimeout(120000);
  await page.goto("./#/impacts");
  await english(page);
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations, `${width} ${lang}`).toEqual([]);
    }
  }
  await expect(
    page.locator(".impact-sources a:visible").first(),
  ).toHaveAccessibleName(/တက်ဘ်အသစ်/);
  await page.getByRole("button", { name: "Switch to English" }).click();
  const agriculture = page.getByRole("button", {
    name: "Agriculture",
    exact: true,
  });
  await agriculture.focus();
  await page.keyboard.press("Enter");
  await expect(agriculture).toBeFocused();
  await expect(agriculture).toHaveAttribute("aria-pressed", "true");
  const disclosure = page.getByText(
    "Why, when and how strong is the evidence?",
    { exact: true },
  );
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".impact-explanation")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
