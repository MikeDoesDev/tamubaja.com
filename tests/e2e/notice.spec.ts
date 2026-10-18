import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { load } from "js-yaml";

// The banner is switched with notice.show in content/site.yaml; these checks only apply while it's on.
const site = load(fs.readFileSync("content/site.yaml", "utf8")) as {
  notice?: { show?: boolean };
};

test("no notice shows when it's turned off", async ({ page }) => {
  test.skip(Boolean(site.notice?.show), "notice is on");
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Site notice" })).toHaveCount(
    0,
  );
});

test.describe("while the notice is on", () => {
  test.skip(
    !site.notice?.show,
    "The site notice is turned off in content/site.yaml",
  );

  for (const path of [
    "/",
    "/sponsors",
    "/partners",
    "/car",
    "/team",
    "/development",
  ]) {
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

  test("after scrolling past the banner, a construction button explains what to do", async ({
    page,
  }) => {
    await page.goto("/sponsors");
    const button = page.getByRole("button", { name: /under construction/i });
    await expect(button).toHaveCount(0);

    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(button).toBeVisible();

    await button.click();
    const help = page.getByRole("dialog", { name: /under construction/i });
    await expect(help).toBeVisible();
    await expect(help.getByRole("link", { name: /email us/i })).toHaveAttribute(
      "href",
      /^mailto:baja\.sae\.tamu@gmail\.com/,
    );
    await expect(
      help.getByRole("link", { name: /sponsor packet/i }),
    ).toHaveAttribute("href", /\.pdf$/);

    await page.keyboard.press("Escape");
    await expect(help).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(button).toHaveCount(0);
  });
});
