import { NextResponse } from "next/server";
import { appealFormSchema } from "@/lib/validation/appeal";
import { generateAppealLetter, LetterGenerationError } from "@/lib/ai/generate-letter";
import { splitLetter, lockedShape } from "@/lib/privacy/letter-split";
import {
  deriveLetterKeyBase64,
  isDraftId,
  newDraftId,
  sealText,
} from "@/lib/security/entitlement";
import { checkEntitlementToken } from "@/lib/billing/entitlements";
import { getSessionFromRequest } from "@/lib/auth/session";
import { callerIp, consume, rateLimitHeaders } from "@/lib/rate-limit";
import { track } from "@/lib/analytics/track";
import { ApiError, fail, handleRouteError, ok, readJson } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate-letter
 *
 * Body: { form, draftId?, entitlement? }
 *
 * Returns the free preview in cleartext and the remainder sealed. The full
 * letter is only ever returned to a caller who already holds an entitlement,
 * and nothing about the request is written to the database.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const started = Date.now();
  let releaseFreeSlot: (() => Promise<void>) | null = null;

  try {
    const body = await readJson<{ form?: unknown; draftId?: unknown; entitlement?: unknown }>(
      request,
    );

    const parsed = appealFormSchema.safeParse(body.form);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new ApiError(400, "invalid_form", issue?.message ?? "Check the form and try again.", {
        field: issue?.path?.[0] ?? null,
      });
    }
    const form = parsed.data;

    const ip = callerIp(request);
    const session = await getSessionFromRequest(request);

    // Does the caller already hold an entitlement? A subscriber, or someone
    // regenerating a letter they have already paid for, must not be charged
    // again and must not be counted against the free allowance.
    const existingDraftId = isDraftId(body.draftId) ? body.draftId : undefined;
    const entitlement = existingDraftId
      ? await checkEntitlementToken(body.entitlement, existingDraftId, session?.userId)
      : { granted: false as const };

    // A ceiling that applies to everyone, as abuse protection.
    const overall = await consume("generate-any", ip);
    if (!overall.allowed) {
      return fail(
        429,
        "rate_limited",
        "That is a lot of letters in a short time. Please wait a little and try again.",
        { resetInSeconds: overall.resetInSeconds },
        rateLimitHeaders(overall),
      );
    }

    let freeRemaining: number | null = null;
    if (!entitlement.granted) {
      const free = await consume("generate-free", ip);
      if (!free.allowed) {
        const hours = Math.max(1, Math.round(free.resetInSeconds / 3600));
        return fail(
          429,
          "free_limit_reached",
          `You have used today's ${free.limit} free drafts. The allowance resets in about ${hours} hour${hours === 1 ? "" : "s"}, or the monthly plan removes the daily cap.`,
          { resetInSeconds: free.resetInSeconds, limit: free.limit },
          rateLimitHeaders(free),
        );
      }
      releaseFreeSlot = free.release;
      freeRemaining = free.remaining;
    }

    await track("letter_generation_requested", form.denialReason);

    const result = await generateAppealLetter(form);
    const { preview, locked, lockedBlocks } = splitLetter(result.letter);

    const draftId = entitlement.granted && existingDraftId ? existingDraftId : newDraftId();
    const sealed = await sealText(draftId, locked);

    // Counters only: an event name and a denial-reason key. No identifiers.
    await track("letter_generation_succeeded", form.denialReason);
    console.log(
      JSON.stringify({
        event: "letter_generated",
        reason: form.denialReason,
        level: form.appealLevel,
        author: form.letterAuthor,
        words: result.validation.wordCount,
        placeholders: result.validation.placeholders.length,
        ms: Date.now() - started,
        entitled: entitlement.granted,
      }),
    );

    return ok({
      draftId,
      preview,
      sealed,
      shape: lockedShape(lockedBlocks),
      wordCount: result.validation.wordCount,
      placeholders: result.validation.placeholders,
      notes: result.validation.notes,
      free: { remaining: freeRemaining },
      // An entitled caller gets the key in the same response, so a regenerate
      // after payment unlocks immediately.
      ...(entitlement.granted ? { key: await deriveLetterKeyBase64(draftId) } : {}),
    });
  } catch (error) {
    // A draft that never arrived must not cost the caller one of their three.
    if (releaseFreeSlot) await releaseFreeSlot();

    if (error instanceof LetterGenerationError) {
      await track("letter_generation_failed");
      console.log(
        JSON.stringify({ event: "letter_generation_failed", code: error.code, ms: Date.now() - started }),
      );
      return fail(error.status, error.code, error.message, { retryable: error.retryable });
    }

    return handleRouteError("generate-letter", error);
  }
}
