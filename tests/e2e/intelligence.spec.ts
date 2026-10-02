import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("overview avoids the map and exposes traceable coverage and real history", async ({
  page,
}) => {
  await page.goto("./?release=2.1.0#/");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".data-quality")).toBeVisible();
  await expect(page.locator(".region-shape")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some(
          (r) =>
            r.name.includes("MyanmarMap") || r.name.includes("myanmar.geojson"),
        ),
    ),
  ).toBe(false);
  await expect(page.locator(".changes-panel")).toContainText(
    /distinct validated snapshots|recorded screening snapshots/,
  );
  await expect(page.locator(".data-quality")).toContainText("Monitoring");
  await expect(page.locator(".data-quality")).toContainText(
    "Context / guidance",
  );
  await expect(page.locator(".regional-context")).toContainText(
    "REGIONAL CONTEXT — NOT A MYANMAR OFFICIAL WARNING",
  );
});
test("warning matrix retains all regions and supports region, concern, hazard, freshness and official filters", async ({
  page,
}) => {
  await page.goto("./?release=2.1.0#/warnings");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".warning-matrix tbody tr")).toHaveCount(15);
  await expect(page.locator(".warning-mobile article")).toHaveCount(15);
  await page.getByLabel("Sort by", { exact: true }).selectOption("az");
  await expect(
    page.locator(".warning-matrix tbody tr").first(),
  ).toHaveAttribute("data-region", "MM-07");
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-18");
  await expect(page.locator(".warning-matrix tbody tr")).toHaveCount(1);
  await page.getByLabel("Official warnings only", { exact: true }).check();
  await expect(page.locator(".warning-matrix tbody tr")).toHaveCount(0);
  await page.getByLabel("Official warnings only", { exact: true }).uncheck();
  await page.getByLabel("State / Region", { exact: true }).selectOption("all");
  await page
    .getByLabel("Elevated hazard", { exact: true })
    .selectOption("heat");
  await expect(page.locator("main")).toContainText("regions shown");
  await page.getByLabel("Elevated hazard", { exact: true }).selectOption("all");
  await page.getByLabel("Freshness", { exact: true }).selectOption("all");
  const visible =
    page.viewportSize()!.width > 1050
      ? page.locator(".warning-desktop")
      : page.locator(".warning-mobile");
  const region = visible.getByRole("link", { name: "Mandalay", exact: true });
  await region.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toContainText("Why am I seeing this?");
  await expect(page.locator("main")).toContainText(
    "National crop calendar context",
  );
  expect(new URL(page.url()).searchParams.get("release")).toBe("2.1.0");
});
test("missing and stale sources cannot silently become low platform risk", async ({
  page,
}) => {
  await page.route("**/data/operational.json", async (route) => {
    const r = await route.fetch();
    const json = await r.json();
    json.weather = null;
    json.history = null;
    await route.fulfill({ response: r, json });
  });
  await page.goto("./#/warnings");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".warning-matrix tbody tr")).toHaveCount(15);
  await expect(page.locator(".warning-matrix")).not.toContainText(
    "Low platform risk",
  );
  await expect(page.locator(".warning-matrix tbody tr").first()).toContainText(
    "Insufficient data",
  );
  await expect(page.locator(".data-quality")).toContainText("0/90");
  await page.getByLabel("Severity", { exact: true }).selectOption("unknown");
  await expect(page.locator(".warning-matrix tbody tr")).toHaveCount(15);
});
test("records filters and empty evidence explain archive gaps", async ({
  page,
}) => {
  await page.goto("./#/records");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".historical-record")).toHaveCount(2);
  await page
    .getByLabel("State / Region", { exact: true })
    .selectOption("MM-16");
  await expect(page.locator(".historical-record")).toHaveCount(1);
  await page.getByLabel("Year", { exact: true }).selectOption("2016");
  await expect(page.locator(".historical-record")).toHaveCount(0);
  await expect(page.locator("main")).toContainText(
    "not that no event occurred",
  );
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page.getByLabel("Hazard", { exact: true }).selectOption("drought");
  await expect(page.locator(".historical-record")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page
    .getByLabel("Evidence type", { exact: true })
    .selectOption("platform-snapshot");
  await expect(page.locator(".historical-record")).toHaveCount(0);
  await expect(page.locator(".snapshot-history")).toContainText(
    "full source versions remain in Git history",
  );
  await page.getByRole("button", { name: "Switch to Burmese" }).click();
  await expect(page.locator("h1")).toHaveText(
    "ဖြစ်ရပ်နှင့် သမိုင်းမှတ်တမ်းများ",
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("new routes remain usable at 320 pixels in both languages", async ({
  page,
}) => {
  test.skip(
    page.viewportSize()!.width !== 1440,
    "One project covers the explicit narrow viewport matrix",
  );
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ["/", "/warnings", "/records", "/region/MM-04"]) {
    await page.goto("./#" + route);
    await expect(page.locator("h1")).toBeVisible();
    for (const lang of ["my", "en"]) {
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
        `${route} ${lang} overflow`,
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations, `${route} ${lang}`).toEqual([]);
    }
  }
});
