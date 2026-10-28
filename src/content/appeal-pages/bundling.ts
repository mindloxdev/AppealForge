import type { AppealPage } from "./types";

export const bundlingPage: AppealPage = {
  slug: "co-97-bundling-denial-appeal-letter",
  seoTitle: "CO-97 Bundling Denial Appeal Letter: Modifiers and NCCI Edits",
  metaDescription:
    "Appeal a CO-97 or CO-236 bundling denial. When modifier 25, 59, XE, XS, XP or XU applies, what the note must show, and a free appeal letter draft.",
  h1: "CO-97 bundling denial appeal letter",
  eyebrow: "Denial codes CO-97 and CO-236",
  intro:
    "The plan treated this service as already paid inside another one. The appeal shows the work was separate - separate problem, separate site, separate session - and puts the modifier the documentation supports on the claim.",
  toolPreset: "bundling",
  denialCode: "CO-97",
  denialReasonLabel: "Bundling and NCCI edits",
  heroPoints: [
    "Modifier 25 and the X modifiers, and when each applies",
    "What the operative note has to show",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What bundling denials mean",
    paragraphs: [
      "CO-97 is described as the benefit for this service being included in the payment or allowance for another service that has already been adjudicated. CO-236 is its close relative: a procedure, or a procedure and modifier combination, that is not compatible with another procedure billed under correct-coding rules or state regulations.",
      "Both are edit-driven. An edit is a rule applied by software before a human sees the claim, so the appeal has to answer the rule rather than describe the patient. Two things have to be established: that the services were genuinely separate work, and that the coding on the claim reflects it.",
      "Not every bundled pair can be unbundled. Some code pairs permit a modifier when documentation supports a distinct service; others never do. Check the edit for your specific pair before writing, because an appeal on a pair that allows no override is a letter the reviewer cannot act on.",
    ],
  },

  commonCauses: {
    heading: "Why these denials happen",
    items: [
      {
        title: "The modifier was omitted",
        body: "The documentation supported a distinct service but the claim did not say so. This is usually a corrected claim rather than an appeal.",
      },
      {
        title: "The modifier was applied without support",
        body: "A modifier is a statement about the record. If the note does not describe distinct work, the modifier cannot rescue the line.",
      },
      {
        title: "One note covers two procedures",
        body: "Two procedures described in a single paragraph with one indication read as bundled work no matter what the claim says.",
      },
      {
        title: "The real issue is a global period",
        body: "A service inside another procedure's global period is a different argument, usually needing modifier 24 or 79 and an explanation of why it was unrelated.",
      },
      {
        title: "Times and sites are missing",
        body: "Separate encounter and separate structure arguments live or die on times and anatomic sites being in the note.",
      },
    ],
  },

  strategies: {
    heading: "Matching the modifier to the facts",
    intro:
      "Prefer the specific X modifier over 59 where one fits. The X modifiers exist because 59 was used as a catch-all, and payers audit it accordingly.",
    items: [
      {
        title: "Modifier 25",
        body: "A significant, separately identifiable evaluation and management service on the same day as a procedure. The note needs a distinct problem with its own history, examination and decision-making.",
      },
      {
        title: "Modifier 59",
        body: "A distinct procedural service where no more specific X modifier applies. State the distinction explicitly: different session, site, lesion or injury.",
      },
      {
        title: "Modifier XE",
        body: "A separate encounter. Put the times for both services in the note.",
      },
      {
        title: "Modifier XS",
        body: "A separate structure or organ. Name the anatomic site for each service.",
      },
      {
        title: "Modifier XP",
        body: "A separate practitioner. Name who performed each service and attach both notes.",
      },
      {
        title: "Modifier XU",
        body: "An unusual, non-overlapping service. Explain why the work does not overlap the main procedure's components.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    bullets: [
      "The denial letter or EOB showing the bundling determination",
      "The operative report or procedure note for each service",
      "The office note showing the separate problem addressed at the same visit",
      "Times, sites or session records that make the services distinct",
      "The corrected claim, where a modifier was omitted",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section",
    text: "The services billed on claim [CLAIM NUMBER] were separate and distinct. [PROCEDURE A, CPT CODE] was performed on [ANATOMIC SITE] at [TIME] for [INDICATION]. [PROCEDURE B, CPT CODE] was performed on [DIFFERENT SITE] at [TIME] for [SEPARATE INDICATION] and required its own [PREPARATION, ACCESS OR DECISION-MAKING].\n\nThe enclosed [OPERATIVE REPORT OR OFFICE NOTE] documents each service separately, including the distinct indication, the site and the time. Modifier [59 / XE / XS / XP / XU] is therefore supported on [CPT CODE]. I request that the plan reprocess claim [CLAIM NUMBER] and pay both lines as separately reportable services.",
    note: "An example of the structure. Only use a modifier your documentation actually supports - adding one to get a claim paid is the pattern post-payment audits look for.",
  },

  faqs: [
    {
      question: "What is denial code CO-97?",
      answer:
        "CO-97 means the benefit for the service is included in the payment for another service that has already been adjudicated - a bundling denial. CO-236 covers a procedure or modifier combination that is not compatible with another procedure billed.",
    },
    {
      question: "When should I use modifier 59 instead of an X modifier?",
      answer:
        "Use the X modifier that names the actual distinction: separate encounter, separate structure, separate practitioner, or unusual non-overlapping service. Reserve 59 for distinct procedural services where none of those fits.",
    },
    {
      question: "Can I just add a modifier and resubmit?",
      answer:
        "Only if the documentation supported it at the time of service. If it did, a corrected claim is usually faster than an appeal. If it did not, adding a modifier is not a fix - it is an audit risk.",
    },
    {
      question: "What if two different physicians performed the procedures?",
      answer:
        "That is modifier XP, separate practitioner. Name both clinicians in the letter and attach the note from each. It is one of the easiest bundling arguments to document.",
    },
    {
      question: "Is a global period denial the same as bundling?",
      answer:
        "No. A service inside another procedure's global period usually needs modifier 24 for an unrelated visit or 79 for an unrelated procedure, and the argument is that the service was unrelated to the original surgery.",
    },
  ],

  related: [
    "co-50-denial-appeal-letter",
    "medical-necessity-appeal-letter",
    "timely-filing-appeal-letter",
  ],
};
