import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  Stethoscope,
  Users,
  Sparkles,
  Lock,
  Download,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadCta } from "@/components/leads/lead-cta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Three steps, a free preview, then the full letter. How the generator builds an appeal around your denial code, and what it refuses to do.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    icon: FileSearch,
    title: "1. Denial details",
    body: "Insurer, appeal level, the denial reason and code, the claim and member numbers, dates, CPT and ICD-10 codes, and a plain-English description of the service. Pick the reason from a searchable list and the tool explains what it usually means before you go further.",
  },
  {
    icon: Stethoscope,
    title: "2. Clinical information",
    body: "Diagnosis and history, symptoms and functional impact, what was already tried and how it went, and why the service was needed now. Write it plainly - the letter puts it into formal language. Tick the evidence you can attach; nothing is uploaded.",
  },
  {
    icon: Users,
    title: "3. Parties and documents",
    body: "Who the letter is from - provider, billing office or patient - plus practice details, patient identifiers if you choose to include them, and the enclosures you are sending. Every blank becomes a bracketed placeholder rather than a guess.",
  },
];

const AFTER = [
  {
    icon: Sparkles,
    title: "The draft arrives",
    body: "Usually in 20 to 40 seconds. The argument follows the denial code you chose: clinical detail for a medical necessity denial, proof of submission for a filing denial, a modifier argument for a bundling edit.",
  },
  {
    icon: Lock,
    title: "You read the opening free",
    body: "The sender block, the RE line, the opening and the first body paragraphs are yours to read at no cost. The rest stays encrypted on your machine until it is unlocked - it is not simply blurred in the page.",
  },
  {
    icon: Download,
    title: "Unlock, edit, download",
    body: "A single letter is $12, or the monthly plan unlocks everything as it is drafted. Then edit the text and export it to Word or PDF, formatted as a US Letter business document.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">How it works</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Three short steps, a free preview, then the full letter. No account, no uploads, and
            nothing about your claim kept afterwards.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-6">
            <Link href="/#generator">
              Start your appeal letter
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-6">
                <step.icon className="size-6 text-teal-700" aria-hidden="true" />
                <h2 className="mt-3 font-display text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <h2 className="font-display text-2xl font-bold">What happens next</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {AFTER.map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <item.icon className="size-6 text-navy-600" aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <ShieldCheck className="size-5 text-success" aria-hidden="true" />
            What it will not do
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Invent clinical details, dates, test results, guideline names, policy numbers or statutes. Missing facts become bracketed placeholders.",
              "Tell you your appeal deadline or the insurer's appeals address. Those come from your own denial notice, and the letter marks them for you to verify.",
              "Promise an outcome. No tool can, and the letter never claims one.",
              "Store your form, your letter, or any patient detail. Which is also why a closed tab loses the draft.",
              "Give legal advice, medical advice, or certified coding guidance.",
              "Send your claim details to analytics. There is no third-party analytics script on this site at all.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page pb-10">
        <LeadCta sourcePath="/how-it-works" />
      </section>
    </>
  );
}
