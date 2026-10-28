import "server-only";
import { getEnv } from "@/lib/env";
import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { mistralProvider } from "@/lib/ai/providers/mistral";
import type { LetterProvider, ProviderId } from "@/lib/ai/providers/types";

export * from "@/lib/ai/providers/types";

/** Preference order when AI_PROVIDER is "auto". */
const PREFERENCE: readonly LetterProvider[] = [anthropicProvider, mistralProvider];

const BY_ID: Record<ProviderId, LetterProvider> = {
  anthropic: anthropicProvider,
  mistral: mistralProvider,
};

/**
 * The providers to try, in order.
 *
 * "auto" (the default) returns every configured provider, best first, so a
 * deployment whose primary key runs out of credit keeps working instead of
 * going dark. Naming a provider explicitly pins it: no silent failover to a
 * different model than the operator chose.
 *
 * Nothing is charged to the user per attempt - generation happens before any
 * payment - so moving to the next provider can never double-charge anyone.
 */
export function resolveProviders(): LetterProvider[] {
  const choice = getEnv().AI_PROVIDER;
  if (choice === "auto") return PREFERENCE.filter((provider) => provider.configured());
  const pinned = BY_ID[choice];
  return pinned.configured() ? [pinned] : [];
}

/** Operator-facing status for /api/health. Booleans and names, never keys. */
export function providerStatus() {
  const env = getEnv();
  const available = resolveProviders();
  return {
    selection: env.AI_PROVIDER,
    active: available[0]?.id ?? null,
    order: available.map((provider) => provider.id),
    configured: {
      anthropic: anthropicProvider.configured(),
      mistral: mistralProvider.configured(),
    },
    models: {
      anthropic: env.ANTHROPIC_MODEL,
      mistral: env.MISTRAL_MODEL,
    },
  };
}
