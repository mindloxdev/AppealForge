import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a real Next.js server and a real database.
 *
 * The model call is the only thing stubbed: each spec intercepts
 * /api/generate-letter and returns a payload sealed by the real server-side
 * crypto (see scripts/seed-test-draft.mjs), so unlock, download, entitlement
 * checks and the whole client path are exercised for real.
 *
 * Uses the Chrome already installed on the machine rather than downloading a
 * browser bundle.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: "chrome" },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
});
