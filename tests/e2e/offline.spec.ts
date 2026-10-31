import { test, expect } from "@playwright/test";
test.describe("installed PWA", () => {
  test.use({ serviceWorkers: "allow" });
  test("offline restart retains checklist, pages, map and original data dates", async ({
    page,
    context,
  }) => {
    await page.goto("./#/safety");
    await page.getByRole("button", { name: "Switch to English" }).click();
    await page.locator(".hazard-checklist input").first().check();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    await page.goto("./#/map");
    await expect(page.locator(".region-shape")).toHaveCount(15);
    await page.goto("./#/safety");
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(".hazard-checklist input").first()).toBeChecked();
    await expect(page.locator(".offline-banner")).toContainText(
      "Previously cached",
    );
    for (const route of ["", "weather", "climate", "map", "sources", "learn"]) {
      await page.goto(`./#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".offline-banner")).toBeVisible();
    }
    await page.goto("./#/map");
    await expect(page.locator(".region-shape")).toHaveCount(15);
    await context.setOffline(false);
  });
});
test("a warning expires at the boundary while offline and keeps issuer severity", async ({
  page,
  context,
}) => {
  const now = new Date(),
    issued = new Date(+now - 60000).toISOString(),
    expires = new Date(+now + 17000).toISOString();
  const copy = { en: "TEST FIXTURE ONLY", my: "စမ်းသပ်နမူနာသာ" };
  await page.route("**/data/current.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        version: 1,
        checkedAt: now.toISOString(),
        enso: null,
        ensoFetch: "unavailable",
        regionalCoverage: "partial",
        regionalCheckedAt: now.toISOString(),
        history: [],
        alerts: [
          {
            id: "test-only-expiry",
            regionId: "MM-04",
            severity: "warning",
            type: "rainfall",
            title: copy,
            description: copy,
            impacts: copy,
            affected: copy,
            actions: [copy, copy, copy],
            prepare: [copy],
            issuedAt: issued,
            validFrom: issued,
            validUntil: expires,
            confidence: "not-provided",
            confidenceReason: copy,
            source: {
              name: "Test issuing authority",
              url: "https://www.dmh.gov.mm/test-fixture",
              publisher: "DMH",
              originalSeverity: "Original Orange category",
              retrievedAt: issued,
            },
            country: "MM",
            sourceId: "dmh",
            sourceLocation: "Mandalay",
            kind: "official-bulletin",
            change: copy,
          },
        ],
      },
    }),
  );
  await page.clock.install({ time: now });
  await page.goto("./");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".official-notice.active")).toHaveCount(1);
  await expect(page.locator(".official-notice")).toContainText(
    "Original Orange category",
  );
  await context.setOffline(true);
  await page.clock.runFor(17001);
  await expect(page.locator(".official-notice.active")).toHaveCount(0);
  await expect(page.locator(".offline-banner")).toBeVisible();
});
