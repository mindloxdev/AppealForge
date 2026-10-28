import "server-only";
import Stripe from "stripe";
import { getEnv, features } from "@/lib/env";
import { siteConfig, type PlanId } from "@/lib/public-config";

/**
 * Stripe access.
 *
 * Prices are never taken from the client. A checkout session is built on the
 * server from a configured Price ID, or - when no Price ID is configured yet -
 * from the price constants in public-config, which are the same values shown on
 * the pricing page.
 */

export class BillingError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new BillingError(
      "Payments are not configured on this deployment yet.",
      "payments_unconfigured",
      503,
    );
  }
  cached = new Stripe(env.STRIPE_SECRET_KEY, {
    // Pinned so a Stripe API upgrade cannot change response shapes under us.
    apiVersion: "2026-09-30.endive",
    appInfo: { name: "AppealForge", version: "1.0.0" },
    maxNetworkRetries: 2,
    timeout: 20_000,
  });
  return cached;
}

function lineItemFor(plan: PlanId): Stripe.Checkout.SessionCreateParams.LineItem {
  const env = getEnv();
  const configuredPrice =
    plan === "monthly" ? env.STRIPE_MONTHLY_PRICE_ID : env.STRIPE_SINGLE_LETTER_PRICE_ID;

  if (configuredPrice) return { price: configuredPrice, quantity: 1 };

  const pricing = siteConfig.pricing[plan];
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: pricing.priceCents,
      product_data: {
        name:
          plan === "monthly"
            ? `${siteConfig.name} monthly plan`
            : `${siteConfig.name} appeal letter`,
      },
      ...(plan === "monthly" ? { recurring: { interval: "month" as const } } : {}),
    },
  };
}

export interface CheckoutParams {
  plan: PlanId;
  /** Random id for the draft being unlocked. Carries no claim information. */
  draftId: string;
  userId?: string;
  customerEmail?: string;
  stripeCustomerId?: string;
  origin: string;
}

export async function createCheckoutSession(params: CheckoutParams): Promise<Stripe.Checkout.Session> {
  const client = stripe();
  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    params.plan === "monthly" ? "subscription" : "payment";

  // Metadata holds a random draft id and a plan name only. No patient name, no
  // claim number, no clinical text ever reaches Stripe.
  const metadata: Record<string, string> = {
    plan: params.plan,
    ...(params.draftId ? { draftId: params.draftId } : {}),
    ...(params.userId ? { userId: params.userId } : {}),
  };

  const create: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [lineItemFor(params.plan)],
    success_url: params.draftId
      ? `${params.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&draft=${encodeURIComponent(params.draftId)}`
      : `${params.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/checkout/cancelled`,
    metadata,
    allow_promotion_codes: true,
    ...(params.draftId ? { client_reference_id: params.draftId } : {}),
  };

  if (params.stripeCustomerId) {
    create.customer = params.stripeCustomerId;
  } else if (params.customerEmail) {
    create.customer_email = params.customerEmail;
  }

  if (mode === "subscription") {
    create.subscription_data = { metadata };
  } else {
    create.payment_intent_data = { metadata };
  }

  return client.checkout.sessions.create(create);
}

export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return stripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function ensureStripeCustomer(params: {
  stripeCustomerId?: string | null;
  email: string;
  userId: string;
}): Promise<string> {
  if (params.stripeCustomerId) return params.stripeCustomerId;
  const customer = await stripe().customers.create({
    email: params.email,
    metadata: { userId: params.userId },
  });
  return customer.id;
}

/**
 * `current_period_end` moved from the subscription onto its items in Stripe's
 * 2025 API versions. Read whichever shape this account returns.
 */
export function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const direct = (subscription as unknown as { current_period_end?: number }).current_period_end;
  if (typeof direct === "number" && Number.isFinite(direct)) return new Date(direct * 1000);

  const item = subscription.items?.data?.[0] as unknown as
    | { current_period_end?: number }
    | undefined;
  if (item && typeof item.current_period_end === "number") {
    return new Date(item.current_period_end * 1000);
  }
  return null;
}

export const ACTIVE_STRIPE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

export function billingConfigured(): boolean {
  return features().stripe;
}
