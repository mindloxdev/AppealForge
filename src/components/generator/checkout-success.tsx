"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiClientError, postJson, UNLOCK_CHANNEL } from "@/lib/client/draft";

type State =
  | { phase: "working" }
  | { phase: "subscribed" }
  | { phase: "unlocked"; kind: string }
  | { phase: "waiting"; message: string }
  | { phase: "error"; message: string };

/**
 * The tab Stripe returns to.
 *
 * It verifies the payment with the server, then hands the key back to the tab
 * that holds the draft over a same-origin BroadcastChannel. The draft itself
 * never travels through this page, and no letter is stored anywhere.
 */
export function CheckoutSuccess() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const draftId = params.get("draft") ?? "";
  // Derived during render rather than inside the effect: with no session id
  // there is nothing to do, and a subscription checkout carries no draft.
  const [state, setState] = React.useState<State>(() => {
    if (!sessionId) {
      return {
        phase: "error",
        message:
          "This page opens after a payment. If you have just paid, use the link in your Stripe receipt.",
      };
    }
    return draftId ? { phase: "working" } : { phase: "subscribed" };
  });
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current || !sessionId || !draftId) return;
    ran.current = true;

    void (async () => {
      try {
        const response = await postJson<{ key: string; entitlement: string; kind: string }>(
          "/api/unlock",
          { draftId, sessionId },
        );

        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel(UNLOCK_CHANNEL);
          channel.postMessage({
            draftId,
            key: response.key,
            entitlement: response.entitlement,
          });
          channel.close();
        }

        setState({ phase: "unlocked", kind: response.kind });
      } catch (error) {
        if (error instanceof ApiClientError && error.code === "payment_incomplete") {
          setState({
            phase: "waiting",
            message:
              "Stripe has not finished confirming the payment. Wait a few seconds and reload this page.",
          });
          return;
        }
        setState({
          phase: "error",
          message:
            error instanceof ApiClientError
              ? error.message
              : "We could not confirm that payment. Please contact support with your Stripe receipt.",
        });
      }
    })();
  }, [sessionId, draftId]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="pt-6">
        {state.phase === "working" ? (
          <div className="flex flex-col items-start gap-3">
            <Loader2 className="size-7 animate-spin text-accent" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold">Confirming your payment</h1>
            <p className="text-sm text-muted-foreground">This takes a moment.</p>
          </div>
        ) : null}

        {state.phase === "subscribed" ? (
          <div className="flex flex-col items-start gap-3">
            <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold">Your plan is active</h1>
            <p className="text-sm text-muted-foreground">
              Letters you generate from now on unlock as soon as they are drafted - no further
              checkout, and no waiting.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/#generator">Start a letter</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/account/billing">Manage billing</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {state.phase === "unlocked" ? (
          <div className="flex flex-col items-start gap-3">
            <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold">Payment confirmed</h1>
            <p className="text-sm text-muted-foreground">
              Your letter has been unlocked in the tab where you wrote it. Switch back to that tab
              to read, edit and download it.
            </p>
            {state.kind === "subscription" ? (
              <p className="text-sm text-muted-foreground">
                Your monthly plan is active. Future letters unlock as soon as they are generated.
              </p>
            ) : null}
            <p className="rounded-[var(--radius)] bg-secondary px-3 py-2 text-xs text-muted-foreground">
              You can close this tab. Download the letter before you close the other one - we keep
              no copy of it.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Back to the generator
              </Link>
            </Button>
          </div>
        ) : null}

        {state.phase === "waiting" || state.phase === "error" ? (
          <div className="flex flex-col items-start gap-3">
            <AlertTriangle
              className={state.phase === "waiting" ? "size-7 text-warning" : "size-7 text-destructive"}
              aria-hidden="true"
            />
            <h1 className="font-display text-xl font-bold">
              {state.phase === "waiting" ? "Almost there" : "We could not unlock that letter"}
            </h1>
            <p className="text-sm text-muted-foreground">{state.message}</p>

            {state.phase === "waiting" ? (
              <Button onClick={() => window.location.reload()} size="sm">
                Check again
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If the tab holding your draft was closed, the letter is gone - it only ever lived
                  in that tab, and nothing was stored on our side. Contact us with your Stripe
                  receipt and we will refund the purchase.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/contact">Contact support</Link>
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
