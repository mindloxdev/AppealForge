import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { TemplateLibrary } from "@/components/marketing/template-library";
import { LeadCta } from "@/components/leads/lead-cta";
import { Button } from "@/components/ui/button";
import { LETTER_TEMPLATES } from "@/content/templates";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Insurance Appeal Letter Templates (Word and PDF)",
  description:
    "Blank appeal letter templates for every denial reason: medical necessity, prior authorization, timely filing, bundling, out of network and more. No email required.",
  path: "/templates",
});

const FAQS = [
  {
    question: "Do I have to give my email to download a template?",
    answer:
      "No. Every template downloads directly in Word or PDF. The contact form on this page is only there if you want a billing team to work your denials for you.",
  },
  {
    question: "Can I edit the templates for my practice?",
    answer:
      "Yes. They are deliberately plain so you can put them on your own letterhead and adjust the prompts to the way your practice writes appeals.",
  },
  {
    question: "Which template should I use if my denial lists two reasons?",
    answer:
      "Start with the reason that blocks payment. An authorization problem has to be cleared before a medical necessity argument matters, and a filing problem has to be cleared before either.",
  },
  {
    question: "What is the difference between a template and the generator?",
    answer:
      "A template is a blank frame you fill in yourself, free. The generator writes the argument section from the clinical facts you enter, shows you a free preview, and charges only when you want the full letter and the downloads.",
  },
];

export default function TemplatesPage() {
  return (
    <>
      <JsonLd
        schemas={[
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "Letter templates", path: "/templates" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-accent-soft px-3 py-1 text-xs font-semibold text-teal-800">
            <FileText className="size-3.5" aria-hidden="true" />
            No email required
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Blank appeal letter templates
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A fill-in-the-blank template for each denial reason, in Word and PDF. Every field is
            bracketed, the enclosures checklist is already in place, and the argument section is
            prompted rather than pre-written.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link href="/#generator">
                Generate a personalised letter instead
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <TemplateLibrary templates={LETTER_TEMPLATES} />
      </section>

      <section className="container-page pb-4">
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">How to use one</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Download the template for the denial reason on your notice.",
              "Replace every bracketed field. Anything you cannot fill in, leave bracketed - a visible blank beats a guess.",
              "Delete any prompt that does not apply to your claim.",
              "Attach the enclosures listed at the bottom and reference them by name.",
              "Have the treating clinician read and sign anything clinical.",
              "Send it to the appeals address on your denial notice, with proof of delivery, before the deadline printed there.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-navy-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-8">
        <h2 className="font-display text-2xl font-bold">Questions</h2>
        <dl className="mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-[var(--radius)] border border-border bg-card p-4">
              <dt className="font-display text-sm font-semibold">{faq.question}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page py-8">
        <LeadCta sourcePath="/templates" />
      </section>
    </>
  );
}
