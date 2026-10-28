import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * Journey A (free preview) and Journey B (paid unlock and download).
 *
 * scripts/seed-test-draft.mjs writes a real sealed payload and records a PAID
 * purchase for it, so everything except the model call is the real system:
 * the real encryption, the real /api/unlock entitlement check, and the real
 * document endpoints.
 */

interface Seed {
  payload: {
    draftId: string;
    preview: string;
    sealed: { iv: string; ciphertext: string };
    shape: { words: number }[];
    wordCount: number;
    placeholders: string[];
    notes: string[];
    free: { remaining: number };
  };
  lockedPlain: string;
}

const seed = JSON.parse(readFileSync("scripts/.test-draft.json", "utf8")) as Seed;

async function stubGenerate(page: Page) {
  await page.route("**/api/generate-letter", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, ...seed.payload }),
    });
  });
}

async function fillForm(page: Page) {
  await page.getByLabel("Insurance company name").fill("Aetna");

  await page.getByRole("combobox", { name: "Denial reason" }).click();
  await page.getByPlaceholder("Try CO-50, prior auth").fill("CO-50");
  await page.getByRole("option", { name: /Medical necessity/ }).click();

  await page.getByLabel("Claim number").fill("2026074512300");
  await page.getByLabel("Member ID").fill("W1234567801");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await page
    .getByLabel("Diagnosis and relevant history")
    .fill("Chronic lumbar radiculopathy since 2023 with progressive weakness on examination.");
  await page
    .getByLabel("Symptoms, duration, severity, and functional impact")
    .fill("Pain 7/10 for fourteen weeks. Cannot sit longer than twenty minutes or work a full shift.");
  await page
    .getByLabel("Treatments already tried")
    .fill("Twelve weeks of physical therapy and two epidural steroid injections, neither durable.");
  await page
    .getByLabel("Why the service was necessary now")
    .fill("Imaging is required before surgical referral given the progressive motor deficit.");
  await page.getByRole("button", { name: /^Continue$/ }).click();

  await page.getByLabel("Patient name").fill("John A. Doe");
  await page.getByLabel("Provider name").fill("Jane Smith");
}

test.describe("Journey A: free preview", () => {
  test("generates a letter, shows the opening free, and protects the rest", async ({ page }) => {
    await stubGenerate(page);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Create a Stronger Medical Necessity Appeal Letter" }),
    ).toBeVisible();

    await fillForm(page);
    await page.getByRole("button", { name: "Generate appeal letter" }).click();

    const letter = page.locator("#letter, .letter-type").first();
    await expect(page.getByText("Your draft appeal letter")).toBeVisible({ timeout: 20_000 });

    // The free part is readable. Scoped to the letter itself: the homepage
    // also carries a decorative sample letter, and an unscoped match would
    // pass on that instead of on the real draft.
    await expect(letter.getByText("Dear Appeals Reviewer:")).toBeVisible();
    await expect(letter.getByText(/formal first-level internal appeal/)).toBeVisible();

    // The locked part is nowhere in the DOM, not merely blurred.
    const html = await page.content();
    for (const lockedPhrase of [
      "characterize the compressive lesion",
      "Physical therapy discharge summary",
      "Conservative management has been attempted",
    ]) {
      expect(seed.lockedPlain).toContain(lockedPhrase);
      expect(html).not.toContain(lockedPhrase);
    }

    // The paywall is shown and the exports are disabled.
    await expect(page.getByRole("heading", { name: "Unlock the full letter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Word (.docx)" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "PDF" })).toBeDisabled();

    // Guidance cards reflect the denial reason that was chosen.
    await expect(page.getByText("What to attach")).toBeVisible();
    await expect(page.getByText("Next steps")).toBeVisible();
    await expect(page.getByText(/Request a peer-to-peer review with a board-certified/)).toBeVisible();

    // Nothing was written to browser storage.
    const storage = await page.evaluate(() => ({
      local: Object.keys(window.localStorage),
      session: Object.keys(window.sessionStorage),
    }));
    expect(storage.local).toEqual([]);
    expect(storage.session).toEqual([]);

    await expect(letter).toBeVisible();
  });
});

