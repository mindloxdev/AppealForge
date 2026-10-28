import type { AppealPage } from "./types";

export const priorAuthorizationPage: AppealPage = {
  slug: "prior-authorization-denial-appeal-letter",
  seoTitle: "Prior Authorization Denial Appeal Letter (CO-197) | Free Draft",
  metaDescription:
    "Appeal a prior authorization denial: retroactive authorization, an approval that was never matched, urgent care exceptions, and a free appeal letter draft.",
  h1: "Prior authorization denial appeal letter",
  eyebrow: "Denial code CO-197",
  intro:
    "Authorization denials are won with proof rather than persuasion. Either an approval exists and the claim was not matched to it, or there is a documented reason one could not be obtained before the service.",
  toolPreset: "prior-authorization",
  denialCode: "CO-197",
  denialReasonLabel: "Prior authorization",
  heroPoints: [
    "Retroactive authorization request built in",
    "Separate path when the auth exists but was not matched",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What a prior authorization denial means",
    paragraphs: [
      "CO-197 is described as precertification, authorization, notification or pre-treatment absent. It is an administrative finding: the plan is not saying the care was unnecessary, it is saying the approval it required was not in place, or could not be found, when the claim was adjudicated.",
      "That distinction shapes the whole letter. A clinical argument aimed at an administrative denial reads as though the writer did not understand the denial. Lead with the authorization facts, keep the clinical justification to a short supporting paragraph, and ask for a specific administrative action.",
      "Authorization rules change frequently and differ by plan, product and service. Confirm what applied on your date of service rather than assuming last quarter's list still holds.",
    ],
  },

  commonCauses: {
    heading: "Why the claim and the authorization did not match",
    intro: "Most of these denials have a mechanical cause that takes one sentence to state.",
    items: [
      {
        title: "Code mismatch",
        body: "The authorization covers a different CPT or HCPCS code than the one billed, often because the procedure changed once it was underway.",
      },
      {
        title: "Date outside the approved window",
        body: "The service landed a day or two outside the approved range, usually after a reschedule.",
      },
      {
        title: "Units or visits exceeded",
        body: "More sessions, visits or units were billed than were approved.",
      },
      {
        title: "Different rendering provider",
        body: "The approval names the requesting clinician and a partner or locum performed the service.",
      },
      {
        title: "Setting changed",
        body: "Approved as outpatient and performed as inpatient or observation, or performed at a different facility.",
      },
      {
        title: "Requested but never answered",
        body: "The request went in and the plan had not responded by the date of service. Keep the submission receipt - it is the appeal.",
      },
    ],
  },

  strategies: {
    heading: "What can strengthen this appeal",
    items: [
      {
        title: "Put the authorization number in the RE line",
        body: "With the approval date, the approved codes, the date range and the units. A reviewer should not have to hunt for it in a paragraph.",
      },
      {
        title: "Produce the call log",
        body: "Date, time, representative name and reference number. A dated reference number is worth more than a paragraph of recollection.",
      },
      {
        title: "State the urgency facts plainly",
        body: "If authorization could not be obtained first, say what happened, when, and why the service could not wait for a decision.",
      },
      {
        title: "Ask for retroactive authorization by name",
        body: "And cite the plan provision allowing retroactive review if your plan documents or provider manual contain one.",
      },
      {
        title: "Choose a reprocess over an appeal where you can",
        body: "If a valid authorization exists, asking for the claim to be reprocessed against it is faster and does not consume an appeal level.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    bullets: [
      "The denial letter or EOB showing the authorization determination",
      "The authorization approval letter, portal screenshot or fax confirmation",
      "A call log with date, time, representative and reference number",
      "The submission receipt, where the request went unanswered",
      "Emergency or urgent documentation, where that is the argument",
      "Eligibility verification for the date of service",
      "Brief clinical notes supporting the appropriateness of the service",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section, authorization obtained",
    text: "Authorization [AUTH NUMBER] was approved by the plan on [DATE] for [CPT CODES] for [PATIENT NAME], covering [START DATE] through [END DATE]. The service billed on claim [CLAIM NUMBER] was rendered on [DATE OF SERVICE], within that authorized period and for an authorized code. A copy of the approval is enclosed.\n\nBecause a valid authorization was in place at the time of service, this denial appears to reflect an adjudication error rather than a coverage determination. I request that the plan reprocess claim [CLAIM NUMBER] against authorization [AUTH NUMBER] and pay it at the contracted rate.",
    note: "An example of how to state the facts. It is not a template for asserting an authorization you do not hold.",
  },

  faqs: [
    {
      question: "What is denial code CO-197?",
      answer:
        "CO-197 is the claim adjustment reason code for precertification, authorization, notification or pre-treatment absent. The CO group code makes it a contractual obligation of the provider under most payer agreements, since obtaining authorization is usually the practice's responsibility.",
    },
    {
      question: "Can you get a retroactive authorization?",
      answer:
        "Often, yes. Plans grant them for emergencies, for patients whose coverage was unknown at the time of service, and for administrative errors where the service was clearly appropriate. You have to ask for it by name and give the reviewer a reason to allow it.",
    },
    {
      question: "The authorization exists. Do I appeal or resubmit?",
      answer:
        "Ask for a reprocess first, with the authorization details attached. It is faster than a formal appeal and does not use up an appeal level. Keep the reference number you are given.",
    },
    {
      question: "Does an authorization guarantee payment?",
      answer:
        "No. An authorization usually confirms medical necessity review, not eligibility, benefits or coding. A claim with a valid authorization can still be denied for eligibility, filing or a coding mismatch, which is why those get checked before an appeal is written.",
    },
    {
      question: "How quickly do I need to act?",
      answer:
        "Faster than the appeal deadline suggests. Many plans operate a retroactive-review window that is far shorter than the appeal window, sometimes measured in days from the date of service. Call to confirm before posting anything.",
    },
  ],

  related: [
    "co-197-denial-appeal-letter",
    "medical-necessity-appeal-letter",
    "out-of-network-denial-appeal-letter",
  ],
};
