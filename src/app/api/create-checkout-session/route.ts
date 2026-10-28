import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { PurchaseStatus } from "@/generated/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { BillingError, createCheckoutSession, ensureStripeCustomer } from "@/lib/billing/stripe";
import { activeSubscriptionFor } from "@/lib/billing/entitlements";
import { isDraftId } from "@/lib/security/entitlement";
import { callerIp, consume, rateLimitHeaders } from "@/lib/rate-limit";
import { track } from "@/lib/analytics/track";
import { ApiError, fail, handleRouteError, ok, readJson } from "@/lib/api/respond";
import { siteConfig } from "@/lib/public-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    plan: z.enum(["single", "monthly"]),
    // Required for a single letter, which unlocks one specific draft. A
    // subscription is an account entitlement and needs no draft.
    draftId: z.string().refine(isDraftId, "Generate a letter first.").optional(),
  })
  .refine((value) => value.plan === "monthly" || Boolean(value.draftId), {
    message: "Generate a letter first.",
    path: ["draftId"],
  });

/**
 * POST /api/create-checkout-session
 *
 * The price is never taken from the request: the plan name selects a
 * server-side Price ID. The only thing carried into Stripe is a random draft
 * id, which identifies the letter to unlock without describing it.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const env = getEnv();
    const body = await readJson(request);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "invalid_request",
        parsed.error.issues[0]?.message ?? "Choose a plan and generate a letter first.",
      );
    }
    const { plan, draftId } = parsed.data;

    const ip = callerIp(request);
    const limit = await consume("checkout", ip);
    if (!limit.allowed) {
      return fail(
        429,
        "rate_limited",
        "Too many checkout attempts. Please wait a few minutes and try again.",
        { resetInSeconds: limit.resetInSeconds },
        rateLimitHeaders(limit),
      );
    }

    const session = await getSessionFromRequest(request);

    // The monthly plan is an account subscription: it needs somewhere to live.
    if (plan === "monthly" && !session) {
      throw new ApiError(
        401,
        "account_required",
        "Create a free account first so your plan can be managed and cancelled.",
      );
    }

    if (plan === "monthly") {
      const existing = await activeSubscriptionFor(session!.userId);
      if (existing) {
        throw new ApiError(
          409,
          "already_subscribed",
          "Your plan is already active. Open your account to manage billing.",
        );
      }
    }

    let stripeCustomerId: string | undefined;
    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, stripeCustomerId: true },
      });
      if (user) {
        stripeCustomerId = await ensureStripeCustomer({
          stripeCustomerId: user.stripeCustomerId,
          email: user.email,
          userId: user.id,
        });
        if (stripeCustomerId !== user.stripeCustomerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId },
          });
        }
      }
    }

    const checkout = await createCheckoutSession({
      plan,
      draftId: draftId ?? "",
      userId: session?.userId,
      stripeCustomerId,
      origin: env.APP_URL || siteConfig.url,
    });

    if (!checkout.url) {
      throw new ApiError(502, "checkout_failed", "Checkout could not be started. Please try again.");
    }

    // A pending row so the webhook has something to settle against, and so a
    // completed payment can be matched to the draft it belongs to. The row
    // holds a random id and money - never claim data.
    if (plan === "single" && draftId) {
      await prisma.purchase.upsert({
        where: { stripeSessionId: checkout.id },
        create: {
          draftId,
          stripeSessionId: checkout.id,
          stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : null,
          userId: session?.userId ?? null,
          amountTotal: checkout.amount_total ?? siteConfig.pricing.single.priceCents,
          currency: checkout.currency ?? "usd",
          status: PurchaseStatus.PENDING,
        },
        update: {},
      });
    }

    await track("checkout_started", plan);

    return ok({ url: checkout.url, sessionId: checkout.id });
  } catch (error) {
    if (error instanceof BillingError) {
      return fail(error.status, error.code, error.message);
    }
    return handleRouteError("create-checkout-session", error);
  }
}