test.describe("Journey B: unlock and download", () => {
  test("unlocks through the real API and downloads both formats", async ({ page }) => {
    await stubGenerate(page);
    await page.goto("/");
    await fillForm(page);
    await page.getByRole("button", { name: "Generate appeal letter" }).click();
    await expect(page.getByRole("heading", { name: "Unlock the full letter" })).toBeVisible({
      timeout: 20_000,
    });

    // Stand in for the checkout tab: call the real unlock endpoint, then
    // broadcast exactly what that tab would broadcast.
    const unlocked = await page.evaluate(async (draftId) => {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const payload = await response.json();
      if (!payload.ok) return { ok: false, status: response.status, payload };

      const channel = new BroadcastChannel("appealforge:unlock");
      channel.postMessage({ draftId, key: payload.key, entitlement: payload.entitlement });
      channel.close();
      return { ok: true, kind: payload.kind };
    }, seed.payload.draftId);

    expect(unlocked.ok).toBe(true);

    // The locked text now appears, decrypted in the browser.
    await expect(page.getByText(/characterize the compressive lesion/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Physical therapy discharge summary")).toBeVisible();
    await expect(page.getByText("Unlocked", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Word (.docx)" })).toBeEnabled();

    // Both downloads come from the real document endpoints.
    const docxDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Word (.docx)" }).click();
    const docx = await docxDownload;
    expect(docx.suggestedFilename()).toMatch(/^appeal-letter-medical-necessity-\d{4}-\d{2}-\d{2}\.docx$/);

    const pdfDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "PDF" }).click();
    const pdf = await pdfDownload;
    expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);

    // A filename must never carry patient or claim information.
    expect(docx.suggestedFilename()).not.toMatch(/doe|2026074512300|w123/i);
  });

  test("editing the letter changes what gets exported", async ({ page }) => {
    await stubGenerate(page);
    await page.goto("/");
    await fillForm(page);
    await page.getByRole("button", { name: "Generate appeal letter" }).click();
    await expect(page.getByRole("heading", { name: "Unlock the full letter" })).toBeVisible({
      timeout: 20_000,
    });

    await page.evaluate(async (draftId) => {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      const payload = await response.json();
      const channel = new BroadcastChannel("appealforge:unlock");
      channel.postMessage({ draftId, key: payload.key, entitlement: payload.entitlement });
      channel.close();
    }, seed.payload.draftId);

    await expect(page.getByRole("button", { name: "Edit letter" })).toBeEnabled({ timeout: 15_000 });
    await page.getByRole("button", { name: "Edit letter" }).click();

    const editor = page.getByLabel("Edit your letter");
    await expect(editor).toBeVisible();
    await editor.fill("Edited letter body for export verification.\n\nSincerely,\n\nJane Smith, MD");

    let sentLetter = "";
    await page.route("**/api/download", async (route) => {
      sentLetter = JSON.parse(route.request().postData() ?? "{}").letter ?? "";
      await route.continue();
    });

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "PDF" }).click();
    await download;

    expect(sentLetter).toContain("Edited letter body for export verification.");
  });
});

test.describe("Journey E: unauthorised access is refused", () => {
  test("the download endpoint rejects a forged entitlement", async ({ request }) => {
    const response = await request.post("/api/download", {
      data: {
        draftId: seed.payload.draftId,
        entitlement: "forged.entitlement.token.that.is.long.enough.to.pass",
        format: "pdf",
        letter: "Dear Reviewer:\n\nBody text that is long enough to pass the schema check.",
      },
    });
    expect(response.status()).toBe(403);
  });

  test("the unlock endpoint refuses an unknown draft", async ({ request }) => {
    const response = await request.post("/api/unlock", {
      data: { draftId: "unknownDraftId000000" },
    });
    expect(response.status()).toBe(402);
    expect((await response.json()).error.code).toBe("not_entitled");
  });

  test("malformed requests are rejected", async ({ request }) => {
    expect((await request.post("/api/unlock", { data: { draftId: "short" } })).status()).toBe(400);
    expect(
      (await request.post("/api/generate-letter", { data: { form: { insurerName: "" } } })).status(),
    ).toBe(400);
  });
});
