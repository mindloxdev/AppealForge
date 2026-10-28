import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, ShieldAlert } from "lucide-react";
import { LeadCta } from "@/components/leads/lead-cta";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the billing team about denial management, or contact support about a purchase, a refund, or an accessibility barrier.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Contact</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Two different conversations: one about having a billing team work your denials, and one
            about this software.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <LeadCta sourcePath="/contact" />
      </section>

      <section className="container-page pb-10">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <LifeBuoy className="size-6 text-navy-600" aria-hidden="true" />
              <h2 className="mt-3 font-display text-lg font-semibold">Support for this tool</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Purchases, refunds, a letter that did not unlock, or an accessibility barrier. Use
                the form above and say in the message that it is a support request - it reaches the
                same inbox.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  For a refund, include your Stripe receipt or the time of the charge. See the{" "}
                  <Link
                    href="/refund-policy"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    refund policy
                  </Link>
                  .
                </li>
                <li>
                  For a lost draft: we cannot recover it - it was never stored - but we will refund
                  the purchase.
                </li>
                <li>
                  For an accessibility problem, tell us the browser and assistive technology. See{" "}
                  <Link
                    href="/accessibility"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    accessibility
                  </Link>
                  .
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-warning-soft">
            <CardContent className="pt-6">
              <ShieldAlert className="size-6 text-warning" aria-hidden="true" />
              <h2 className="mt-3 font-display text-lg font-semibold text-warning">
                Please do not send patient information
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-warning">
                No patient names, dates of birth, member IDs, claim numbers or clinical details in
                any message to us. We do not need them to help with a purchase or a bug, and a
                support inbox is not the place for them.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-warning">
                If you are a covered entity considering rolling this out, read the HIPAA section of
                the{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  privacy policy
                </Link>{" "}
                first and raise the agreement question in your first message.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {siteConfig.name} is a drafting tool. It does not provide legal advice and does not
          guarantee any appeal outcome.
        </p>
      </section>
    </>
  );
}
