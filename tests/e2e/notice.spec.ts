import { expect, test } from "@playwright/test";

for (const path of ["/", "/sponsors", "/partners", "/car", "/team", "/give", "/development"]) {
  test(`${path} shows the under-construction notice`, async ({ page }) => {
    await page.goto(path);
    const notice = page.getByRole("region", { name: "Site notice" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/under construction/i);
    // A static notice must not interrupt screen readers on every page load (no role="alert").
    // (Next.js's own hidden route announcer is a separate role="alert" element.)
    await expect(notice).toHaveAttribute("role", "region");
  });
}

test("after scrolling past the banner, a construction button explains what to do", async ({ page }) => {
  await page.goto("/sponsors");
  const button = page.getByRole("button", { name: /under construction/i });
  await expect(button).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(button).toBeVisible();

  await button.click();
  const help = page.getByRole("dialog", { name: /under construction/i });
  await expect(help).toBeVisible();
  await expect(help.getByRole("link", { name: /email us/i })).toHaveAttribute("href", /^mailto:baja\.sae\.tamu@gmail\.com/);
  await expect(help.getByRole("link", { name: /sponsor packet/i })).toHaveAttribute("href", /\.pdf$/);

  await page.keyboard.press("Escape");
  await expect(help).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(button).toHaveCount(0);
});
