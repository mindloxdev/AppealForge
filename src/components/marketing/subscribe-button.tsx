"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiClientError, postJson } from "@/lib/client/draft";

export function SubscribeButton({
  signedIn,
  className,
}: {
  signedIn: boolean;
  className?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function subscribe() {
    if (!signedIn) {
      router.push("/signup?plan=monthly");
      return;
    }

    setLoading(true);
    try {
      const response = await postJson<{ url: string }>("/api/create-checkout-session", {
        plan: "monthly",
      });
      window.location.assign(response.url);
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiClientError && error.code === "already_subscribed") {
        toast.info(error.message);
        router.push("/account/billing");
        return;
      }
      toast.error(
        error instanceof ApiClientError ? error.message : "Checkout could not be started.",
      );
    }
  }

  return (
    <Button
      variant="accent"
      size="lg"
      block
      className={className}
      onClick={subscribe}
      loading={loading}
    >
      {signedIn ? "Start the monthly plan" : "Create an account to subscribe"}
    </Button>
  );
}
