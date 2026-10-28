import "server-only";
import { getEnv } from "@/lib/env";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import {
  correctionInstruction,
  DISCARDED_ATTEMPT_NOTE,
  MAX_OUTPUT_TOKENS,
  ProviderError,
  REQUEST_TIMEOUT_MS,
  type LetterProvider,
  type ProviderResult,
  type ShapeCorrection,
} from "@/lib/ai/providers/types";

/**
 * Mistral, via the chat completions API.
 *
 * Called over plain fetch rather than a vendor SDK: the surface used here is
 * one POST, and a dependency that ships its own HTTP stack would be more code
 * to audit for a module that handles patient narrative. The same verbatim
 * system prompt is sent as the system message, so a letter drafted here obeys
 * exactly the same rules as one drafted by Claude.
 */

const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

interface ChatCompletion {
  model?: string;
  choices?: Array<{
    finish_reason?: string | null;
    message?: { content?: string | null };
  }>;
}

function messagesFor(userInput: string, correction?: ShapeCorrection) {
  const base = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userInput },
  ];
  if (!correction) return base;
  return [
    ...base,
    { role: "assistant" as const, content: DISCARDED_ATTEMPT_NOTE },
    { role: "user" as const, content: correctionInstruction(correction.issues) },
  ];
}

export const mistralProvider: LetterProvider = {
  id: "mistral",
  label: "Mistral",

  configured() {
    return getEnv().MISTRAL_API_KEY.length > 0;
  },

  async generate(userInput, correction): Promise<ProviderResult> {
    const env = getEnv();

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.MISTRAL_API_KEY}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          model: env.MISTRAL_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          // Letters are formal documents, not creative writing. Low but not
          // zero: deterministic output makes every letter read identically.
          temperature: 0.3,
          messages: messagesFor(userInput, correction),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new ProviderError("Mistral timed out.", "ai_timeout", 504, true);
      }
      throw new ProviderError("Mistral could not be reached.", "ai_error", 502, true);
    }

    if (!response.ok) {
      // The body is read for classification only - never logged, because a
      // provider echoing request content back would put form data in the logs.
      throw classify(response.status, await safeText(response));
    }

    let payload: ChatCompletion;
    try {
      payload = (await response.json()) as ChatCompletion;
    } catch {
      throw new ProviderError("Mistral returned an unreadable response.", "ai_error", 502, true);
    }

    const choice = payload.choices?.[0];
    const model = payload.model ?? env.MISTRAL_MODEL;
    const text = (choice?.message?.content ?? "").trim();

    // Check why it stopped before trusting the content.
    const finish = choice?.finish_reason ?? null;
    if (finish === "content_filter") {
      return { text: "", model, stop: "refusal" };
    }
    if (finish === "length") {
      return { text, model, stop: "truncated" };
    }
    return { text, model, stop: "complete" };
  },
};

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 400);
  } catch {
    return "";
  }
}

function classify(status: number, body: string): ProviderError {
  if (status === 401 || status === 403) {
    return new ProviderError("Mistral rejected the API key.", "ai_unauthorized", 503, false);
  }
  if (status === 429) {
    // Mistral returns 429 both for genuine rate limiting and for a tier that
    // has no capacity for the requested model. Both mean "try elsewhere".
    return new ProviderError("Mistral is rate limiting this key.", "ai_busy", 429, true);
  }
  if (status === 402 || /credit|quota|billing|subscription/i.test(body)) {
    return new ProviderError("Mistral quota exhausted.", "ai_unavailable", 503, true);
  }
  if (status === 400 || status === 422) {
    return new ProviderError("Mistral rejected the request.", "ai_rejected", 400, false, true);
  }
  return new ProviderError("Mistral returned an error.", "ai_error", 502, true);
}
