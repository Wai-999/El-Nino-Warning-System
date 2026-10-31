import { test, expect } from "@playwright/test";
test("six synthetic lessons work with keyboard controls and reset", async ({
  page,
}) => {
  await page.goto("./#/learn");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator(".lesson-navigation button")).toHaveCount(6);
  await expect(page.locator(".education-banner")).toContainText(
    "No simulation result is used in warnings",
  );
  await page.getByRole("button", { name: "El Niño", exact: true }).click();
  await expect(page.locator(".pacific-schematic")).toHaveClass(/phase-2/);
  await page.locator(".lesson-navigation button").nth(1).click();
  const rain = page.getByLabel("Example rainfall");
  await rain.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rain).toHaveValue("130");
  await expect(page.locator(".simulation-result")).toContainText("30 mm");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(rain).toHaveValue("120");
  await page.locator(".lesson-navigation button").nth(2).click();
  await expect(page.locator(".simulation-frame")).toContainText(
    "This score is not SPI",
  );
  await page.locator(".lesson-navigation button").nth(3).click();
  await expect(page.locator(".probability-tiles .marked")).toHaveCount(6);
  await page.locator(".lesson-navigation button").nth(4).click();
  await expect(page.locator(".simulation-result")).toContainText(
    "not a medical assessment",
  );
  await page.locator(".lesson-navigation button").nth(5).click();
  await page
    .getByRole("button", { name: "Turn back and find a safe route" })
    .click();
  await expect(page.locator(".simulation-result")).toContainText("Turn back.");
});
test("health content remains static when weather inputs change", async ({
  page,
}) => {
  await page.goto("./#/safety");
  await page.getByRole("button", { name: "Switch to English" }).click();
  const before = await page.locator(".health-education").innerText();
  await page.route("**/data/operational.json", (r) =>
    r.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.reload();
  await expect
    .poll(() => page.locator(".health-education").innerText())
    .toBe(before);
  await expect(page.locator(".health-education")).toContainText(
    "Weather conditions do not establish dengue or malaria transmission",
  );
});
