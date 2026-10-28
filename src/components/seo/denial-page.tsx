import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Quote } from "lucide-react";
import { AppealGenerator } from "@/components/generator/appeal-generator";
import { LeadCta } from "@/components/leads/lead-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  softwareApplicationSchema,
} from "@/components/seo/json-ld";
import { getAppealPage, type AppealPage, type ContentSection } from "@/content/appeal-pages";
import { siteConfig } from "@/lib/public-config";

function Section({ section }: { section: ContentSection }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
      {section.intro ? (
        <p className="mt-3 max-w-prose text-[0.975rem] leading-relaxed text-muted-foreground">
          {section.intro}
        </p>
      ) : null}

      {section.paragraphs?.map((paragraph) => (
        <p
          key={paragraph.slice(0, 32)}
          className="mt-3 max-w-prose text-[0.975rem] leading-relaxed text-muted-foreground"
        >
          {paragraph}
        </p>
      ))}

      {section.items ? (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {section.items.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-xs"
            >
              <dt className="font-display text-base font-semibold">{item.title}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.bullets ? (
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DenialPage({ page, signedIn }: { page: AppealPage; signedIn: boolean }) {
  const related = page.related
    .map((slug) => getAppealPage(slug))
    .filter((entry): entry is AppealPage => Boolean(entry));

  return (
    <>
      <JsonLd
        schemas={[
          softwareApplicationSchema(page.metaDescription),
          faqSchema(page.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: page.h1, path: `/${page.slug}` },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Appeal letter generator
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-foreground">{page.h1}</span>
          </nav>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {page.eyebrow ? (
                <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-accent-soft px-3 py-1 text-xs font-semibold text-teal-800">
                  {page.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {page.h1}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{page.intro}</p>
            </div>

            <Button asChild variant="accent" size="lg" className="shrink-0">
              <Link href="#generator">
                Start Your Appeal Letter
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {page.heroPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-teal-700" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="generator" className="container-page scroll-mt-20 py-8 lg:py-10">
        <AppealGenerator presetDenialReason={page.toolPreset} signedIn={signedIn} />
      </section>

      <div className="container-page py-6">
        <article className="max-w-none">
          <Section section={page.definition} />
          <Section section={page.commonCauses} />
          <Section section={page.strategies} />
          <Section section={page.documentation} />

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">{page.sampleParagraph.heading}</h2>
            <Card className="mt-4 border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Quote className="size-3.5" aria-hidden="true" />
                  {page.sampleParagraph.label}
                </p>
                <div className="letter-type mt-3 space-y-3">
                  {page.sampleParagraph.text.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>
                      {paragraph.split("\n").map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
                <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  {page.sampleParagraph.note}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-4 grid max-w-3xl gap-2.5">
              {page.faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Related resources</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/${entry.slug}`}
                    className="group flex h-full flex-col rounded-[var(--radius)] border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                  >
                    <span className="font-display text-sm font-semibold group-hover:text-accent">
                      {entry.h1}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {entry.denialCode ? `${entry.denialCode} - ` : ""}
                      {entry.denialReasonLabel}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/templates"
                  className="group flex h-full flex-col rounded-[var(--radius)] border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                >
                  <span className="flex items-center gap-2 font-display text-sm font-semibold group-hover:text-accent">
                    <FileText className="size-4" aria-hidden="true" />
                    Blank letter templates
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Fill-in-the-blank templates for every denial reason
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="group flex h-full flex-col rounded-[var(--radius)] border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                >
                  <span className="font-display text-sm font-semibold group-hover:text-accent">
                    Pricing
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {siteConfig.pricing.single.priceLabel} per letter or{" "}
                    {siteConfig.pricing.monthly.priceLabel} a month
                  </span>
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </div>

      <section className="container-page py-10">
        <LeadCta sourcePath={`/${page.slug}`} />
      </section>

      <section className="container-page pb-6">
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          This page is general information about appealing denied medical claims, not legal or
          medical advice. Payer policies, plan documents, appeal deadlines and documentation
          requirements vary.{" "}
          <Link href="/disclaimer" className="underline underline-offset-2 hover:text-foreground">
            Read the full disclaimer
          </Link>
          .
        </p>
      </section>
    </>
  );
}
