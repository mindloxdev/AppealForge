import "server-only";
import { prisma } from "@/lib/db/prisma";
import { PurchaseStatus, SubscriptionStatus } from "@/generated/prisma";
import { verifyEntitlement, isDraftId } from "@/lib/security/entitlement";

/**
 * Server-side entitlement checks.
 *
 * Nothing here trusts the browser. A redirect back from Stripe never grants
 * access on its own: either a webhook has recorded a paid purchase for this
 * draft id, or a live subscription row says the account is current.
 */

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.PAST_DUE,
];

export interface EntitlementCheck {
  granted: boolean;
  kind?: "purchase" | "subscription";
  subscriptionId?: string;
  reason?: string;
}

/** Has this specific draft been paid for? */
export async function purchaseGrantsDraft(draftId: string): Promise<boolean> {
  if (!isDraftId(draftId)) return false;
  const purchase = await prisma.purchase.findUnique({
    where: { draftId },
    select: { status: true },
  });
  return purchase?.status === PurchaseStatus.PAID;
}

/** Does this user hold a subscription that is currently in good standing? */
export async function activeSubscriptionFor(
  userId: string | undefined,
): Promise<{ id: string; status: SubscriptionStatus; currentPeriodEnd: Date | null } | null> {
  if (!userId) return null;
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ACTIVE_SUBSCRIPTION_STATUSES } },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, currentPeriodEnd: true },
  });
  if (!subscription) return null;

  // A period that ended more than a day ago means Stripe has not told us about
  // a renewal; treat it as lapsed rather than guessing in the customer's favour.
  if (
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd.getTime() + 24 * 60 * 60 * 1000 < Date.now()
  ) {
    return null;
  }

  return subscription;
}

/**
 * The gate used by /api/unlock before a decryption key is released.
 */
export async function checkEntitlementForDraft(
  draftId: string,
  userId: string | undefined,
): Promise<EntitlementCheck> {
  if (!isDraftId(draftId)) {
    return { granted: false, reason: "invalid_draft" };
  }

  if (await purchaseGrantsDraft(draftId)) {
    return { granted: true, kind: "purchase" };
  }

  const subscription = await activeSubscriptionFor(userId);
  if (subscription) {
    return { granted: true, kind: "subscription", subscriptionId: subscription.id };
  }

  return { granted: false, reason: "not_entitled" };
}

/**
 * The gate used by the document endpoints. The caller presents the entitlement
 * token issued at unlock time; it is verified again here, and a subscription
 * token is re-checked against the database so a cancellation takes effect
 * immediately rather than at token expiry.
 */
export async function checkEntitlementToken(
  token: unknown,
  draftId: string,
  userId: string | undefined,
): Promise<EntitlementCheck> {
  const claims = await verifyEntitlement(token);
  if (!claims) return { granted: false, reason: "invalid_token" };

  if (claims.kind === "purchase") {
    if (!claims.draftId || claims.draftId !== draftId) {
      return { granted: false, reason: "draft_mismatch" };
    }
    const paid = await purchaseGrantsDraft(draftId);
    return paid
      ? { granted: true, kind: "purchase" }
      : { granted: false, reason: "not_entitled" };
  }

  const subscription = await activeSubscriptionFor(userId);
  if (!subscription) return { granted: false, reason: "subscription_inactive" };
  if (claims.subscriptionId && claims.subscriptionId !== subscription.id) {
    return { granted: false, reason: "subscription_mismatch" };
  }
  return { granted: true, kind: "subscription", subscriptionId: subscription.id };
}
