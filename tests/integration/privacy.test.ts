import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The privacy guarantee, tested rather than asserted.
 *
 * A full cycle is run with distinctive marker strings in every claim field.
 * Afterwards every column of every table is scanned for those markers. If any
 * of them has been persisted anywhere, this fails.
 */

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_tests";
process.env.ANTHROPIC_API_KEY ||= "sk-ant-test-key";

const MARKERS = {
  patientName: "ZZQPATIENTMARKER",
  memberId: "ZZQMEMBERMARKER",
  claimNumber: "ZZQCLAIMMARKER",
  diagnosis: "ZZQDIAGNOSISMARKER",
  symptoms: "ZZQSYMPTOMMARKER",
  insurer: "ZZQINSURERMARKER",
  letterBody: "ZZQLETTERBODYMARKER",
};

const letterText = [
  `Jane Smith, MD\nNorthside Clinic\n12 Main Street`,
  "October 28, 2026",
  `${MARKERS.insurer}\nAppeals Department\n[INSURER APPEALS ADDRESS]`,
  `RE: Patient ${MARKERS.patientName}; Member ID ${MARKERS.memberId}; Claim ${MARKERS.claimNumber}`,
  "Dear Appeals Reviewer:",
  `This letter is a formal first-level internal appeal. ${`The record documents ${MARKERS.diagnosis}. `.repeat(20)}`,
  `${MARKERS.letterBody} ${"Conservative care failed over fourteen weeks of therapy. ".repeat(20)}`,
  `I request that the plan overturn the denial and pay the claim. ${"A peer-to-peer review with a board-certified physician is requested. ".repeat(12)}`,
  "Enclosures:\n- Denial letter or EOB",
  "Sincerely,\n\nJane Smith, MD",
].join("\n\n");

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {}
  class Anthropic {
    static APIError = APIError;
    static BadRequestError = class extends APIError {};
    static AuthenticationError = class extends APIError {};
    static RateLimitError = class extends APIError {};
    static APIConnectionTimeoutError = class extends APIError {};
    beta = { messages: { create: createMock } };
    messages = { create: createMock };
  }
  return { default: Anthropic, Anthropic };
});

const { prisma } = await import("@/lib/db/prisma");
const { POST: generateLetter } = await import("@/app/api/generate-letter/route");
const { POST: unlock } = await import("@/app/api/unlock/route");
const { POST: download } = await import("@/app/api/download/route");
const { PurchaseStatus } = await import("@/generated/prisma");
const { unsealText } = await import("@/lib/security/entitlement");

beforeEach(() => {
  createMock.mockReset();
  createMock.mockResolvedValue({
    stop_reason: "end_turn",
    model: "claude-test",
    content: [{ type: "text", text: letterText }],
  });
});

afterAll(async () => {
  await prisma.purchase.deleteMany({ where: { stripeSessionId: { startsWith: "cs_test_privacy" } } });
  await prisma.rateLimit.deleteMany({});
  await prisma.$disconnect();
});

function request(path: string, body: unknown): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.77" },
    body: JSON.stringify(body),
  });
}

describe("claim data is never persisted", () => {
  it("survives a full generate, pay, unlock and download cycle with nothing stored", async () => {
    const form = {
      insurerName: MARKERS.insurer,
      appealLevel: "first-internal",
      denialReason: "medical-necessity",
      claimNumber: MARKERS.claimNumber,
      memberId: MARKERS.memberId,
      dateOfService: "2026-03-02",
      denialDate: "2026-03-09",
      cptCodes: "72148",
      icdCodes: "M54.16",
      serviceDescription: "MRI lumbar spine",
      diagnosisHistory: `${MARKERS.diagnosis} with progressive weakness documented since 2023.`,
      symptomsImpact: `${MARKERS.symptoms} rated 7 of 10 for fourteen weeks.`,
      treatmentsTried: "Physical therapy and injections.",
      medicalNecessity: "Imaging is required before surgical referral.",
      letterAuthor: "provider",
      providerName: "Jane Smith",
      patientName: MARKERS.patientName,
      patientDob: "1974-05-06",
      enclosures: ["denial-letter"],
    };

    // 1. Generate.
    const generated = await (await generateLetter(request("/api/generate-letter", { form }))).json();
    expect(generated.ok).toBe(true);

    // 2. A paid purchase, as the webhook would record it.
    await prisma.purchase.create({
      data: {
        draftId: generated.draftId,
        stripeSessionId: `cs_test_privacy_${Date.now()}`,
        amountTotal: 1200,
        currency: "usd",
        status: PurchaseStatus.PAID,
        paidAt: new Date(),
      },
    });

    // 3. Unlock and 4. download, which is where a careless implementation would
    // persist the letter.
    const unlocked = await (await unlock(request("/api/unlock", { draftId: generated.draftId }))).json();
    const locked = await unsealText(unlocked.key, generated.sealed);
    const full = `${generated.preview}\n\n${locked}`;
    expect(full).toContain(MARKERS.letterBody);

    for (const format of ["docx", "pdf"] as const) {
      const response = await download(
        request("/api/download", {
          draftId: generated.draftId,
          entitlement: unlocked.entitlement,
          format,
          letter: full,
          denialReason: "medical-necessity",
        }),
      );
      expect(response.status).toBe(200);
    }

    // Now scan every table for every marker.
    const found = await scanDatabaseFor(Object.values(MARKERS));
    expect(found).toEqual([]);
  });

  it("keeps claim data out of the purchase row that unlocks the letter", async () => {
    const purchase = await prisma.purchase.findFirst({
      where: { stripeSessionId: { startsWith: "cs_test_privacy" } },
    });
    expect(purchase).not.toBeNull();

    const serialized = JSON.stringify(purchase);
    for (const marker of Object.values(MARKERS)) {
      expect(serialized).not.toContain(marker);
    }
    // The draft id is random and says nothing about the letter.
    expect(purchase!.draftId).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
  });
});

/**
 * Walks every text-ish column of every table in the public schema and looks for
 * any of the markers.
 */
async function scanDatabaseFor(markers: string[]): Promise<string[]> {
  const columns = await prisma.$queryRaw<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
  `;

  const hits: string[] = [];

  for (const column of columns) {
    for (const marker of markers) {
      const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*)::bigint AS count FROM "${column.table_name}" WHERE "${column.column_name}"::text ILIKE $1`,
        `%${marker}%`,
      );
      if (Number(rows[0]?.count ?? 0) > 0) {
        hits.push(`${column.table_name}.${column.column_name} contains ${marker}`);
      }
    }
  }

  return hits;
}
