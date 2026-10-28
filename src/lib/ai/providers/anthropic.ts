import "server-only";
import Anthropic from "@anthropic-ai/sdk";
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
 * Claude, via the Anthropic Messages API. The default provider.
 *
 * The system prompt is sent verbatim in the `system` field and never has user
 * content spliced into it; form values travel in a separate fenced user
 * message. Nothing here logs the prompt, the form, or the letter.
 */

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

interface LetterMessage {
  stop_reason: string | null;
  model: string;
  content: Array<{ type: string; text?: string }>;
}

function textFrom(message: { content: Array<{ type: string; text?: string }> }): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();
}

function client(): Anthropic {
  const env = getEnv();
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    // The SDK's own retries only fire on connection errors and 429/5xx, before
    // any output exists. One is enough.
    maxRetries: 1,
    timeout: REQUEST_TIMEOUT_MS,
  });
}

function messagesFor(userInput: string, correction?: ShapeCorrection) {
  if (!correction) return [{ role: "user" as const, content: userInput }];
  return [
    { role: "user" as const, content: userInput },
    { role: "assistant" as const, content: DISCARDED_ATTEMPT_NOTE },
    { role: "user" as const, content: correctionInstruction(correction.issues) },
  ];
}

export const anthropicProvider: LetterProvider = {
  id: "anthropic",
  label: "Claude",

  configured() {
    return getEnv().ANTHROPIC_API_KEY.length > 0;
  },

  async generate(userInput, correction): Promise<ProviderResult> {
    const env = getEnv();
    const anthropic = client();

    const request = {
      model: env.ANTHROPIC_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      // Letter drafting is a routine generation task; medium effort is the
      // cost and latency sweet spot and thinking stays on by default.
      output_config: { effort: "medium" as const },
      system: [
        {
          type: "text" as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" as const },
        },
      ],
      messages: messagesFor(userInput, correction),
    };

    let message: LetterMessage;
    try {
      // Server-side fallbacks: if a safety classifier declines the request, the
      // API re-runs it on Anthropic's recommended fallback model in the same call.
      message = (await anthropic.beta.messages.create({
        ...request,
        betas: [FALLBACK_BETA],
        fallbacks: "default",
      } as Parameters<typeof anthropic.beta.messages.create>[0])) as unknown as LetterMessage;
    } catch (error) {
      if (error instanceof Anthropic.BadRequestError) {
        try {
          // An account or model without server-side fallbacks should not take
          // the whole product down - retry once on the plain endpoint.
          message = (await anthropic.messages.create(
            request as Parameters<typeof anthropic.messages.create>[0],
          )) as unknown as LetterMessage;
        } catch (retryError) {
          throw translate(retryError);
        }
      } else {
        throw translate(error);
      }
    }

    // Always check stop_reason before reading content.
    if (message.stop_reason === "refusal") {
      return { text: "", model: message.model, stop: "refusal" };
    }
    if (message.stop_reason === "max_tokens") {
      return { text: textFrom(message), model: message.model, stop: "truncated" };
    }
    return { text: textFrom(message), model: message.model, stop: "complete" };
  },
};

function translate(error: unknown): ProviderError {
  if (error instanceof Anthropic.AuthenticationError) {
    return new ProviderError("Anthropic rejected the API key.", "ai_unauthorized", 503, false);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new ProviderError("Anthropic is rate limiting this key.", "ai_busy", 429, true);
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new ProviderError("Anthropic timed out.", "ai_timeout", 504, true);
  }
  if (error instanceof Anthropic.BadRequestError) {
    // An exhausted credit balance arrives as a 400, not a 402 or a 401. Left
    // unclassified it reads to the user as "your form was rejected", which
    // blames them for an operator problem.
    if (/credit balance|billing|purchase credits|quota/i.test(error.message)) {
      return new ProviderError("Anthropic credit exhausted.", "ai_unavailable", 503, true);
    }
    // A genuine request-shape rejection is fatal: no other provider helps.
    return new ProviderError("Anthropic rejected the request.", "ai_rejected", 400, false, true);
  }
  if (error instanceof Anthropic.APIError) {
    return new ProviderError("Anthropic returned an error.", "ai_error", 502, true);
  }
  return new ProviderError("Anthropic request failed.", "ai_error", 502, true);
}
