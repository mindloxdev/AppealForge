import "server-only";
import { buildLetterInput } from "@/lib/ai/build-input";
import { cleanLetter, validateLetter, type LetterValidation } from "@/lib/ai/validate-output";
import {
  ProviderError,
  resolveProviders,
  type LetterProvider,
  type ProviderResult,
} from "@/lib/ai/providers";
import type { AppealFormData } from "@/lib/validation/appeal";

/**
 * Letter generation, across whichever model providers are configured.
 *
 * - API keys stay on the server; this module is server-only.
 * - The system prompt is used verbatim by every provider and never has user
 *   content spliced into it. Form values travel in a separate, fenced message.
 * - Nothing here logs the prompt, the form, or the letter. Only counts.
 * - One shape correction at most per provider, and only for a failure that
 *   produced no usable letter. Generation always happens before payment, so
 *   neither failover nor correction can ever charge a user twice.
 */

export class LetterGenerationError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "LetterGenerationError";
  }
}

export interface GeneratedLetter {
  letter: string;
  validation: LetterValidation;
  model: string;
  /** Which provider answered. Operator-facing; never shown to an end user. */
  provider: string;
  elapsedMs: number;
}

/** User-facing wording, kept in one place so every provider reads the same. */
const MESSAGES: Record<string, string> = {
  ai_unconfigured: "The letter writer is not configured on this deployment yet.",
  ai_unauthorized: "The letter writer is not configured correctly.",
  ai_unavailable:
    "The letter writer is unavailable right now. Nothing was charged - please try again later.",
  ai_busy: "The letter writer is busy right now. Please try again in a moment.",
  ai_timeout: "The letter writer took too long to respond. Nothing was charged - please try again.",
  ai_rejected: "That request could not be drafted as submitted.",
  ai_declined:
    "The writer declined this request. Review the clinical details for anything unexpected and try again.",
  ai_truncated: "The draft was cut off. Shorten the clinical sections and try again.",
  ai_empty: "The draft came back empty. Please try again.",
  ai_invalid_output: "The draft did not come back as a complete letter. Please try again.",
  ai_error: "The letter writer had a problem. Please try again.",
};

function userFacing(error: ProviderError): LetterGenerationError {
  return new LetterGenerationError(
    MESSAGES[error.code] ?? MESSAGES.ai_error,
    error.code,
    error.status,
    error.retryable,
  );
}

export async function generateAppealLetter(form: AppealFormData): Promise<GeneratedLetter> {
  const providers = resolveProviders();
  if (providers.length === 0) {
    throw new LetterGenerationError(MESSAGES.ai_unconfigured, "ai_unconfigured", 503, false);
  }

  const started = Date.now();
  const userInput = buildLetterInput(form);
  let lastError: LetterGenerationError | null = null;

  for (const provider of providers) {
    try {
      return await attempt(provider, form, userInput, started);
    } catch (error) {
      const translated =
        error instanceof ProviderError
          ? userFacing(error)
          : error instanceof LetterGenerationError
            ? error
            : new LetterGenerationError(MESSAGES.ai_error, "ai_error", 502, true);

      // A refusal or a rejected request is a decision about this input, not an
      // outage. Asking a different model to do what the first one declined
      // would be routing around a safety judgement, so it stops here.
      const fatal =
        (error instanceof ProviderError && error.fatal) ||
        translated.code === "ai_declined" ||
        translated.code === "ai_rejected";
      if (fatal) throw translated;

      lastError = translated;
      // Try the next configured provider, if there is one.
    }
  }

  throw lastError ?? new LetterGenerationError(MESSAGES.ai_error, "ai_error", 502, true);
}

async function attempt(
  provider: LetterProvider,
  form: AppealFormData,
  userInput: string,
  started: number,
): Promise<GeneratedLetter> {
  const result = await provider.generate(userInput);
  const letter = usable(result);

  const validation = validateLetter(letter, form);
  if (validation.ok) {
    return {
      letter,
      validation,
      model: result.model,
      provider: provider.id,
      elapsedMs: Date.now() - started,
    };
  }

  // One controlled correction attempt. The model is told what was wrong about
  // the shape of its output - never given new facts.
  const corrected = await retryForShape(provider, userInput, validation.issues);
  if (corrected) {
    const revalidated = validateLetter(corrected, form);
    if (revalidated.ok) {
      return {
        letter: corrected,
        validation: revalidated,
        model: result.model,
        provider: provider.id,
        elapsedMs: Date.now() - started,
      };
    }
  }

  throw new LetterGenerationError(MESSAGES.ai_invalid_output, "ai_invalid_output", 502, true);
}

/** Turns a provider result into letter text, or throws with the reason it cannot. */
function usable(result: ProviderResult): string {
  if (result.stop === "refusal") {
    throw new LetterGenerationError(MESSAGES.ai_declined, "ai_declined", 422, false);
  }
  if (result.stop === "truncated") {
    throw new LetterGenerationError(MESSAGES.ai_truncated, "ai_truncated", 502, true);
  }
  const letter = cleanLetter(result.text);
  if (!letter) {
    throw new LetterGenerationError(MESSAGES.ai_empty, "ai_empty", 502, true);
  }
  return letter;
}

async function retryForShape(
  provider: LetterProvider,
  userInput: string,
  issues: string[],
): Promise<string | null> {
  try {
    const result = await provider.generate(userInput, { issues });
    if (result.stop === "refusal") return null;
    return cleanLetter(result.text) || null;
  } catch {
    return null;
  }
}
