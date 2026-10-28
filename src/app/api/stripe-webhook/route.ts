import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { PurchaseStatus, SubscriptionStatus } from "@/generated/prisma";
import { getEnv } from "@/lib/env";
import { stripe, subscriptionPeriodEnd } from "@/lib/billing/stripe";
import { track } from "@/lib/analytics/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe-webhook
 *
 * The only thing that grants access. A success-page redirect proves nothing;
 * entitlements are written here, after Stripe's signature is verified against
 * the raw request body.
 *
 * Idempotency: the event id is inserted first. A duplicate delivery hits the
 * unique constraint, returns 200, and does nothing twice.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const env = getEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error(JSON.stringify({ event: "webhook_unconfigured" }));
    return NextResponse.json({ received: false }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    // Never echo the reason: a bad signature is all the sender needs to know.
    console.error(JSON.stringify({ event: "webhook_bad_signature" }));
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    // Already seen. Acknowledge so Stripe stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(event);
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date() },
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { error: message.slice(0, 500) },
    });
    console.error(JSON.stringify({ event: "webhook_failed", type: event.type, message }));
    // 500 asks Stripe to retry; the idempotency row is cleared below so the
    // retry can run the handler again.
    await prisma.webhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.purchase.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: PurchaseStatus.FAILED },
      });
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent === "string") {
        await prisma.purchase.updateMany({
          where: { stripePaymentIntentId: charge.payment_intent },
          data: { status: PurchaseStatus.REFUNDED },
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.payment_failed":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (subscriptionId) {
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
      }
      break;
    }
    default:
      // Everything else is acknowledged and ignored on purpose.
      break;
  }
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object" && "id" in direct) return direct.id;

  // Newer API versions carry it on the line item's parent instead.
  const line = invoice.lines?.data?.[0] as unknown as
    | { parent?: { subscription_item_details?: { subscription?: string } } }
    | undefined;
  return line?.parent?.subscription_item_details?.subscription ?? null;
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const draftId = session.metadata?.draftId ?? session.client_reference_id ?? null;
  const userId = session.metadata?.userId ?? null;

  if (session.mode === "payment") {
    if (session.payment_status !== "paid") return;
    if (!draftId) {
      console.error(JSON.stringify({ event: "webhook_missing_draft", sessionId: session.id }));
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    await prisma.purchase.upsert({
      where: { stripeSessionId: session.id },
      create: {
        draftId,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        userId,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: PurchaseStatus.PAID,
        paidAt: new Date(),
      },
      update: {
        status: PurchaseStatus.PAID,
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
        draftId,
      },
    });

    await track("payment_completed", "single");
    return;
  }

  if (session.mode === "subscription") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription?.id ?? null);
    if (!subscriptionId) return;

    const subscription = await stripe().subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription, userId ?? undefined);
    await track("payment_completed", "monthly");
  }
}

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  incomplete: SubscriptionStatus.INCOMPLETE,
  incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
  trialing: SubscriptionStatus.TRIALING,
  active: SubscriptionStatus.ACTIVE,
  past_due: SubscriptionStatus.PAST_DUE,
  canceled: SubscriptionStatus.CANCELED,
  unpaid: SubscriptionStatus.UNPAID,
  paused: SubscriptionStatus.PAUSED,
};

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string,
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const userId =
    subscription.metadata?.userId ||
    fallbackUserId ||
    (await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    }))?.id;

  if (!userId) {
    // Nothing to attach the subscription to. Recorded, not guessed.
    console.error(
      JSON.stringify({ event: "webhook_subscription_without_user", customer: customerId }),
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id ?? "";

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      status: STATUS_MAP[subscription.status],
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: STATUS_MAP[subscription.status],
      stripePriceId: priceId,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCustomerId: customerId,
    },
  });

  // Keep the customer id on the user so the billing portal can be opened.
  await prisma.user.updateMany({
    where: { id: userId, stripeCustomerId: null },
    data: { stripeCustomerId: customerId },
  });
}
