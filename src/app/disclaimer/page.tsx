import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ProsePage, type ProseSection } from "@/components/marketing/prose-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "The generated appeal letter is a draft for review. It may contain errors or omissions and must be checked by a qualified person before submission.",
  alternates: { canonical: "/disclaimer" },
};

const SECTIONS: ProseSection[] = [
  {
    heading: "What the letter is",
    paragraphs: [
      "The letter this service produces is a draft. It is assembled by a language model from the facts you type into the form, in the structure a formal appeal usually takes. It has not been reviewed by a clinician, a coder, or a lawyer before it reaches you.",
      "That means it can contain errors or omissions. It can misread an abbreviation, place a fact in the wrong paragraph, or leave something out that mattered in your case. A qualified person has to read it before it is sent.",
    ],
  },
  {
    heading: "What it will not do",
    bullets: [
      "It will not invent clinical details, dates, test results, guideline names, policy numbers or statutes. Anything you do not supply appears as a bracketed placeholder.",
      "It will not tell you what your appeal deadline is. Deadlines vary by plan, product and state, and the one that governs is printed on your own denial notice.",
      "It will not fill in the insurer's appeals address. That too comes from your notice.",
      "It will not promise an outcome, and no part of this site should be read as predicting one.",
    ],
  },
  {
    heading: "Not legal or medical advice",
    paragraphs: [
      "This service does not provide legal advice, medical advice, or certified coding guidance. Using it does not create an attorney-client relationship or a clinician-patient relationship.",
      "The explanatory pages describe how denial codes and appeals generally work in US medical billing. They are general information. Payer policies, plan documents, clinical criteria, appeal processes and documentation requirements vary - and change.",
    ],
  },
  {
    heading: "Who is responsible for what",
    items: [
      {
        title: "You, for verifying the content",
        body: "Every factual statement in the letter is yours. Check names, identifiers, dates, codes, amounts and clinical claims against your own records before the letter goes out.",
      },
      {
        title: "The treating clinician, for clinical statements",
        body: "Anything that asserts a diagnosis, a severity, a treatment history or a clinical judgment belongs to the clinician who can defend it, including in a peer-to-peer review.",
      },
      {
        title: "Us, for the tool",
        body: "We are responsible for the software doing what this site says it does: following the denial strategy you choose, marking missing facts rather than inventing them, and not storing your claim data.",
      },
    ],
  },
  {
    heading: "Placeholders you must replace",
    paragraphs: [
      "Letters commonly come back with bracketed fields such as [INSURER APPEALS ADDRESS], [VERIFY APPEAL DEADLINE], [VERIFY SUBMISSION METHOD] and [cite applicable clinical guideline]. They are there because inventing those details would be worse than leaving them blank.",
      "Replace each one from a source you have actually checked. A letter sent with a placeholder still in it tells the reviewer that nobody read it.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <div className="border-b border-amber-200 bg-warning-soft">
        <div className="container-page flex items-start gap-3 py-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-sm font-medium leading-relaxed text-warning">
            The generated appeal letter is a draft for review. It may contain errors or omissions
            and must be checked by a qualified person before submission. This tool does not provide
            legal advice, guarantee coverage, or guarantee appeal approval.
          </p>
        </div>
      </div>

      <ProsePage
        title="Disclaimer"
        lede="What the letter is, what it is not, and who is responsible for checking it."
        sections={SECTIONS}
        footnote="If any page on this site reads as a promise about an outcome, that is a wording bug. Tell us and we will fix it."
      />

      <div className="container-page pb-10">
        <p className="text-sm text-muted-foreground">
          See also:{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy policy
          </Link>
          .
        </p>
      </div>
    </>
  );
}
