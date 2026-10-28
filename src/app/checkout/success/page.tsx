import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccess } from "@/components/generator/checkout-success";

export const metadata: Metadata = {
  title: "Payment confirmed",
  description: "Your payment is confirmed and your appeal letter is unlocking.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page py-16">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Checking your payment...</p>}>
        <CheckoutSuccess />
      </Suspense>
    </div>
  );
}
