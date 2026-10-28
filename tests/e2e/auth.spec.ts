import { test, expect } from "@playwright/test";
import { clearRateLimits, cleanupE2eData, seedActiveSubscription } from "./db";

/**
 * Journey C, the parts that do not require Stripe's hosted checkout: creating
 * an account, signing in and out, and what the billing screens say before a
 * plan exists. The subscription entitlement itself is covered in
 * tests/integration/subscription.test.ts, where a plan can be seeded directly.
 */

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}@appealforge.test`;
}

// Every test signs in from the same address, so the auth limiter would trip
// part way through the suite. Clearing it keeps each test independent while
// leaving the limiter itself in force for real traffic.
test.beforeEach(async () => {
  await clearRateLimits("auth");
  await clearRateLimits("lead");
});

test.afterAll(async () => {
  await cleanupE2eData();
});

test("a visitor can create an account, land on it, and sign out", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

  await page.getByLabel("Name").fill("Pat Reyes");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a-long-enough-password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("No active plan")).toBeVisible();

  // The account holds billing records only - there is no letter history.
  await expect(page.getByText("No purchases yet.")).toBeVisible();
  await expect(page.getByText(/does not hold letters, patient details or claim information/)).toBeVisible();

  await page.getByRole("link", { name: /See plans|Manage billing/ }).click();
  await expect(page).toHaveURL(/\/account\/billing$/);
  await expect(page.getByText("Pay per letter")).toBeVisible();

  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");

  // The session is really gone.
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login$/);
});

/**
 * Submit the sign-in form. For a failed attempt the server action re-renders
 * the form and clears the password field, which is the signal that the attempt
 * has finished and the next one can be typed.
 */
async function failedSignIn(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.locator('form [role="alert"]')).toContainText(
    "That email and password combination is not correct.",
  );
  await expect(page.getByLabel("Password")).toHaveValue("");
}

test("sign-in rejects a wrong password without revealing whether the account exists", async ({
  page,
}) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a-long-enough-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  // A real account with the wrong password, and an address with no account at
  // all, must produce exactly the same answer.
  await failedSignIn(page, email, "the-wrong-password");
  await failedSignIn(page, `nobody-${Date.now()}@appealforge.test`, "the-wrong-password");

  // The right password still works afterwards.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a-long-enough-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account$/);
});

test("the password reset request never confirms whether an address exists", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(`definitely-not-a-user-${Date.now()}@appealforge.test`);
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.locator('form [role="status"]')).toContainText(
    "If an account exists for that address",
  );
});

test("account pages are not indexable and require a session", async ({ page, request }) => {
  const response = await request.get("/account", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(response.status());

  await page.goto("/login");
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("noindex");
});

test("the lead form validates and submits", async ({ page }) => {
  await page.goto("/for-medical-billers");

  const form = page.locator("form[data-lead-form], #billing-services form").first();
  await form.getByLabel("Name").fill("Pat Reyes");
  await form.getByLabel("Work email").fill(`lead-${Date.now()}@appealforge.test`);
  await form.getByLabel("Practice or organization").fill("Northside Billing");

  // Consent is required before anything is sent.
  await form.getByRole("button", { name: "Talk to our billing team" }).click();
  await expect(form.locator('[role="alert"]')).toContainText(
    "Please confirm you agree to be contacted.",
  );

  await form.getByText(/I agree to be contacted/).click();
  await form.getByRole("button", { name: "Talk to our billing team" }).click();

  await expect(page.getByRole("heading", { name: "Thank you - request received" })).toBeVisible();
});

test("a subscriber unlocks a letter without a new purchase", async ({ page, request }) => {
  const email = uniqueEmail();

  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a-long-enough-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account$/);

  // Stand in for the Stripe webhook that records a completed subscription.
  await seedActiveSubscription(email);

  await page.reload();
  await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Renews on/)).toBeVisible();

  // A draft this account never paid for still unlocks, through the plan.
  const draftId = "subscriberDraftId001";
  const unlocked = await page.evaluate(async (id) => {
    const response = await fetch("/api/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ draftId: id }),
    });
    return { status: response.status, body: await response.json() };
  }, draftId);

  expect(unlocked.status).toBe(200);
  expect(unlocked.body.kind).toBe("subscription");
  expect(typeof unlocked.body.key).toBe("string");

  // And the same request without the session cookie is refused.
  const anonymous = await request.post("/api/unlock", { data: { draftId } });
  expect(anonymous.status()).toBe(402);

  await page.goto("/account/billing");
  await expect(page.getByRole("button", { name: /Manage billing in Stripe/ })).toBeVisible();
  await expect(page.getByText(/renews automatically each month until cancelled/i)).toBeVisible();
});
