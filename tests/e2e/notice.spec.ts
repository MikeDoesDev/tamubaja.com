import { expect, test } from "@playwright/test";

for (const path of ["/", "/sponsors", "/partners", "/car", "/team", "/give"]) {
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
