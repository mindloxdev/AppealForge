import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "The checkout was cancelled. Nothing was charged.",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelledPage() {
  return (
    <div className="container-page py-16">
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-start gap-3 pt-6">
          <XCircle className="size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold">Checkout cancelled</h1>
          <p className="text-sm text-muted-foreground">
            Nothing was charged. Your draft is still open in the tab where you generated it - switch
            back to that tab and the preview will be exactly where you left it.
          </p>
          <p className="text-sm text-muted-foreground">
            You can close this tab.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Back to the generator
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
