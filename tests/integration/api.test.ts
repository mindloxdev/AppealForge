import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route-level tests against the real database.
 *
 * The Anthropic SDK is mocked so no API call is made and no money is spent;
 * everything else - validation, rate limiting, entitlement checks, document
 * generation, Prisma - runs for real.
 */

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_tests";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_test_dummy_for_tests";
process.env.APP_URL ||= "http://localhost:3000";

// Assigned, not defaulted: a real key in .env must never reach a test. These
// pin the run to the single mocked provider, so a generation failure here is
// a failure, not a silent failover to a live API that would cost money.
process.env.AI_PROVIDER = "anthropic";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
process.env.MISTRAL_API_KEY = "";

const letterText = [
  "Jane Smith, MD\nNorthside Clinic\n12 Main Street\nAustin, TX 78701",
  "October 28, 2026",
  "Aetna\nAppeals Department\n[INSURER APPEALS ADDRESS]",
  "RE: Patient John A. Doe; DOB May 6, 1974; Member ID W1234567801; Claim 2026074512300; Date of service March 2, 2026; CPT 72148; Denial reason medical necessity (CO-50)",
  "Dear Appeals Reviewer:",
  `This letter is a formal first-level internal appeal of the denial dated March 9, 2026. ${"The documented findings support the service. ".repeat(14)}`,
  `Conservative management has failed. ${"Physical therapy and injections gave no durable relief. ".repeat(14)}`,
  `I request that the plan overturn the denial and pay the claim. ${"A peer-to-peer review with a board-certified physician is requested. ".repeat(8)}`,
  "Enclosures:\n- Denial letter or EOB\n- Relevant clinical notes",
  "Sincerely,\n\nJane Smith, MD\nNPI [PROVIDER NPI]",
].join("\n\n");

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {}
  class BadRequestError extends APIError {}
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  class APIConnectionTimeoutError extends APIError {}

  class Anthropic {
    static APIError = APIError;
    static BadRequestError = BadRequestError;
    static AuthenticationError = AuthenticationError;
    static RateLimitError = RateLimitError;
    static APIConnectionTimeoutError = APIConnectionTimeoutError;

    beta = { messages: { create: createMock } };
    messages = { create: createMock };
  }

  return { default: Anthropic, Anthropic };
});

const { prisma } = await import("@/lib/db/prisma");
const { POST: generateLetter } = await import("@/app/api/generate-letter/route");
const { POST: unlock } = await import("@/app/api/unlock/route");
const { POST: download } = await import("@/app/api/download/route");
const { POST: leads } = await import("@/app/api/leads/route");
const { POST: stripeWebhook } = await import("@/app/api/stripe-webhook/route");
const { GET: health } = await import("@/app/api/health/route");
const { PurchaseStatus } = await import("@/generated/prisma");

let ipCounter = 0;

function nextIp(): string {
  ipCounter += 1;
  return `198.51.100.${ipCounter % 250}`;
}

function request(path: string, body: unknown, ip = nextIp()): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const validForm = {
  insurerName: "Aetna",
  appealLevel: "first-internal",
  denialReason: "medical-necessity",
  claimNumber: "2026074512300",
  memberId: "W1234567801",
  dateOfService: "2026-03-02",
  denialDate: "2026-03-09",
  cptCodes: "72148",
  icdCodes: "M54.16",
  serviceDescription: "MRI of the lumbar spine without contrast",
  diagnosisHistory: "Chronic lumbar radiculopathy since 2023 with progressive weakness.",
  symptomsImpact: "Pain 7/10 for fourteen weeks, cannot sit longer than twenty minutes.",
  treatmentsTried: "Twelve weeks of physical therapy and two epidural steroid injections.",
  medicalNecessity: "Imaging is required before surgical referral.",
  letterAuthor: "provider",
  providerName: "Jane Smith",
  providerCredentials: "MD",
  patientName: "John A. Doe",
  patientDob: "1974-05-06",
  enclosures: ["denial-letter", "clinical-notes"],
  evidenceAvailable: ["clinical-notes"],
};

function modelResponse(text = letterText) {
  return {
    stop_reason: "end_turn",
    model: "claude-test",
    content: [{ type: "text", text }],
  };
}

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
});

beforeEach(() => {
  createMock.mockReset();
  createMock.mockResolvedValue(modelResponse());
});

afterEach(async () => {
  await prisma.rateLimit.deleteMany({});
});

afterAll(async () => {
  await prisma.purchase.deleteMany({ where: { stripeSessionId: { startsWith: "cs_test_vitest" } } });
  await prisma.webhookEvent.deleteMany({ where: { id: { startsWith: "evt_vitest" } } });
  await prisma.lead.deleteMany({ where: { email: { endsWith: "@vitest.example" } } });
  await prisma.rateLimit.deleteMany({});
  await prisma.$disconnect();
});

// --- health ----------------------------------------------------------------

