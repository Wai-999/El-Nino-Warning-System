import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function english(page: import("@playwright/test").Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
}
async function choose(page: import("@playwright/test").Page, code: string) {
  await page.locator(".location-button").click();
  await page.getByLabel("Search regions or townships").fill(code);
  await page
    .getByRole("dialog")
    .getByRole("button")
    .filter({ hasText: code })
    .click();
}
test("township names and PCodes persist with explicit parent-region fallback and saved places", async ({
  page,
}) => {
  await english(page);
  await choose(page, "MMR001001");
  await expect(page.locator(".location-button")).toContainText("Myitkyina");
  await expect(page.locator(".township-context")).toContainText("Kachin");
  await expect(page.locator(".weather-main h2")).toHaveText("Kachin");
  await page.getByRole("button", { name: "Save current place" }).click();
  await choose(page, "MMR008001");
  await page.getByRole("button", { name: "Save current place" }).click();
  await expect(page.locator(".saved-place-list article")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".location-button")).toContainText("Pyay");
  await page
    .locator(".saved-place-select")
    .filter({ hasText: "Myitkyina" })
    .click();
  await expect(page.locator(".location-button")).toContainText("Myitkyina");
  await page.locator(".township-context a").click();
  await expect(page.locator("h1")).toHaveText("Myitkyina");
  await expect(page.locator("main")).toContainText("not township observation");
  await page
    .getByText("Administrative details & reviewed names", { exact: true })
    .click();
  await expect(page.locator("main")).toContainText("district:MMR001001");
  await expect(page.locator("main")).toContainText("township:MMR001001");
  await expect(page.locator("main")).toContainText("2024-02-15");
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
});
test("historical aliases and ambiguous township names require explicit selection", async ({
  page,
}) => {
  await english(page);
  await page.locator(".location-button").click();
  await page.getByLabel("Search regions or townships").fill("Prome");
  await expect(page.getByRole("dialog")).toContainText("MMR008001");
  await page.getByLabel("Search regions or townships").fill("Htantabin");
  await expect(page.locator(".location-options button")).toHaveCount(2);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".location-button")).toContainText("Mandalay");
  await page
    .getByLabel("Search regions or townships")
    .fill("မြစ်\u200bကြီးနား");
  await expect(page.getByRole("dialog")).toContainText("MMR001001");
});
test("international numerals default with optional Myanmar digits and motion preferences", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".big-temperature")).toContainText(/[0-9]/);
  await expect(page.locator(".big-temperature")).not.toContainText(/[၀-၉]/);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("button", { name: "More options", exact: true }).click();
  await page.getByRole("button", { name: /Myanmar numerals/ }).click();
  await page.getByRole("button", { name: /Weather animation/ }).click();
  await page.getByRole("button", { name: "More options", exact: true }).click();
  await page.getByRole("button", { name: "Switch to Burmese" }).click();
  await expect(page.locator(".big-temperature")).toContainText(/[၀-၉]/);
  await expect(page.locator(".weather-scene")).toHaveClass(/scene-paused/);
  await page.reload();
  await expect(page.locator(".big-temperature")).toContainText(/[၀-၉]/);
  await expect(page.locator(".weather-scene")).toHaveClass(/scene-paused/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".scene-sun")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
test("preparedness and crop choices are separate for each saved place", async ({
  page,
}) => {
  await english(page);
  await choose(page, "MMR001001");
  await page.goto("./#/safety");
  await page.locator(".hazard-checklist input").first().check();
  await page.getByLabel("Crop", { exact: true }).selectOption("maize");
  await choose(page, "MMR008001");
  await expect(
    page.locator(".hazard-checklist input").first(),
  ).not.toBeChecked();
  await expect(page.getByLabel("Crop", { exact: true })).toHaveValue("rice");
  await choose(page, "MMR001001");
  await expect(page.locator(".hazard-checklist input").first()).toBeChecked();
  await expect(page.getByLabel("Crop", { exact: true })).toHaveValue("maize");
  await page.reload();
  await expect(page.getByLabel("Crop", { exact: true })).toHaveValue("maize");
});
test("WHO historical issues never become active health warnings after a fresh retrieval", async ({
  page,
}) => {
  await english(page);
  await page.goto("./#/safety");
  await expect(page.locator(".official-health")).toContainText(
    "This source returned no Myanmar-tagged publications",
  );
  await page
    .getByText("Historical WHO publications · not current advisories", {
      exact: true,
    })
    .click();
  await expect(page.locator(".official-health-item").first()).toContainText(
    "22 Aug 2019",
  );
  await expect(page.locator(".official-health-item").first()).not.toContainText(
    "28 Jul 2022",
  );
  await page.route("**/data/health-advisories.json", (r) =>
    r.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.reload();
  await expect(page.locator(".official-health .unavailable")).toContainText(
    "previously cached",
  );
  await expect(page.locator(".health-education")).toHaveCount(0);
  await expect(page.locator(".official-health")).toContainText(
    "current local advisory status is unknown",
  );
});
test("home map and briefing remain responsive and source-linked", async ({
  page,
}, info) => {
  await english(page);
  await expect(page.locator(".home-map .region-shape")).toHaveCount(15);
  await expect(page.locator(".local-briefing")).toContainText(
    "SOURCE-BASED TEMPLATE",
  );
  const weather = await page.locator(".weather-summary").boundingBox(),
    map = await page.locator(".home-map").boundingBox();
  if (info.project.name === "desktop")
    expect(map!.x).toBeGreaterThan(weather!.x + weather!.width - 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.goto("./#/township/INVALID");
  await expect(page.locator("h1")).toHaveText("Township not found");
});
