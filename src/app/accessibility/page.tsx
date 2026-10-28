import type { Metadata } from "next";
import { ProsePage, type ProseSection } from "@/components/marketing/prose-page";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How AppealForge approaches accessibility: keyboard support, screen-reader labelling, contrast, motion preferences, and how to report a barrier.",
  alternates: { canonical: "/accessibility" },
};

const SECTIONS: ProseSection[] = [
  {
    heading: "Our aim",
    paragraphs: [
      "This tool is used by billing staff working at speed, by clinicians between patients, and by people appealing a denial for themselves - sometimes while unwell. We build against the WCAG 2.2 AA guidelines because that is the practical floor for all three.",
      "We describe below what is implemented today rather than what we hope to do. If something on this list does not work for you, that is a defect and we want to hear about it.",
    ],
  },
  {
    heading: "What is implemented",
    bullets: [
      "Every form control has a visible label tied to it. No field relies on placeholder text as its label.",
      "Errors appear next to the field and in a focusable summary at the top of the step, with each entry linking to the field that produced it.",
      "The whole generator works from the keyboard, including the searchable denial-reason combobox, which supports arrow keys, type-ahead, Enter and Escape.",
      "Focus is visible everywhere and is never removed. Moving between steps moves focus deliberately rather than leaving it stranded.",
      "Status changes - generating, unlocked, downloaded, errors - are announced to screen readers through live regions.",
      "Colour is never the only carrier of meaning. States also use text, icons or shape.",
      "Text and interface colours meet at least a 4.5:1 contrast ratio against their background.",
      "Interactive targets are at least 44 by 44 pixels on touch screens, with spacing between them.",
      "The layout reflows to one column on small screens with no horizontal scrolling, and supports browser zoom.",
      "All animation respects the reduced-motion setting in your operating system, and no animation blocks a form submission, a payment or a download.",
      "The locked region of a letter preview is marked aria-hidden, with a text explanation announced instead of blurred filler.",
    ],
  },
  {
    heading: "Known limits",
    bullets: [
      "The letter editor is a plain textarea. It is fully keyboard accessible, but it does not provide rich-text structure or formatting shortcuts.",
      "Payment happens on Stripe's hosted checkout page. Its accessibility is Stripe's responsibility, not ours.",
      "Generated PDFs are tagged only as far as our PDF library supports. If you need a more accessible document format, download the Word file, which carries proper paragraph structure.",
    ],
  },
  {
    heading: "Reporting a barrier",
    paragraphs: [
      "Tell us what you were trying to do, what happened, and the assistive technology and browser you were using. Do not include patient or claim details - we do not need them to reproduce an interface problem.",
      "We treat accessibility defects as ordinary bugs with the same priority as anything else that stops the product working.",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <ProsePage
      title="Accessibility"
      lede="What we have built, where it falls short, and how to tell us about a barrier."
      sections={SECTIONS}
    />
  );
}
