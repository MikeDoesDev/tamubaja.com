import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: /engineered to conquer/i },
  { path: "/sponsors", h1: /partner with texas a&m baja/i },
  { path: "/partners", h1: /powered by our partners/i },
  { path: "/car", h1: /car/i },
  { path: "/team", h1: /team behind car #51/i },
  { path: "/give", h1: /support the team/i },
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    // Vercel Analytics' script only exists on Vercel; its 404 on localhost is expected.
    if (message.type() === "error" && !message.location().url.includes("/_vercel/")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  });
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, {
    timeout: 15_000,
  });
}

for (const route of ROUTES) {
  test(`${route.path} renders cleanly`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
    await scrollToBottom(page);
    const broken = await page.$$eval("img", (images) =>
      images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
    );
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("every internal link resolves", async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route.path);
    const found = await page.$$eval("a[href^='/']", (links) => links.map((link) => link.getAttribute("href") ?? "/"));
    for (const href of found) hrefs.add(href.split("#")[0] || "/");
  }
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test("unknown routes show the branded 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/wrong turn/i);
});

test("mobile menu opens, navigates, and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu.getByRole("link", { name: "Partners" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});
