import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, FileText, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { currentUser, signOutAction } from "@/lib/auth/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SubscriptionStatus } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const ACTIVE = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.PAST_DUE,
]);

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const subscription = user.subscriptions.find((entry) => ACTIVE.has(entry.status));

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Plan</CardTitle>
              {subscription ? (
                <Badge variant="success">
                  {subscription.status === SubscriptionStatus.PAST_DUE ? "Payment overdue" : "Active"}
                </Badge>
              ) : (
                <Badge variant="neutral">No active plan</Badge>
              )}
            </div>
            <CardDescription>
              {subscription
                ? subscription.cancelAtPeriodEnd
                  ? `Your plan ends on ${formatDate(subscription.currentPeriodEnd)} and will not renew.`
                  : `Renews on ${formatDate(subscription.currentPeriodEnd)}.`
                : "You are on pay-per-letter. Each $12 purchase unlocks the letter it was bought for."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant={subscription ? "outline" : "accent"}>
              <Link href="/account/billing">
                <CreditCard aria-hidden="true" />
                {subscription ? "Manage billing" : "See plans"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/#generator">
                <Sparkles aria-hidden="true" />
                Generate a letter
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-navy-600" aria-hidden="true" />
              Recent purchases
            </CardTitle>
            <CardDescription>
              Payment records only. The letters themselves are never stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchases yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {user.purchases.map((purchase) => (
                  <li key={purchase.id} className="flex items-center justify-between gap-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(purchase.amountTotal, purchase.currency)} - single letter
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchase.paidAt ?? purchase.createdAt)}
                      </p>
                    </div>
                    <Badge variant={purchase.status === "PAID" ? "success" : "neutral"}>
                      {purchase.status.toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="flex items-start gap-2 rounded-[var(--radius)] border border-border bg-secondary/50 p-4 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          <span>
            This account holds your email, password hash and Stripe references. It does not hold
            letters, patient details or claim information - there is no letter history to show,
            by design.
          </span>
        </p>
      </div>
    </div>
  );
}
