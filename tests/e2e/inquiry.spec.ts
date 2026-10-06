import { expect, test, type Page, type Route } from "@playwright/test";

const ENDPOINT = "https://api.web3forms.com/submit";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function mockEndpoint(page: Page, handler: (route: Route) => Promise<void>) {
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    return handler(route);
  });
}

async function fillForm(page: Page) {
  await page.getByLabel("Your name").fill("Jordan Smith");
  await page.getByLabel("Company or organization").fill("Acme Gear");
  await page.getByLabel("Work email").fill("jordan@acme.com");
  await page.getByLabel("What are you interested in?").selectOption("gold");
  await page.getByLabel("Message (optional)").fill("We'd like to sponsor.");
}

test("empty submit shows every error and sends nothing", async ({ page }) => {
  let sent = false;
  await mockEndpoint(page, async (route) => {
    sent = true;
    await route.fulfill({ status: 200, headers: CORS, json: { success: true } });
  });
  await page.goto("/sponsors#inquire");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your company or organization.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Choose what you're interested in.")).toBeVisible();
  expect(sent).toBe(false);
});

test("a tier card's Choose link preselects that tier", async ({ page }) => {
  await page.goto("/sponsors");
  await page.getByRole("link", { name: "Choose Gold" }).click();
  await expect(page).toHaveURL(/interest=gold/);
  await expect(page.getByLabel("What are you interested in?")).toHaveValue("gold");
});

test("successful submit sends the right payload and confirms", async ({ page }) => {
  let payload: Record<string, unknown> | undefined;
  await mockEndpoint(page, async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, headers: CORS, json: { success: true, message: "ok" } });
  });
  await page.goto("/sponsors");
  await fillForm(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("message received");
  expect(payload).toMatchObject({
    access_key: "e2e-test-key",
    company: "Acme Gear",
    interest: "Gold sponsorship",
    subject: "Baja sponsor inquiry — Acme Gear (Gold sponsorship)",
  });
});

test("failed submit offers a prefilled email fallback", async ({ page }) => {
  await mockEndpoint(page, async (route) => {
    await route.fulfill({ status: 400, headers: CORS, json: { success: false } });
  });
  await page.goto("/sponsors");
  await fillForm(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("link", { name: "Email it to us instead" })).toHaveAttribute(
    "href",
    /^mailto:baja\.sae\.tamu@gmail\.com\?subject=/,
  );
});

test("the team page's resume-book link preselects recruiting", async ({ page }) => {
  await page.goto("/team");
  await page.getByRole("link", { name: "Request our resume book" }).click();
  await expect(page).toHaveURL(/interest=recruiting/);
  await expect(page.getByLabel("What are you interested in?")).toHaveValue("recruiting");
});
