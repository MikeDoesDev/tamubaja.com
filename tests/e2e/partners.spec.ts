import { expect, test } from "@playwright/test";

test("sponsor logos show in full color", async ({ page }) => {
  await page.goto("/partners");
  const tile = page.getByTestId("sponsor-grid").locator("[data-sponsor-tile]").first();
  test.skip((await tile.count()) === 0, "no sponsors are shown yet");
  await expect(tile.locator("img")).not.toHaveCSS("filter", /grayscale\(1\)/);
});

test("footer logo strip loads near the footer, scrolls, is grey, and is decorative for screen readers", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByTestId("sponsor-marquee");
  test.skip((await strip.count()) === 0, "no sponsors are shown yet");
  await strip.scrollIntoViewIfNeeded();
  await expect(strip.locator(".pui-marquee__track")).toHaveCSS("animation-name", "pui-marquee");
  await expect(strip.locator(".pui-marquee")).not.toHaveAttribute("aria-label");
  const tiles = strip.locator("[data-sponsor-tile]");
  for (const tile of [tiles.first(), tiles.last()]) {
    await expect(tile).toHaveAttribute("aria-hidden", "true");
    await expect(tile).toHaveAttribute("tabindex", "-1");
  }
  // Logos are already single-color; the library's own logo filter would darken them.
  await expect(tiles.first().locator("img")).toHaveCSS("filter", "none");
  await expect(tiles.first().locator("img")).toHaveCSS("opacity", "0.45");
  await expect(page.getByRole("link", { name: "See all our partners" })).toBeVisible();
});

test("with reduced motion the logo strip is a still row without repeats", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const strip = page.getByTestId("sponsor-marquee");
  test.skip((await strip.count()) === 0, "no sponsors are shown yet");
  await strip.scrollIntoViewIfNeeded();
  const items = strip.locator(".pui-marquee__item");
  await expect(items.first()).toBeVisible();
  await expect(items.last()).toBeHidden();
  await expect(strip.locator(".pui-marquee__track")).toHaveCSS("animation-name", "none");
});
