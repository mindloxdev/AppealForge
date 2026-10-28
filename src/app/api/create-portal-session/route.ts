import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { BillingError, createBillingPortalSession } from "@/lib/billing/stripe";
import { ApiError, fail, handleRouteError, ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/create-portal-session
 *
 * Opens Stripe's own billing portal, where a customer can update a card,
 * download invoices, or cancel. Cancellation lives there rather than in a
 * home-grown screen so the record of it is Stripe's.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new ApiError(
        400,
        "no_billing_account",
        "There is no billing account on this profile yet. Start a plan first.",
      );
    }

    const portal = await createBillingPortalSession(
      user.stripeCustomerId,
      `${getEnv().APP_URL}/account/billing`,
    );

    return ok({ url: portal.url });
  } catch (error) {
    if (error instanceof BillingError) return fail(error.status, error.code, error.message);
    return handleRouteError("create-portal-session", error);
  }
}
