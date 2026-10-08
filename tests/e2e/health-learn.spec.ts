import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { healthTopics } from "../../src/data/healthGuidance";
test("health topics expose sourced triage, canonical locations and separate surveillance even when data fails", async ({
  page,
}) => {
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("./#/health?region=MM-18");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".health-environment")).toContainText(
    "Environmental evidence unavailable",
  );
  await expect(page.locator(".surveillance")).toContainText(
    "does not establish zero cases",
  );
  for (const topic of healthTopics) {
    await page
      .getByLabel("Health topic", { exact: true })
      .selectOption(topic.id);
    await expect(page.locator(".health-topic")).toHaveAttribute(
      "data-topic",
      topic.id,
    );
    await expect(page.locator(".health-topic h3")).toHaveCount(6);
    await expect(page.locator(".health-references a")).toHaveCount(
      topic.sources.length,
    );
    await expect(page.locator(".health-emergency").first()).toContainText(
      "EMERGENCY",
    );
  }
  await page.getByLabel("Location", { exact: true }).selectOption("MM-16");
  await expect(page.locator(".surveillance")).toContainText("Sittwe");
  await page.reload();
  await expect(page.getByLabel("Location", { exact: true })).toHaveValue(
    "MM-16",
  );
  await expect(page.getByLabel("Health topic", { exact: true })).toHaveValue(
    "food",
  );
  await page.goto("./#/health?region=bad&topic=bad");
  await expect(page.getByLabel("Location", { exact: true })).toHaveValue("MM");
  await expect(page.getByLabel("Health topic", { exact: true })).toHaveValue(
    "heatstroke",
  );
  await expect(page.locator(".health-now")).toContainText("Do not give drinks");
  await expect(page.locator(".health-care")).toContainText("Do not wait");
});
test("distinct content homes and lazy map/history/media on Health and Learn", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/youtube|ytimg/.test(r.url())) external.push(r.url());
  });
  for (const route of ["/health", "/learn"]) {
    await page.goto("./#" + route);
    await expect(page.locator("h1")).toBeVisible();
    const resources = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((r) => r.name),
    );
    expect(
      resources.some((u) =>
        /MyanmarMap|myanmar.geojson|data\/archive.json/.test(u),
      ),
    ).toBe(false);
    await expect(
      page.locator(".enso-v2,.historical-record,.data-quality"),
    ).toHaveCount(0);
  }
  expect(external).toEqual([]);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".video-card")).toHaveCount(2);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Watch on YouTube", exact: false }),
  ).toHaveCount(2);
  await page.route("https://i.ytimg.com/**", (r) => r.abort());
  await page
    .getByRole("button", { name: "Load thumbnail from YouTube", exact: true })
    .first()
    .click();
  await expect(page.locator(".video-card").first()).toContainText(
    "Thumbnail unavailable",
  );
  await page.getByRole("button", { name: /Low data:/ }).click();
  await expect(page.locator(".video-card").last()).toContainText(
    "external images paused",
  );
  await page.goto("./#/impacts");
  await expect(page.locator("h1")).toHaveText("Potential impacts for Myanmar");
  await expect(page.getByLabel("Location", { exact: true })).toHaveValue("MM");
  await expect(
    page.locator(".enso-v2,.impact-history,.data-quality"),
  ).toHaveCount(0);
  await expect(page.locator(".impact-gaps")).toContainText(
    "INSUFFICIENT LOCATION-SPECIFIC EVIDENCE",
  );
  await page.goto("./#/data");
  await expect(page.locator(".data-quality")).toHaveCount(1);
});
test("health and video layouts are readable and accessible in both languages", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Explicit phone/tablet matrix runs once",
  );
  test.setTimeout(120000);
  for (const route of ["/health?region=MM-04", "/learn"]) {
    await page.goto("./#" + route);
    await expect(page.locator("h1")).toBeVisible();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
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
          `${route} ${width} ${lang}`,
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
    }
  }
});
