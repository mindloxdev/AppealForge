import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Multi-provider behaviour.
 *
 * Both providers are configured and AI_PROVIDER is left at "auto", so these
 * exercise the real selection and failover path. The Anthropic SDK is mocked
 * and Mistral's endpoint is intercepted at `fetch`, so no API call leaves the
 * machine and no money is spent. Synthetic data only.
 */

// Assigned, not defaulted: a real key in .env must never reach a test.
process.env.AI_PROVIDER = "auto";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
process.env.MISTRAL_API_KEY = "mistral-test-key";
process.env.APP_URL ||= "http://localhost:3000";

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

const anthropicCreate = vi.fn();

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

    beta = { messages: { create: anthropicCreate } };
    messages = { create: anthropicCreate };
  }

  return { default: Anthropic, Anthropic };
});

// The mocked error classes take a plain message; the real SDK's constructors
// do not, so they are reached through a narrow shape rather than the real type.
const Anthropic = (await import("@anthropic-ai/sdk")).default as unknown as Record<
  "BadRequestError" | "RateLimitError" | "AuthenticationError" | "APIError",
  new (message: string) => Error
>;
const { generateAppealLetter } = await import("@/lib/ai/generate-letter");
const { SYSTEM_PROMPT } = await import("@/lib/ai/system-prompt");
const { providerStatus } = await import("@/lib/ai/providers");

const validForm = {
  insurerName: "Aetna",
  appealLevel: "first-internal" as const,
  denialReason: "medical-necessity" as const,
  denialReasonOther: "",
  claimNumber: "2026074512300",
  memberId: "W1234567801",
  dateOfService: "2026-03-02",
  denialDate: "2026-03-09",
  cptCodes: "72148",
  icdCodes: "M54.16",
  serviceDescription: "MRI of the lumbar spine without contrast",
  amountBilled: "",
  diagnosisHistory: "Chronic lumbar radiculopathy since 2023 with progressive weakness.",
  symptomsImpact: "Pain 7/10 for fourteen weeks, cannot sit longer than twenty minutes.",
  treatmentsTried: "Twelve weeks of physical therapy and two epidural steroid injections.",
  medicalNecessity: "Imaging is required before surgical referral.",
  clinicalGuideline: "",
  evidenceAvailable: ["clinical-notes"],
  letterAuthor: "provider" as const,
  providerName: "Jane Smith",
  providerCredentials: "MD",
  providerNpi: "",
  practiceName: "Northside Clinic",
  practiceAddress: "12 Main Street, Austin, TX 78701",
  practicePhone: "",
  patientName: "John A. Doe",
  patientDob: "1974-05-06",
  enclosures: ["denial-letter", "clinical-notes"],
};

function anthropicOk(text = letterText) {
  return { stop_reason: "end_turn", model: "claude-test", content: [{ type: "text", text }] };
}

function mistralOk(text = letterText) {
  return new Response(
    JSON.stringify({
      model: "mistral-test",
      choices: [{ finish_reason: "stop", message: { content: text } }],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

const realFetch = globalThis.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  anthropicCreate.mockReset();
  fetchMock = vi.fn(async () => mistralOk());
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

afterAll(() => {
  globalThis.fetch = realFetch;
});

describe("provider selection", () => {
  it("reports both providers as configured, Claude first", () => {
    const status = providerStatus();
    expect(status.configured).toEqual({ anthropic: true, mistral: true });
    expect(status.order).toEqual(["anthropic", "mistral"]);
    expect(status.active).toBe("anthropic");
  });

  it("uses the preferred provider and does not touch the other", async () => {
    anthropicCreate.mockResolvedValue(anthropicOk());

    const result = await generateAppealLetter(validForm);

    expect(result.provider).toBe("anthropic");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("failover", () => {
  it("falls over to Mistral when Anthropic has no credit", async () => {
    anthropicCreate.mockRejectedValue(
      new Anthropic.BadRequestError("Your credit balance is too low to access the Anthropic API."),
    );

    const result = await generateAppealLetter(validForm);

    expect(result.provider).toBe("mistral");
    expect(result.letter).toContain("Dear Appeals Reviewer:");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls over when Anthropic is rate limiting", async () => {
    anthropicCreate.mockRejectedValue(new Anthropic.RateLimitError("slow down"));

    const result = await generateAppealLetter(validForm);

    expect(result.provider).toBe("mistral");
  });

  it("does not route around a refusal", async () => {
    anthropicCreate.mockResolvedValue({
      stop_reason: "refusal",
      model: "claude-test",
      content: [],
    });

    await expect(generateAppealLetter(validForm)).rejects.toMatchObject({ code: "ai_declined" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the last failure when every provider is down", async () => {
    anthropicCreate.mockRejectedValue(new Anthropic.APIError("upstream exploded"));
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));

    await expect(generateAppealLetter(validForm)).rejects.toMatchObject({
      code: "ai_error",
      retryable: true,
    });
  });
});

describe("the Mistral request", () => {
  beforeEach(() => {
    anthropicCreate.mockRejectedValue(new Anthropic.RateLimitError("slow down"));
  });

  it("sends the system prompt verbatim and the form data separately", async () => {
    await generateAppealLetter(validForm);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.mistral.ai/v1/chat/completions");

    const body = JSON.parse(String(init.body));
    const system = body.messages.find((m: { role: string }) => m.role === "system");
    expect(system.content).toBe(SYSTEM_PROMPT);

    // Patient narrative must never be spliced into the system prompt.
    expect(system.content).not.toContain("John A. Doe");
    expect(system.content).not.toContain("radiculopathy");

    const user = body.messages.find((m: { role: string }) => m.role === "user");
    expect(user.content).toContain("<form_data>");
    expect(user.content).toContain("John A. Doe");
  });

  it("never puts a key in the URL or the body", async () => {
    await generateAppealLetter(validForm);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("mistral-test-key");
    expect(String(init.body)).not.toContain("mistral-test-key");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer mistral-test-key");
  });

  it("treats a content filter as a refusal, not an empty draft", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "mistral-test",
          choices: [{ finish_reason: "content_filter", message: { content: "" } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(generateAppealLetter(validForm)).rejects.toMatchObject({ code: "ai_declined" });
  });

  it("treats a truncated draft as retryable rather than returning half a letter", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "mistral-test",
          choices: [{ finish_reason: "length", message: { content: "Dear Appeals Reviewer:" } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(generateAppealLetter(validForm)).rejects.toMatchObject({
      code: "ai_truncated",
      retryable: true,
    });
  });
});
