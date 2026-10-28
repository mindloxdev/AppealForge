import type { AppealPage } from "./types";

export const timelyFilingPage: AppealPage = {
  slug: "timely-filing-appeal-letter",
  seoTitle: "Timely Filing Appeal Letter (CO-29): Evidence That Works",
  metaDescription:
    "Appeal a CO-29 timely filing denial with dated proof of submission. What counts as evidence, which exceptions plans accept, and a free appeal letter draft.",
  h1: "Timely filing appeal letter",
  eyebrow: "Denial code CO-29",
  intro:
    "This is the one denial you cannot argue your way out of. It is won with a dated document showing the claim was submitted on time, or with a documented reason the filing clock should not have run.",
  toolPreset: "timely-filing",
  denialCode: "CO-29",
  denialReasonLabel: "Timely filing",
  heroPoints: [
    "What counts as proof of timely submission",
    "The exceptions plans actually consider",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What a timely filing denial means",
    paragraphs: [
      "CO-29 means the time limit for filing has expired. Nobody is disputing the care, the coding or the medical necessity. The plan is saying the claim arrived after its filing deadline, and nothing about the quality of the clinical record changes that.",
      "Filing limits vary widely by payer, product and contract. Medicare has a statutory limit for initial claims; commercial and employer plans set their own in the provider agreement, and secondary claims usually run from the primary payer's determination rather than the date of service.",
      "Because the limit lives in your contract rather than in a code description, confirm the one that applies to this payer and product before you argue about whether it was met.",
    ],
  },

  commonCauses: {
    heading: "Why claims miss the window",
    intro: "Knowing the cause tells you which document wins the appeal.",
    items: [
      {
        title: "A clearinghouse rejection was never worked",
        body: "A rejected claim never reached the payer as an accepted claim, so the clock kept running while the claim sat in a queue.",
      },
      {
        title: "The claim went to the wrong payer first",
        body: "Coordination of benefits sent it to a plan that was not primary, and the correct payer only saw it later.",
      },
      {
        title: "Coverage information was wrong at the time of service",
        body: "The patient supplied a plan that did not apply, and the correct coverage surfaced after the window had closed.",
      },
      {
        title: "Retroactive eligibility",
        body: "Coverage was added or reinstated with an effective date before the service, after the filing window had already run.",
      },
      {
        title: "The claim was lost after acceptance",
        body: "The payer accepted it and then has no record of it. Your clearinghouse report is the only thing that settles that disagreement.",
      },
    ],
  },

  strategies: {
    heading: "Evidence that strengthens the appeal, strongest first",
    items: [
      {
        title: "Clearinghouse acceptance report",
        body: "Dated, third-party and specific to the claim, with a trace number. Print the report that names the claim and reference it by name in the letter.",
      },
      {
        title: "Payer claim status record",
        body: "The payer's own system acknowledging the claim earlier than the denial implies - a portal screenshot or a call reference number.",
      },
      {
        title: "An earlier remittance for the same claim",
        body: "A previous denial or rejection proves the claim was in the payer's system on a date inside the window.",
      },
      {
        title: "Proof of delivery for paper claims",
        body: "Certified mail receipt or fax confirmation with the date.",
      },
      {
        title: "The primary payer EOB",
        body: "For secondary claims, it starts the clock on the date of that determination. Attach it even if you believe the plan already has it.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    bullets: [
      "The denial letter or EOB showing the filing determination",
      "The clearinghouse acceptance report with the trace number highlighted",
      "Payer portal screenshots or call references from the original submission",
      "Proof of mailing or fax confirmation for paper claims",
      "The primary payer EOB, where coordination of benefits caused the delay",
      "Eligibility records, where the coverage information was incorrect",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section",
    text: "Claim [CLAIM NUMBER] for services provided to [PATIENT NAME] on [DATE OF SERVICE] was submitted on [SUBMISSION DATE], within the filing limit that applies under [PLAN OR CONTRACT REFERENCE]. The enclosed clearinghouse acceptance report shows the claim was accepted by the plan on [DATE] under trace number [TRACE NUMBER].\n\nThe denial of this claim as untimely therefore appears to rest on an incomplete record of the original submission. I request that the plan reverse the timely filing denial, reinstate the claim as filed on [SUBMISSION DATE], and adjudicate it on the merits. If the plan maintains that no submission was received, please provide the claim receipt history relied on for that determination.",
    note: "An example of how dated evidence is presented. It is not a claim that any particular payer will accept it.",
  },

  faqs: [
    {
      question: "What is denial code CO-29?",
      answer:
        "CO-29 means the time limit for filing has expired. The CO group code makes the write-off a contractual obligation of the provider under most payer agreements, so the balance generally cannot be transferred to the patient.",
    },
    {
      question: "How long do I have to file a claim?",
      answer:
        "It depends on the payer and your contract, and secondary claims usually run from the primary payer's determination rather than the date of service. Check the provider agreement or manual for the payer in question - that is the limit that governs.",
    },
    {
      question: "Does a clearinghouse rejection count as a timely filing?",
      answer:
        "No. A rejection means the claim never reached the payer as an accepted claim, so the clock kept running. That is exactly why the rejection queue has to be worked daily, and why an acceptance report is the document that matters.",
    },
    {
      question: "Can the patient be billed when a claim is denied for timely filing?",
      answer:
        "Generally not, where the denial carries the CO contractual-obligation prefix and the delay was on the provider side. Confirm against your payer contract and state balance-billing rules before any balance moves.",
    },
    {
      question: "What if I have no proof of submission?",
      answer:
        "Be straight about it. Identify what actually caused the delay, document that, and ask for a one-time exception on that basis. Some plans will consider one where the service was clearly covered; many will not.",
    },
  ],

  related: [
    "co-197-denial-appeal-letter",
    "co-50-denial-appeal-letter",
    "co-97-bundling-denial-appeal-letter",
  ],
};
