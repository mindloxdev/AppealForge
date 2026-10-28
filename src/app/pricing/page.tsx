import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/marketing/subscribe-button";
import { LeadCta } from "@/components/leads/lead-cta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { getOptionalSession } from "@/lib/auth/session";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Pricing: $12 per letter or $29 a month",
  description:
    "Free to draft and preview. Pay $12 to unlock a single letter with PDF and Word downloads, or $29 a month for unlimited letters under published fair-use limits.",
  alternates: { canonical: "/pricing" },
};

const SINGLE_FEATURES = [
  "The full letter, not just the preview",
  "Word (.docx) download",
  "PDF download",
  "Edit the letter before downloading",
  "Regenerate the same letter at no extra cost",
  "Denial-specific appeal strategy",
  "Attachment checklist and next steps",
];

const MONTHLY_FEATURES = [
  "Unlimited letter generation, under published fair-use limits",
  "Full letters, editing and both download formats",
  "Every denial-reason strategy in the library",
  "Letters unlock the moment they are drafted - no checkout each time",
  "Billing portal with invoices and one-click cancellation",
];

const FAQS = [
  {
    question: "Is there a free option?",
    answer:
      "Yes. You can generate a letter and read the opening of it free, three times a day, with no account. Payment is only for the full text and the downloads.",
  },
  {
    question: "What exactly does $12 buy?",
    answer:
      "One letter: the draft on your screen at the moment you pay. It unlocks the full text, lets you edit it, and gives you both download formats. Regenerating that same letter afterwards does not cost anything extra.",
  },
  {
    question: "What does unlimited mean on the monthly plan?",
    answer:
      "Unlimited letters for normal professional use. Automated abuse protection applies to every account - a ceiling of 60 generations per hour from one source, plus per-endpoint limits - and those figures are published in the terms rather than hidden. If your volume approaches them, contact us and we will raise them.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Not for the free preview or a single letter. The monthly plan needs one, because a subscription has to live somewhere you can manage and cancel it.",
  },
  {
    question: "How do I cancel?",
    answer:
      "From Billing in your account, which opens Stripe's billing portal. Cancelling stops the next renewal and keeps your access until the end of the period you have already paid for.",
  },
  {
    question: "Do you store my letters so I can download them later?",
    answer:
      "No, and that is deliberate. Letters are never written to our database, so there is no history to re-download. Download the file before you close the tab.",
  },
];

export default async function PricingPage() {
  const session = await getOptionalSession();

  return (
    <>
      <JsonLd
        schemas={[
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Simple, honest pricing</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Draft and preview any letter free. Pay only when you want the full text and the
            downloads - once for a single letter, or monthly if you work denials every day.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-semibold">
              {siteConfig.pricing.single.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For a one-off denial, or to try the full output before committing.
            </p>
            <p className="mt-4">
              <span className="font-display text-4xl font-bold">
                {siteConfig.pricing.single.priceLabel}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">per letter</span>
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {SINGLE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm">
                <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                <span className="text-muted-foreground">
                  Unlocks one letter - a second letter is another purchase
                </span>
              </li>
            </ul>

            <Button asChild className="mt-6" block size="lg">
              <Link href="/#generator">Draft a letter free</Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              You pay after you have seen the preview.
            </p>
          </div>

          <div className="relative flex min-w-0 flex-col rounded-[var(--radius-xl)] border-2 border-accent bg-card p-5 shadow-md sm:p-6">
            <Badge variant="accent" className="absolute -top-3 left-6">
              For billing teams
            </Badge>
            <h2 className="font-display text-lg font-semibold">
              {siteConfig.pricing.monthly.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For practices and billers working denials every week.
            </p>
            <p className="mt-4">
              <span className="font-display text-4xl font-bold">
                {siteConfig.pricing.monthly.priceLabel}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">per month</span>
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {MONTHLY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <SubscribeButton signedIn={Boolean(session)} className="mt-6" />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Renews automatically each month until cancelled. Cancel any time from your account.
            </p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-4xl rounded-[var(--radius)] border border-border bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
          Payments are processed by Stripe. Card details never reach our servers, and a one-time
          purchase never enrols you in a subscription. See the{" "}
          <Link href="/refund-policy" className="underline underline-offset-2 hover:text-foreground">
            refund and cancellation policy
          </Link>
          .
        </p>
      </section>

      <section className="container-page py-6">
        <h2 className="text-center font-display text-2xl font-bold">Pricing questions</h2>
        <Accordion type="single" collapsible className="mx-auto mt-6 grid max-w-3xl gap-2.5">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container-page py-10">
        <LeadCta sourcePath="/pricing" />
      </section>
    </>
  );
}
