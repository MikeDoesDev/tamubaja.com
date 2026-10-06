import { expect, test } from "@playwright/test";

test("sponsor logos light up on hover", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover needs a mouse");
  await page.goto("/partners");
  const tile = page.getByTestId("sponsor-grid").locator("[data-sponsor-tile]").first();
  test.skip((await tile.count()) === 0, "no sponsors are shown yet");
  const logo = tile.locator("img");
  await expect(logo).toHaveCSS("filter", /grayscale\(1\)/);
  await tile.hover();
  await expect(logo).toHaveCSS("filter", /grayscale\(0\)/);
});

test("touch devices show logos in full color", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch only");
  await page.goto("/partners");
  const tile = page.getByTestId("sponsor-grid").locator("[data-sponsor-tile]").first();
  test.skip((await tile.count()) === 0, "no sponsors are shown yet");
  await expect(tile.locator("img")).not.toHaveCSS("filter", /grayscale\(1\)/);
});

test("footer logo strip scrolls and hides its repeated copy from screen readers", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByTestId("sponsor-marquee");
  test.skip((await strip.count()) === 0, "no sponsors are shown yet");
  await expect(strip.locator("ul")).toHaveCSS("animation-name", "marquee");
  const repeat = strip.locator("li[data-duplicate] a").first();
  await expect(repeat).toHaveAttribute("aria-hidden", "true");
  await expect(repeat).toHaveAttribute("tabindex", "-1");
});

test("with reduced motion the logo strip is a still row without repeats", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const strip = page.getByTestId("sponsor-marquee");
  test.skip((await strip.count()) === 0, "no sponsors are shown yet");
  await expect(strip.locator("li[data-duplicate]").first()).toBeHidden();
  await expect(strip.locator("ul")).toHaveCSS("animation-name", "none");
});
