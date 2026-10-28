import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  Lock,
  Pencil,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { AppealGenerator } from "@/components/generator/appeal-generator";
import { LeadCta } from "@/components/leads/lead-cta";
import { LetterPreviewCard } from "@/components/marketing/letter-preview-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DENIAL_REASONS } from "@/content/denial-reasons";
import { getOptionalSession } from "@/lib/auth/session";
import { siteConfig } from "@/lib/public-config";
import { JsonLd, softwareApplicationSchema, websiteSchema, organizationSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Medical Necessity Appeal Letter Generator",
  description:
    "Create a stronger medical necessity appeal letter. Enter your denial details and clinical notes, review the draft, and download a formatted appeal letter as PDF or Word.",
  alternates: { canonical: "/" },
};

const TRUST = [
  { icon: Stethoscope, label: "No account required to try" },
  { icon: Lock, label: "No saved medical claim details" },
  { icon: Pencil, label: "Editable, downloadable letters" },
  { icon: FileCheck2, label: "Designed for US medical claims" },
];

export default async function HomePage() {
  const session = await getOptionalSession();
  const linkedReasons = DENIAL_REASONS.filter((reason) => reason.pageSlug);

  return (
    <>
      <JsonLd
        schemas={[websiteSchema(), organizationSchema(), softwareApplicationSchema()]}
      />

      {/*
        Deliberately not a marketing hero. The spec is explicit that the tool
        must be reachable without scrolling: one heading, one sentence, a
        compact trust row, then the generator itself. Everything that would
        normally fill a hero lives below the tool instead.
      */}
      <section id="generator" className="container-page scroll-mt-20 pt-7 pb-10 lg:pt-9">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-accent-soft px-3 py-1 text-xs font-semibold text-teal-800">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Built around the denial code on your EOB
          </p>
          <h1 className="mt-3 font-display text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-[2.125rem]">
            Create a Stronger Medical Necessity Appeal Letter
          </h1>
          <p className="mt-2.5 text-[0.975rem] leading-relaxed text-body sm:text-base">
            Enter your denial details and clinical notes, review the draft, and download a
            formatted appeal letter.
          </p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {TRUST.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground"
            >
              <item.icon className="size-3.5 text-teal-700" aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <AppealGenerator signedIn={Boolean(session)} />
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Start from your denial reason</h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Each page explains what the denial usually means, what tends to strengthen the appeal,
              and opens the generator with that reason selected.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/denial-reasons">
              See all denial reasons
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {linkedReasons.map((reason) => (
            <li key={reason.key}>
              <Link
                href={`/${reason.pageSlug}`}
                className="group block h-full rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-navy-700">
                    {reason.codes[0] ?? "Appeal"}
                  </span>
                  <span className="font-display text-base font-semibold group-hover:text-accent">
                    {reason.short}
                  </span>
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  {reason.evidenceHint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          <div>
            <h2 className="font-display text-2xl font-bold">What you get back</h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-body">
              A complete, formatted letter addressed to the plan&apos;s appeals unit: the RE line
              with your claim identifiers, the clinical argument built around your denial code, an
              enclosures list, and a signature block. Draft and preview it free - the first two
              paragraphs are always readable before you decide to pay.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Editable before you download - it is a draft, not a locked file",
                "Word (.docx) and PDF, formatted as a business letter",
                "Every missing fact marked as a bracketed placeholder, never invented",
              ].map((line) => (
                <li key={line} className="flex gap-2.5 text-sm text-body">
                  <Check className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-xs lg:mx-0">
            <LetterPreviewCard />
          </div>
        </div>
      </section>

      <section className="container-page py-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: FileCheck2,
              title: "One form, the right argument",
              body: "A medical necessity denial is won with clinical detail. An authorization denial is won with an approval number or a documented emergency. A filing denial is won with a dated clearinghouse report. The letter follows the code you select.",
            },
            {
              icon: ShieldCheck,
              title: "It will not invent facts",
              body: "Every blank becomes a bracketed placeholder. No invented test results, no made-up guideline names, no fabricated policy numbers - and no promises about the outcome.",
            },
            {
              icon: Lock,
              title: "Nothing is stored",
              body: "Your entries are processed in memory to draft the letter and then discarded. There is no database of letters and no patient records here, which also means a closed tab is gone for good.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <item.icon className="size-6 text-teal-700" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <LeadCta />
      </section>

      <section className="container-page pb-6">
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {siteConfig.name} produces draft letters for review. It does not provide legal advice,
          does not guarantee coverage, and does not guarantee that an appeal will be approved.
          Payer policies, plan documents, appeal deadlines and documentation requirements vary.{" "}
          <Link href="/disclaimer" className="underline underline-offset-2 hover:text-foreground">
            Read the full disclaimer
          </Link>
          .
        </p>
      </section>
    </>
  );
}
