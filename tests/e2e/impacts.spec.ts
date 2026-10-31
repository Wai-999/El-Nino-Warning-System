import { test, expect } from "@playwright/test";
test("hazard-specific checklists persist without leaking progress between hazards", async ({
  page,
}) => {
  await page.goto("./#/safety");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.locator(".hazard-checklist input").first().check();
  await page.reload();
  await expect(page.locator(".hazard-checklist input").first()).toBeChecked();
  await page.getByRole("button", { name: "Extreme heat", exact: true }).click();
  await expect(
    page.locator(".hazard-checklist input").first(),
  ).not.toBeChecked();
  await page.locator(".hazard-checklist input").first().check();
  await expect(page.locator(".checklist-progress")).toHaveAttribute(
    "value",
    "1",
  );
});
test("crop and stage assumptions, unavailable measurements and unshipped subscriptions are honest", async ({
  page,
}) => {
  await page.goto("./#/safety");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByLabel("Crop", { exact: true }).selectOption("pulses");
  await expect(page.locator(".crop-guidance")).toContainText(
    "different species",
  );
  await page.getByLabel("Growth stage assumption").selectOption("harvest");
  await expect(page.locator(".crop-guidance")).toContainText(
    "not a precise harvest-date recommendation",
  );
  await expect(page.locator(".crop-section")).toContainText(
    "soil moisture, irrigation supply and crop stress measurements are unavailable",
  );
  await expect(page.locator(".subscription-section")).toContainText(
    "Browser push and Telegram subscriptions are unshipped",
  );
  await expect(page.locator('button:has-text("Subscribe")')).toHaveCount(0);
  await page
    .getByText("Filter the in-site warning list", { exact: true })
    .click();
  await page.getByLabel("Area", { exact: true }).selectOption("region");
  await page.getByRole("button", { name: "Save device filter" }).click();
  await expect(page.locator(".warning-center")).toContainText(
    "This does not subscribe to notifications",
  );
});
