import { test, expect } from "@playwright/test";
test.use({ serviceWorkers: "allow" });
test("offline restart retains checklist, pages, map and dated information", async ({
  page,
  context,
}) => {
  await page.goto("./#/prepare");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByRole("checkbox").first().check();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await expect(page.locator(".offline-banner")).toBeVisible();
  await page.goto("./#/learn");
  await expect(
    page.getByRole("heading", { name: "One ocean. Connected weather." }),
  ).toBeVisible();
  await page.goto("./#/map");
  await expect(page.locator(".region-shape")).toHaveCount(14);
  await context.setOffline(false);
});
