import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingPortalButton } from "@/components/account/billing-portal-button";
import { currentUser } from "@/lib/auth/actions";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/public-config";
import { SubscriptionStatus } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  INCOMPLETE: "Incomplete",
  INCOMPLETE_EXPIRED: "Expired",
  TRIALING: "Trial",
  ACTIVE: "Active",
  PAST_DUE: "Payment overdue",
  CANCELED: "Cancelled",
  UNPAID: "Unpaid",
  PAUSED: "Paused",
};

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const subscription = user.subscriptions[0];
  const hasBillingAccount = Boolean(user.stripeCustomerId);

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href="/account">
              <ArrowLeft aria-hidden="true" />
              Back to account
            </Link>
          </Button>
          <h1 className="mt-2 font-display text-2xl font-bold">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cards, invoices and cancellation are handled in Stripe&apos;s billing portal.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Current plan</CardTitle>
              {subscription ? (
                <Badge variant={subscription.status === "ACTIVE" ? "success" : "warning"}>
                  {STATUS_LABEL[subscription.status]}
                </Badge>
              ) : (
                <Badge variant="neutral">Pay per letter</Badge>
              )}
            </div>
            <CardDescription>
              {subscription
                ? `${siteConfig.pricing.monthly.priceLabel} per month. ${
                    subscription.cancelAtPeriodEnd
                      ? `Access continues until ${formatDate(subscription.currentPeriodEnd)}, then stops.`
                      : `Next renewal ${formatDate(subscription.currentPeriodEnd)}.`
                  }`
                : `No subscription. Single letters are ${siteConfig.pricing.single.priceLabel} each.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasBillingAccount ? (
              <BillingPortalButton />
            ) : (
              <p className="text-sm text-muted-foreground">
                There is no billing account on this profile yet. Start a plan or buy a letter and
                the portal becomes available here.
              </p>
            )}

            <div className="rounded-[var(--radius)] border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What the monthly plan includes</p>
              <ul className="mt-2 space-y-1.5">
                <li>Unlimited letter generation, subject to the published fair-use limits.</li>
                <li>Full letters, editing, and both download formats.</li>
                <li>Every denial-reason strategy in the library.</li>
              </ul>
              <p className="mt-3">
                The plan renews automatically each month until cancelled. Cancelling stops the next
                renewal and keeps access until the end of the period you have paid for. See the{" "}
                <Link href="/refund-policy" className="underline underline-offset-2">
                  refund and cancellation policy
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-navy-600" aria-hidden="true" />
              Payment details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card details are held by Stripe and never touch our servers or database. We store a
              Stripe customer reference, the status of your plan, and the amount of each purchase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
