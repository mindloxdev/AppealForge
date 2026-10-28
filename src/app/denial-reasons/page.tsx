import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeadCta } from "@/components/leads/lead-cta";
import { Badge } from "@/components/ui/badge";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { DENIAL_REASONS } from "@/content/denial-reasons";

export const metadata: Metadata = {
  title: "Medical Claim Denial Reasons and How to Appeal Them",
  description:
    "A reference for the denial reasons behind most US medical claim appeals - CO-50, CO-197, CO-29, CO-97, CO-55, CO-242 and more - with what strengthens each appeal.",
  alternates: { canonical: "/denial-reasons" },
};

export default function DenialReasonsPage() {
  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "Denial reasons", path: "/denial-reasons" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Denial reasons</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The denial reasons the generator writes for, what each one usually means, and what tends
            to strengthen that particular appeal. Payers apply codes differently, so check the
            wording on your own explanation of benefits before relying on any description here.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <ul className="grid gap-5 md:grid-cols-2">
          {DENIAL_REASONS.map((reason) => (
            <li
              key={reason.key}
              className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                {reason.codes.map((code) => (
                  <Badge key={code} variant="neutral" className="font-mono">
                    {code}
                  </Badge>
                ))}
                <h2 className="font-display text-lg font-semibold">{reason.short}</h2>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.meaning}</p>

              <p className="mt-3 rounded-[var(--radius)] bg-accent-soft p-3 text-sm leading-relaxed text-teal-900">
                <strong className="font-semibold">What strengthens it: </strong>
                {reason.evidenceHint}
              </p>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Next steps
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {reason.nextSteps.map((step) => (
                    <li
                      key={step}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                <Link
                  href={reason.pageSlug ? `/${reason.pageSlug}` : "/#generator"}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {reason.pageSlug ? "Read the full guide" : "Draft this letter"}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Blank template
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-10">
        <LeadCta sourcePath="/denial-reasons" />
      </section>
    </>
  );
}
