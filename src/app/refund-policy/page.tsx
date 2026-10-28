import type { Metadata } from "next";
import { ProsePage, type ProseSection } from "@/components/marketing/prose-page";
import { siteConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description:
    "How refunds work for a single letter purchase, how to cancel the monthly plan, and what happens to access after cancellation.",
  alternates: { canonical: "/refund-policy" },
};

const SECTIONS: ProseSection[] = [
  {
    heading: "Single letter purchases",
    paragraphs: [
      `A ${siteConfig.pricing.single.priceLabel} purchase unlocks one draft: the full text, editing, and both download formats. Because the letter is delivered in full the moment payment is confirmed, these purchases are generally not refundable.`,
      "We will refund one anyway in the situations below, because in each of them you did not get what you paid for.",
    ],
    bullets: [
      "The letter did not unlock after payment.",
      "The download failed and could not be made to work.",
      "The output was empty, truncated, or not a usable letter.",
      "You were charged twice for the same draft.",
      "The browser tab holding your draft was lost before you could download it. We cannot recover the letter - it was never stored - but we will refund the purchase.",
    ],
  },
  {
    heading: "How to request a refund",
    paragraphs: [
      "Use the contact page and include the Stripe receipt or the last four digits of the card and the approximate time of the charge. Do not send patient names, claim numbers or clinical details - we do not need them, and we do not want them in a support inbox.",
      "Refunds are issued to the original payment method. Stripe typically takes five to ten business days to return the funds to a card.",
    ],
  },
  {
    heading: "Monthly plan",
    items: [
      {
        title: "Renewal",
        body: `The plan is ${siteConfig.pricing.monthly.priceLabel} per month and renews automatically on the same date each month until you cancel. The renewal terms are shown before checkout.`,
      },
      {
        title: "Cancelling",
        body: "Cancel at any time from Billing in your account, which opens Stripe's billing portal. Cancellation takes effect at the end of the current period.",
      },
      {
        title: "Access after cancelling",
        body: "You keep full access until the end of the period you have already paid for. After that, generation returns to the free daily allowance and new letters need a single purchase to unlock.",
      },
      {
        title: "Part-month refunds",
        body: "Monthly fees are not pro-rated by default. If you cancel immediately after an unintended renewal and have not generated letters in that period, contact us and we will refund it.",
      },
    ],
  },
  {
    heading: "Failed payments",
    paragraphs: [
      "If a renewal payment fails, Stripe retries it on its own schedule and your plan moves to a past-due state. Access continues during the retry window so a card problem does not strand you mid-appeal. If the payment is never recovered, the plan lapses and the account returns to pay-per-letter.",
    ],
  },
  {
    heading: "Chargebacks",
    paragraphs: [
      "If something has gone wrong, contact us first - a refund is faster than a chargeback and we are not going to argue about a letter that did not work. Where a chargeback is raised without contact, we respond with the Stripe record of the purchase and the delivery event.",
    ],
    callout:
      "Operator note before launch: confirm these terms match what you have configured in Stripe, including retry behaviour and proration, and check the wording against your jurisdiction's consumer rules.",
  },
];

export default function RefundPolicyPage() {
  return (
    <ProsePage
      title="Refund and cancellation policy"
      lede="What is refundable, what is not, and how to cancel the monthly plan."
      updated="[DATE]"
      sections={SECTIONS}
    />
  );
}
