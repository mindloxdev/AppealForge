import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Gauge, Layers, LineChart, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadCta } from "@/components/leads/lead-cta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { DENIAL_REASONS } from "@/content/denial-reasons";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "For Medical Billers and RCM Teams",
  description:
    "Built for denial management: every major CARC strategy, consistent letters across staff, $29 a month unlimited, and no PHI retained in the tool.",
  alternates: { canonical: "/for-medical-billers" },
};

export default function ForMedicalBillersPage() {
  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "For medical billers", path: "/for-medical-billers" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-accent-soft px-3 py-1 text-xs font-semibold text-teal-800">
            <Users2 className="size-3.5" aria-hidden="true" />
            For billing companies, practices and RCM teams
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Appeal letters that match the code, written the same way by every member of your team
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Denial work rewards consistency. This gives your staff one route from a CARC code to a
            formatted letter, with the argument that fits that denial and the checklist of what to
            attach - without putting claim data anywhere it does not belong.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/#generator">
                Try it on a live denial
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Layers,
              title: "Every major denial strategy",
              body: "Medical necessity, prior authorization, non-covered, investigational, timely filing, bundling and NCCI, coding and modifier, duplicate, out of network and coordination of benefits - each with its own argument.",
            },
            {
              icon: ClipboardList,
              title: "Consistent output across staff",
              body: "A new biller produces the same letter structure as your most experienced one: RE line, opening, background, argument, specific request, enclosures, signature.",
            },
            {
              icon: Gauge,
              title: "Minutes, not an afternoon",
              body: "Paste the denial details and the clinical facts you already have in the chart. The draft comes back in under a minute, ready for clinician review.",
            },
            {
              icon: LineChart,
              title: "Flat monthly cost",
              body: `${siteConfig.pricing.monthly.priceLabel} a month for unlimited letters under published fair-use limits - not per claim, and not per seat.`,
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <item.icon className="size-6 text-teal-700" aria-hidden="true" />
                <h2 className="mt-3 font-display text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">How it fits a denial work queue</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Work the queue as you do now",
                body: "Pull the denial, read the CARC and remark codes, and decide whether this is an appeal, a corrected claim or a reprocess request. The tool does not replace that judgment.",
              },
              {
                title: "Draft the letter here",
                body: "Select the reason, paste the clinical facts from the chart, tick the enclosures. The attachment checklist and next steps come back with the letter.",
              },
              {
                title: "Route for clinical sign-off",
                body: "Download the Word file, send it for the clinician's review and signature, and file it with your proof of submission.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-navy-700">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{step.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-10">
        <h2 className="font-display text-2xl font-bold">Denial reasons covered</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DENIAL_REASONS.filter((reason) => reason.key !== "other").map((reason) => (
            <li
              key={reason.key}
              className="rounded-[var(--radius)] border border-border bg-card p-4"
            >
              <p className="flex items-center gap-2">
                {reason.codes.map((code) => (
                  <span
                    key={code}
                    className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold text-navy-700"
                  >
                    {code}
                  </span>
                ))}
                <span className="font-display text-sm font-semibold">{reason.short}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {reason.evidenceHint}
              </p>
              {reason.pageSlug ? (
                <Link
                  href={`/${reason.pageSlug}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  Read the guide
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page py-6">
        <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/50 p-6">
          <h2 className="font-display text-xl font-bold">Before you roll it out</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Two things worth deciding as a team rather than per biller:
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            <li className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
              <strong className="block text-foreground">Patient identifiers</strong>
              The letter works with them blank - it prints bracketed placeholders you complete on
              the printed copy. If you are a covered entity, read the HIPAA section of the privacy
              policy and decide which way your practice will work before staff start.
            </li>
            <li className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
              <strong className="block text-foreground">Clinical sign-off</strong>
              Decide who reviews and signs. Every draft needs a qualified reader, and clinical
              statements belong to the clinician who can defend them in a peer-to-peer review.
            </li>
          </ul>
        </div>
      </section>

      <section className="container-page py-10">
        <LeadCta sourcePath="/for-medical-billers" />
      </section>
    </>
  );
}
