import "server-only";

/**
 * The contract every letter-writing model provider implements.
 *
 * A provider is deliberately thin: it takes the already-built user input,
 * sends it alongside the verbatim system prompt, and reports back the text
 * plus why the model stopped. It does no validation, no retrying for shape,
 * and no logging of prompts or output - all of that stays in one place in
 * generate-letter.ts so every provider behaves identically from outside.
 */

export type ProviderId = "anthropic" | "mistral";

/** Why generation ended. Normalised across providers. */
export type StopReason = "complete" | "refusal" | "truncated";

export interface ProviderResult {
  text: string;
  /** The model that actually answered, which may differ from the one asked for. */
  model: string;
  stop: StopReason;
}

/**
 * A shape correction. The model is told what was structurally wrong with its
 * previous attempt and asked again - it is never given a new fact.
 */
export interface ShapeCorrection {
  issues: string[];
}

export interface LetterProvider {
  readonly id: ProviderId;
  /** Shown in operator-facing output only, never to an end user. */
  readonly label: string;
  /** True when this provider has the credentials it needs. */
  configured(): boolean;
  generate(userInput: string, correction?: ShapeCorrection): Promise<ProviderResult>;
}

/**
 * A provider-level failure, already classified. `fatal` marks a failure that
 * another provider would not fix - a refusal, or input the model will not
 * accept - so the caller stops instead of asking every provider in turn.
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
    readonly retryable: boolean,
    readonly fatal = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/** The correction turn, shared so both providers phrase it identically. */
export function correctionInstruction(issues: string[]): string {
  return [
    "The previous output had these formatting problems:",
    ...issues.map((issue) => `- ${issue}`),
    "",
    "Write the letter again from the same facts. Do not add any fact that is not in the form data block. Output only the letter text.",
  ].join("\n");
}

export const DISCARDED_ATTEMPT_NOTE =
  "[The previous attempt did not follow the required letter format and was discarded.]";

export const MAX_OUTPUT_TOKENS = 16000;
export const REQUEST_TIMEOUT_MS = 120_000;
