import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { PurchaseStatus } from "@/generated/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import {
  activeSubscriptionFor,
  checkEntitlementForDraft,
} from "@/lib/billing/entitlements";
import {
  deriveLetterKeyBase64,
  isDraftId,
  issuePurchaseEntitlement,
  issueSubscriptionEntitlement,
} from "@/lib/security/entitlement";
import { callerIp, consume, rateLimitHeaders } from "@/lib/rate-limit";
import { ApiError, fail, handleRouteError, ok, readJson } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  draftId: z.string().refine(isDraftId, "That draft is no longer in this browser."),
  sessionId: z
    .string()
    .regex(/^cs_[A-Za-z0-9_]{8,255}$/, "That checkout reference is not valid.")
    .optional(),
});

/**
 * POST /api/unlock
 *
 * Releases the decryption key for one draft, and only after the server has
 * confirmed an entitlement: a paid purchase recorded for this draft id, or a
 * live subscription on the signed-in account.
 *
 * When the browser returns from Stripe before the webhook lands, the session is
 * verified directly with Stripe and the purchase is recorded here. The redirect
 * itself still grants nothing - Stripe's own answer does.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      throw new ApiError(400, "invalid_request", parsed.error.issues[0]!.message);
    }
    const { draftId, sessionId } = parsed.data;

    const limit = await consume("unlock", callerIp(request));
    if (!limit.allowed) {
      return fail(
        429,
        "rate_limited",
        "Too many unlock attempts. Please wait a few minutes.",
        { resetInSeconds: limit.resetInSeconds },
        rateLimitHeaders(limit),
      );
    }

    const session = await getSessionFromRequest(request);
    let check = await checkEntitlementForDraft(draftId, session?.userId);

    if (!check.granted && sessionId) {
      check = await settleFromStripe(sessionId, draftId, session?.userId);
    }

    if (!check.granted) {
      if (sessionId) {
        throw new ApiError(
          402,
          "payment_incomplete",
          "Stripe has not confirmed that payment yet. Wait a few seconds and reload this page.",
        );
      }
      throw new ApiError(
        402,
        "not_entitled",
        "This letter has not been unlocked yet.",
      );
    }

    const entitlement =
      check.kind === "subscription" && check.subscriptionId
        ? await issueSubscriptionEntitlement(check.subscriptionId)
        : await issuePurchaseEntitlement(draftId);

    return ok({
      key: await deriveLetterKeyBase64(draftId),
      entitlement,
      kind: check.kind,
    });
  } catch (error) {
    return handleRouteError("unlock", error);
  }
}

/**
 * Verify a checkout session with Stripe and record the purchase. Idempotent:
 * the unique stripeSessionId means the webhook and this path converge on one
 * row whichever arrives first.
 */
async function settleFromStripe(
  sessionId: string,
  draftId: string,
  userId: string | undefined,
) {
  const checkout = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const metadataDraft = checkout.metadata?.draftId ?? checkout.client_reference_id;

  if (checkout.mode === "payment") {
    if (checkout.payment_status !== "paid") return { granted: false as const };
    if (metadataDraft !== draftId) {
      throw new ApiError(
        403,
        "draft_mismatch",
        "That payment belongs to a different letter. Open the tab where you generated it, or use the monthly plan for unlimited letters.",
      );
    }

    const paymentIntentId =
      typeof checkout.payment_intent === "string"
        ? checkout.payment_intent
        : (checkout.payment_intent?.id ?? null);

    await prisma.purchase.upsert({
      where: { stripeSessionId: checkout.id },
      create: {
        draftId,
        stripeSessionId: checkout.id,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : null,
        userId: userId ?? checkout.metadata?.userId ?? null,
        amountTotal: checkout.amount_total ?? 0,
        currency: checkout.currency ?? "usd",
        status: PurchaseStatus.PAID,
        paidAt: new Date(),
      },
      update: { status: PurchaseStatus.PAID, paidAt: new Date(), draftId },
    });

    return { granted: true as const, kind: "purchase" as const };
  }

  if (checkout.mode === "subscription" && checkout.status === "complete") {
    const subscription = await activeSubscriptionFor(userId);
    if (subscription) {
      return {
        granted: true as const,
        kind: "subscription" as const,
        subscriptionId: subscription.id,
      };
    }
  }

  return { granted: false as const };
}