describe("GET /api/health", () => {
  it("reports configuration as booleans and reaches the database", async () => {
    const response = await health();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.config.database).toBe(true);
    expect(JSON.stringify(body)).not.toContain("sk-ant");
    expect(JSON.stringify(body)).not.toContain("sk_test");
  });
});

// --- generate --------------------------------------------------------------

describe("POST /api/generate-letter", () => {
  it("returns the preview in clear and the rest sealed", async () => {
    const response = await generateLetter(request("/api/generate-letter", { form: validForm }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.draftId).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    expect(body.preview).toContain("Dear Appeals Reviewer:");
    expect(body.sealed.iv).toBeTruthy();
    expect(body.sealed.ciphertext).toBeTruthy();
    expect(body.shape.length).toBeGreaterThanOrEqual(2);

    // The locked half must not be recoverable from the response.
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("peer-to-peer review with a board-certified");
    expect(serialized).not.toContain("Enclosures:");
    expect(body.key).toBeUndefined();
  });

  it("sends a fenced, labelled block and never splices the form into the system prompt", async () => {
    await generateLetter(request("/api/generate-letter", { form: validForm }));

    const call = createMock.mock.calls[0]![0];
    const system = Array.isArray(call.system) ? call.system[0].text : call.system;
    const userMessage = call.messages[0].content as string;

    expect(system).toMatch(/^You write formal appeal letters to US health insurers/);
    expect(system).not.toContain("Aetna");
    expect(userMessage).toContain("<form_data>");
    expect(userMessage).toContain("INSURER NAME: Aetna");
    expect(userMessage).toContain("DENIAL REASON: Medical necessity (CARC CO-50)");
    expect(userMessage).toContain("AMOUNT BILLED: MISSING");
  });

  it("rejects an invalid form before calling the model", async () => {
    const response = await generateLetter(
      request("/api/generate-letter", { form: { ...validForm, insurerName: "" } }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_form");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("enforces the free daily allowance per caller", async () => {
    const ip = "203.0.113.42";
    const limit = Number(process.env.FREE_PREVIEWS_PER_DAY ?? 3);

    for (let i = 0; i < limit; i += 1) {
      const ok = await generateLetter(request("/api/generate-letter", { form: validForm }, ip));
      expect(ok.status).toBe(200);
    }

    const blocked = await generateLetter(request("/api/generate-letter", { form: validForm }, ip));
    expect(blocked.status).toBe(429);
    const body = await blocked.json();
    expect(body.error.code).toBe("free_limit_reached");
    expect(body.error.resetInSeconds).toBeGreaterThan(0);
  });

  it("gives the free draft back when generation fails", async () => {
    const ip = "203.0.113.77";
    createMock.mockRejectedValue(new Error("upstream exploded"));

    const failed = await generateLetter(request("/api/generate-letter", { form: validForm }, ip));
    expect(failed.status).toBeGreaterThanOrEqual(500);

    createMock.mockResolvedValue(modelResponse());
    for (let i = 0; i < 3; i += 1) {
      const ok = await generateLetter(request("/api/generate-letter", { form: validForm }, ip));
      expect(ok.status).toBe(200);
    }
  });

  it("surfaces a refusal as a clean error", async () => {
    createMock.mockResolvedValue({ stop_reason: "refusal", model: "claude-test", content: [] });
    const response = await generateLetter(request("/api/generate-letter", { form: validForm }));
    expect(response.status).toBe(422);
    expect((await response.json()).error.code).toBe("ai_declined");
  });
});

// --- unlock and download ---------------------------------------------------

describe("unlock and download", () => {
  async function generateDraft() {
    const response = await generateLetter(request("/api/generate-letter", { form: validForm }));
    return response.json();
  }

  it("refuses to release a key without an entitlement", async () => {
    const draft = await generateDraft();
    const response = await unlock(request("/api/unlock", { draftId: draft.draftId }));
    expect(response.status).toBe(402);
    expect((await response.json()).error.code).toBe("not_entitled");
  });

  it("releases the key once a paid purchase exists, and the letter decrypts", async () => {
    const draft = await generateDraft();

    await prisma.purchase.create({
      data: {
        draftId: draft.draftId,
        stripeSessionId: `cs_test_vitest_${Date.now()}`,
        amountTotal: 1200,
        currency: "usd",
        status: PurchaseStatus.PAID,
        paidAt: new Date(),
      },
    });

    const response = await unlock(request("/api/unlock", { draftId: draft.draftId }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.kind).toBe("purchase");

    const { unsealText } = await import("@/lib/security/entitlement");
    const locked = await unsealText(body.key, draft.sealed);
    expect(locked).toContain("overturn the denial");

    // And the download endpoint accepts that entitlement.
    const full = `${draft.preview}\n\n${locked}`;
    const docx = await download(
      request("/api/download", {
        draftId: draft.draftId,
        entitlement: body.entitlement,
        format: "docx",
        letter: full,
        denialReason: "medical-necessity",
      }),
    );
    expect(docx.status).toBe(200);
    expect(docx.headers.get("content-type")).toContain("wordprocessingml");
    expect(docx.headers.get("content-disposition")).toContain("appeal-letter-medical-necessity");
    const docxBytes = Buffer.from(await docx.arrayBuffer());
    expect(docxBytes.subarray(0, 2).toString("latin1")).toBe("PK");

    const pdf = await download(
      request("/api/download", {
        draftId: draft.draftId,
        entitlement: body.entitlement,
        format: "pdf",
        letter: full,
      }),
    );
    expect(pdf.status).toBe(200);
    const pdfBytes = Buffer.from(await pdf.arrayBuffer());
    expect(pdfBytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("rejects a download with a forged or mismatched entitlement", async () => {
    const draft = await generateDraft();

    const forged = await download(
      request("/api/download", {
        draftId: draft.draftId,
        entitlement: "not.a.real.token.at.all.1234567890",
        format: "pdf",
        letter: letterText,
      }),
    );
    expect(forged.status).toBe(403);

    // A token issued for a different draft must not work here either.
    const { issuePurchaseEntitlement } = await import("@/lib/security/entitlement");
    const otherToken = await issuePurchaseEntitlement("someOtherDraftId1234");
    const mismatched = await download(
      request("/api/download", {
        draftId: draft.draftId,
        entitlement: otherToken,
        format: "pdf",
        letter: letterText,
      }),
    );
    expect(mismatched.status).toBe(403);
  });
});

// --- leads -----------------------------------------------------------------

describe("POST /api/leads", () => {
  it("stores a consented lead", async () => {
    const email = `biller-${Date.now()}@vitest.example`;
    const response = await leads(
      request("/api/leads", {
        name: "Pat Reyes",
        organization: "Northside Billing",
        email,
        phone: "555-0100",
        monthlyClaimVolume: "800",
        primaryChallenge: "Medical necessity denials from one payer",
        consent: true,
        sourcePath: "/for-medical-billers",
      }),
    );

    expect(response.status).toBe(200);
    const row = await prisma.lead.findFirst({ where: { email } });
    expect(row?.organization).toBe("Northside Billing");
    expect(row?.consentedAt).toBeInstanceOf(Date);
  });

  it("drops honeypot submissions without storing them", async () => {
    const email = `bot-${Date.now()}@vitest.example`;
    const response = await leads(
      request("/api/leads", { name: "Bot", email, consent: true, company: "spam" }),
    );
    expect(response.status).toBe(200);
    expect(await prisma.lead.findFirst({ where: { email } })).toBeNull();
  });

  it("requires consent and a valid email", async () => {
    const noConsent = await leads(
      request("/api/leads", { name: "Pat", email: "pat@vitest.example" }),
    );
    expect(noConsent.status).toBe(400);

    const badEmail = await leads(
      request("/api/leads", { name: "Pat", email: "not-an-email", consent: true }),
    );
    expect(badEmail.status).toBe(400);
  });
});

// --- stripe webhook --------------------------------------------------------

describe("POST /api/stripe-webhook", () => {
  async function signedRequest(event: Record<string, unknown>) {
    const Stripe = (await import("stripe")).default;
    const payload = JSON.stringify(event);
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });
    return new Request("http://localhost:3000/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": header, "content-type": "application/json" },
      body: payload,
    });
  }

  it("rejects an unsigned or badly signed payload", async () => {
    const unsigned = new Request("http://localhost:3000/api/stripe-webhook", {
      method: "POST",
      body: JSON.stringify({ id: "evt_vitest_nope", type: "checkout.session.completed" }),
    });
    expect((await stripeWebhook(unsigned)).status).toBe(400);

    const wrongSignature = new Request("http://localhost:3000/api/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=deadbeef" },
      body: JSON.stringify({ id: "evt_vitest_nope2" }),
    });
    expect((await stripeWebhook(wrongSignature)).status).toBe(400);
  });

  it("records a paid purchase and ignores a duplicate delivery", async () => {
    const draftId = "webhookDraftId123456";
    const sessionId = `cs_test_vitest_${Date.now()}`;
    const event = {
      id: `evt_vitest_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          mode: "payment",
          payment_status: "paid",
          amount_total: 1200,
          currency: "usd",
          metadata: { draftId, plan: "single" },
          client_reference_id: draftId,
          payment_intent: "pi_test_vitest",
        },
      },
    };

    const first = await stripeWebhook(await signedRequest(event));
    expect(first.status).toBe(200);

    const purchase = await prisma.purchase.findUnique({ where: { draftId } });
    expect(purchase?.status).toBe(PurchaseStatus.PAID);
    expect(purchase?.paidAt).toBeInstanceOf(Date);

    const second = await stripeWebhook(await signedRequest(event));
    expect((await second.json()).duplicate).toBe(true);

    const count = await prisma.purchase.count({ where: { draftId } });
    expect(count).toBe(1);

    await prisma.purchase.deleteMany({ where: { draftId } });
  });
});
