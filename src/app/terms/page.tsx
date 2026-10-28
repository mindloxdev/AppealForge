import type { Metadata } from "next";
import { ProsePage, type ProseSection } from "@/components/marketing/prose-page";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of use for the AppealForge appeal letter generator: review duties, AI-generated content, subscription and fair-use terms, refunds, and limits of liability.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: ProseSection[] = [
  {
    heading: "1. What this service is",
    paragraphs: [
      `${siteConfig.name} generates a draft appeal letter from information you enter. The draft is produced by a language model working only from your entries. It is a starting document for a person to review, edit, verify and sign - not a finished legal or clinical document.`,
      "These terms are between you and the operator of this service. By using the site you accept them. If you do not accept them, do not use the site.",
    ],
  },
  {
    heading: "2. Your review duty",
    bullets: [
      "Read the whole letter before sending it to an insurer.",
      "Have the treating clinician review and sign anything clinical. The clinician is responsible for the accuracy of clinical statements.",
      "Replace or remove every bracketed placeholder. A placeholder means we did not have that fact, not that the fact does not matter.",
      "Confirm the appeal deadline, the appeals address and any required plan form yourself. Those come from your denial notice, not from us.",
    ],
  },
  {
    heading: "3. Not legal, medical or coding advice",
    paragraphs: [
      "Nothing here is legal advice, medical advice, or certified coding guidance, and no attorney-client or clinician-patient relationship is created by using the service.",
      "The explanatory content on this site describes common industry practice and is general information. Deadlines, codes, plan rules and regulations change and vary by plan, payer, state and product. Verify anything you rely on.",
    ],
  },
  {
    heading: "4. No guaranteed outcome",
    paragraphs: [
      "We do not promise that an appeal will be overturned, that a claim will be paid, or that any letter will be accepted. Appeal decisions are made by the plan, and by independent reviewers, on the record in front of them.",
    ],
  },
  {
    heading: "5. Acceptable use",
    bullets: [
      "Do not submit information you are not authorised to disclose.",
      "Do not use the service to submit a claim or statement you know to be false, or to create documentation that misrepresents care that was provided. Insurance fraud is a crime and we will cooperate with lawful investigations.",
      "Do not attempt to bypass the paywall, the rate limits, or the encryption on an unpaid draft, and do not probe, scrape or overload the service.",
      "Do not resell the output as your own product, or build a competing generator on top of this one.",
    ],
  },
  {
    heading: "6. Payment, renewal and fair use",
    items: [
      {
        title: "Single letter",
        body: `${siteConfig.pricing.single.priceLabel}, one-time. It unlocks the one draft it was bought for: the full text, editing, and both download formats. Regenerating that same draft after payment does not cost anything further.`,
      },
      {
        title: "Monthly plan",
        body: `${siteConfig.pricing.monthly.priceLabel} per month, renewing automatically until you cancel. It covers unlimited letter generation and downloads, subject to the fair-use protections below.`,
      },
      {
        title: "Fair use, stated plainly",
        body: "Automated abuse protection applies to every account: a ceiling of 60 generations per hour from one source, and per-endpoint limits on checkout, downloads and sign-in attempts. These exist to stop scripted abuse, not to ration normal work. If you are a high-volume biller and expect to approach them, contact us and we will raise them.",
      },
      {
        title: "Cancellation",
        body: "Cancel at any time from the billing portal. Cancellation stops the next renewal and your access continues until the end of the period you have already paid for.",
      },
    ],
    callout:
      "A one-time purchase never enrols you in a subscription, and we do not charge a subscription without the renewal terms being shown before checkout.",
  },
  {
    heading: "7. Refunds",
    paragraphs: [
      "Because the full letter is delivered immediately on payment, one-time purchases are generally not refundable. If the service failed - the letter did not unlock, the download did not work, or the output was unusable - contact us and we will refund it.",
      "Monthly subscriptions can be cancelled at any time and are not pro-rated by default. The refund and cancellation policy page sets this out in full.",
    ],
  },
  {
    heading: "8. Your content and ours",
    paragraphs: [
      "You keep all rights in what you enter and in the letter you receive, and you may use the letter for any lawful purpose, including sending it to an insurer. We claim no ownership of your letter and we do not keep a copy.",
      "The site itself - the software, the templates and the explanatory content - remains ours.",
    ],
  },
  {
    heading: "9. Availability",
    paragraphs: [
      "The service is provided as is. It depends on third parties and it can be unavailable, slow or degraded. Do not leave an appeal to the last day of a filing window and rely on this tool being up.",
    ],
  },
  {
    heading: "10. Limitation of liability",
    paragraphs: [
      "To the maximum extent the law allows, we are not liable for indirect, incidental, special or consequential damages, for lost revenue or claim payments, or for a denial that is upheld. Our total liability for any claim relating to the service is limited to the amount you paid us for the letter or subscription period in question.",
      "Some jurisdictions do not allow these limits, in which case they apply only as far as permitted.",
    ],
  },
  {
    heading: "11. Changes, governing law and contact",
    paragraphs: [
      "We may update these terms. The updated date changes, and continued use after that means you accept the new version.",
      "These terms are governed by the laws of [STATE / JURISDICTION], and disputes are to be brought in the courts of [VENUE]. Questions: use the contact page.",
    ],
    callout:
      "Operator note before launch: replace the entity, jurisdiction and venue placeholders, confirm the subscription and refund wording matches what Stripe is configured to do, and have counsel review this page and the privacy policy.",
  },
];

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of service"
      lede="A drafting tool, not an advisor. Three things matter most: the output is a draft, it is not legal or medical advice, and no outcome is promised."
      updated="[DATE]"
      sections={SECTIONS}
    />
  );
}
