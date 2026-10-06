import { expect, test } from "@playwright/test";

test("stats show final values immediately when reduced motion is on", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const stats = page.getByRole("region", { name: "Team highlights" });
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(stats.locator("[data-countup]").first()).toHaveText("100+");
});
