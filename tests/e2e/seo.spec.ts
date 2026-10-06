import { expect, test } from "@playwright/test";

test("sitemap lists every page on the production domain", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const path of ["", "/sponsors", "/car", "/team", "/give"]) {
    expect(body).toContain(`<loc>https://tamubaja.com${path}</loc>`);
  }
});

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://tamubaja.com/sitemap.xml");
});

for (const path of ["/", "/sponsors", "/car", "/team", "/give"]) {
  test(`${path} has a description, canonical URL, and a working share image`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/tamubaja\.com/);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(image).toBeTruthy();
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
}
