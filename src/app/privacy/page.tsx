import type { Metadata } from "next";
import { ProsePage, type ProseSection } from "@/components/marketing/prose-page";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What AppealForge collects, what it never stores, how the AI step works, and which processors see what. Written to match what the application actually does.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: ProseSection[] = [
  {
    heading: "The short version",
    paragraphs: [
      "You can use the appeal letter generator without an account. The details you type are used once, to draft the letter, and are then discarded. We do not keep the form, the draft, or any patient information, and there is no table in our database that could hold them.",
      "This is a design choice with a consequence worth stating plainly: because nothing is stored, a closed browser tab destroys the draft, and nobody - including us - can recover it.",
    ],
  },
  {
    heading: "What happens to what you type",
    bullets: [
      "Your browser sends the form to our server over HTTPS when you press Generate.",
      "The server builds a structured prompt and sends it to our AI provider, which returns the letter text.",
      "The server splits the letter, encrypts the part behind the paywall, and returns both to your browser.",
      "The server then discards the form data and the letter. Neither is written to a database, a file, or a log.",
      "The only copy of the letter after that request lives in your browser tab. The locked portion is ciphertext that cannot be read without a key the server releases after payment.",
    ],
  },
  {
    heading: "What we do store",
    items: [
      {
        title: "Account records",
        body: "If you create an account: your email address, your name if you give one, a hash of your password, and a Stripe customer reference. Never a letter, never a patient detail.",
      },
      {
        title: "Payment records",
        body: "A record that a purchase or subscription happened: the Stripe identifiers, the amount, the currency, the status, and a random draft identifier that says nothing about the letter it unlocks.",
      },
      {
        title: "Business leads",
        body: "If you submit the billing-services form: the name, organisation, email, phone, claim volume and challenge you entered, with the time you consented to be contacted.",
      },
      {
        title: "Anonymous counters",
        body: "Daily counts of events such as letter generated, checkout started, PDF downloaded, and which denial reason was selected. Counts only - no identifiers, no text.",
      },
      {
        title: "Rate-limit counters",
        body: "A salted hash of your IP address with a count and an expiry, used to enforce the free daily allowance and to stop abuse. The raw address is not stored, and the row expires automatically.",
      },
    ],
  },
  {
    heading: "Processors",
    paragraphs: [
      "We use a small number of providers to run the service. Each receives only what it needs to do its job.",
    ],
    table: {
      head: ["Processor", "What it receives", "Why"],
      rows: [
        [
          "Our hosting platform",
          "Network metadata and the request in transit; the pages you load",
          "Running the application",
        ],
        [
          "Our managed PostgreSQL provider",
          "Account, payment, lead, counter and rate-limit records",
          "Storing the data listed above",
        ],
        [
          "Anthropic",
          "The structured block of form fields used to draft the letter",
          "Generating the letter text",
        ],
        [
          "Stripe",
          "Your payment details, entered on Stripe's own checkout page",
          "Taking payment. We never see or store card numbers",
        ],
        [
          "Email provider, if configured",
          "The address and message for password resets and lead notifications",
          "Sending transactional email",
        ],
      ],
    },
  },
  {
    heading: "What we do not do",
    bullets: [
      "We do not sell personal information.",
      "We do not run advertising trackers, session replay, or third-party analytics that could capture form fields.",
      "We do not put claim details in URLs, in Stripe metadata, in analytics events, or in error reports.",
      "We do not log the prompt we send to the AI provider or the letter it returns.",
      "We do not use your letter content to train models.",
    ],
  },
  {
    heading: "If you are a HIPAA covered entity",
    paragraphs: [
      "Read this before your staff use the generator. If you enter patient identifiers alongside clinical facts, you are disclosing protected health information to us and to the processors listed above, and that disclosure needs to sit inside an appropriate business associate relationship.",
      "There are two ways to handle it. Either put the agreements in place before use - contact us and we will work through what is required, including the downstream agreements with our processors - or leave the identifiers out. The tool works without them: leave the patient name, date of birth, member ID and claim number blank, and the letter prints bracketed placeholders you fill in on the copy you send. You get the same argument with no identifiers leaving your office.",
    ],
    callout:
      "Never put patient or claim information in the billing-services contact form. That form goes to a sales inbox and is not covered by the handling described above.",
  },
  {
    heading: "Cookies and browser storage",
    bullets: [
      "A single session cookie, set only if you sign in. It is HTTP-only, same-site, and marked secure in production.",
      "No advertising or analytics cookies are set by this site.",
      "The generator deliberately does not use localStorage or sessionStorage for your form or your draft. That is why payment opens in a second tab - so the tab holding your draft stays alive.",
    ],
  },
  {
    heading: "Retention",
    bullets: [
      "Form data and letters: not retained at all.",
      "Rate-limit counters: expire automatically, typically within a day.",
      "Anonymous counters: retained indefinitely in aggregate form, with no identifiers.",
      "Account, payment and lead records: retained while the account or business relationship is active, and afterwards only as long as needed for accounting and legal obligations.",
    ],
  },
  {
    heading: "Your choices",
    bullets: [
      "Use the generator without an account, and without entering identifiers.",
      "Ask us what we hold about you, and ask for it to be corrected or deleted, at the contact address below. For letters the answer is nothing - there is no record to produce.",
      "Close your account at any time; payment records are kept only as long as accounting rules require.",
      "Depending on where you live, you may have additional rights over your personal information. Tell us what you are asking for and we will tell you how we can help.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "This service is for adults handling insurance claims. It is not directed at children, although a letter may of course concern a child as the patient.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      "If this policy changes in a way that affects how your entries are handled, the updated date above changes and the new version is posted here before it takes effect.",
      "Questions about this policy, or a request about your data: use the contact page, or write to the address in the operator details below.",
    ],
    callout:
      "Operator note before launch: insert your legal entity name, postal address and a privacy contact address, confirm the processor table matches your deployment, and have counsel review this page and the terms.",
  },
];

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Privacy policy"
      lede={`How ${siteConfig.name} handles the information you type, what it stores, and what it deliberately does not.`}
      updated="[DATE]"
      sections={SECTIONS}
      footnote="This policy describes what the application actually does. If you find a difference between this page and the product's behaviour, tell us - that is a bug, not a disclaimer."
    />
  );
}
