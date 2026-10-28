"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiClientError, postJson } from "@/lib/client/draft";

export function BillingPortalButton() {
  const [loading, setLoading] = React.useState(false);

  async function open() {
    setLoading(true);
    try {
      const response = await postJson<{ url: string }>("/api/create-portal-session", {});
      window.location.assign(response.url);
    } catch (error) {
      setLoading(false);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "The billing portal could not be opened. Please try again.",
      );
    }
  }

  return (
    <Button onClick={open} loading={loading}>
      <CreditCard aria-hidden="true" />
      Manage billing in Stripe
    </Button>
  );
}
