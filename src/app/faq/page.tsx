import type { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LeadCta } from "@/components/leads/lead-cta";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { FAQ_GROUPS, SITE_FAQS } from "@/content/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "How the appeal letter generator works, what it will and will not do, how privacy is handled, and how billing works.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        schemas={[
          faqSchema(SITE_FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))),
          breadcrumbSchema([
            { name: "Appeal letter generator", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container-page py-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            What the tool does, what it refuses to do, and how the parts you cannot see - privacy,
            payment, data retention - actually work.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group} className="mb-10">
            <h2 className="font-display text-xl font-bold">{group}</h2>
            <Accordion type="single" collapsible className="mt-4 grid max-w-3xl gap-2.5">
              {SITE_FAQS.filter((faq) => faq.group === group).map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <p className="max-w-3xl text-sm text-muted-foreground">
          Still stuck?{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
            Contact us
          </Link>{" "}
          - but please leave patient and claim details out of the message.
        </p>
      </div>

      <section className="container-page py-6">
        <LeadCta sourcePath="/faq" />
      </section>
    </>
  );
}
