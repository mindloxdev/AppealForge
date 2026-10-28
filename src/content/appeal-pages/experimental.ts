import type { AppealPage } from "./types";

export const experimentalPage: AppealPage = {
  slug: "experimental-investigational-denial-appeal-letter",
  seoTitle: "Experimental or Investigational Denial Appeal Letter (CO-55)",
  metaDescription:
    "Appeal a CO-55 experimental or investigational denial with regulatory status, guidelines and evidence for your indication. Free appeal letter draft.",
  h1: "Experimental or investigational denial appeal",
  eyebrow: "Denial code CO-55",
  intro:
    "This denial is an argument about evidence, and evidence is answerable. The letter has to show the treatment is established for this indication, and that your patient is the patient in the studies.",
  toolPreset: "experimental",
  denialCode: "CO-55",
  denialReasonLabel: "Experimental or investigational",
  heroPoints: [
    "Indication-first structure",
    "Only cites what you actually supply",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What this denial means",
    paragraphs: [
      "CO-55 is described as a procedure, treatment or drug deemed experimental or investigational by the payer. Plans reach that conclusion through a technology assessment policy: an internal document reviewing the literature for a service and concluding whether it is established, still investigational, or established for some indications and not others.",
      "That last category is where most of these denials live. The same drug, device or test can be routine for one indication and investigational for another, so the first job of the appeal is not to defend the treatment in general. It is to pin the argument to your indication, in your patient, with the evidence that covers it.",
      "Classifications change as literature accumulates, and policies are revised on their own schedule. Ask for the policy and its revision date rather than assuming the version you read last year still applies.",
    ],
  },

  commonCauses: {
    heading: "Why this denial appears",
    items: [
      {
        title: "The indication is off-label",
        body: "Off-label use is lawful and common, and many plans cover it when a recognised compendium or guideline supports it. The denial usually turns on whether that support was shown.",
      },
      {
        title: "The policy is older than the evidence",
        body: "A technology assessment that has not been revised since before the trials you are citing is a fact worth surfacing.",
      },
      {
        title: "The submitted record did not match the studied population",
        body: "The evidence may support the service for patients at a particular stage or after particular failed treatments, and the note did not establish that.",
      },
      {
        title: "No supporting literature was submitted at all",
        body: "A reviewer applying a technology assessment policy has nothing to weigh against it unless you provide it.",
      },
    ],
  },

  strategies: {
    heading: "The three pillars of the argument",
    items: [
      {
        title: "Regulatory status",
        body: "Whether the drug, device or test is cleared or approved, and for what. Name the status and date only if you have it; if the use is off-label, say so plainly and move to the next pillar.",
      },
      {
        title: "Professional consensus",
        body: "A specialty society guideline, national clinical pathway or recognised drug compendium that addresses this use. A guideline naming your indication is usually the single most persuasive document in the file.",
      },
      {
        title: "Published evidence in this population",
        body: "Trials, cohort studies or systematic reviews covering patients like yours. Two well-chosen papers that match the indication beat a bibliography of twenty.",
      },
      {
        title: "A patient-matching paragraph",
        body: "Diagnosis, stage or severity, prior treatments and their outcomes, and any eligibility criterion the studies used. A reviewer who accepts the evidence but cannot match the patient to it will uphold the denial.",
      },
      {
        title: "A request for the plan's own policy",
        body: "Ask for the technology assessment relied on and its revision date, along with the literature it cites.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    intro:
      "Attach what you cite. A guideline named but not enclosed invites the reviewer to decide it does not say what you claim.",
    bullets: [
      "The denial letter or EOB showing the investigational determination",
      "Regulatory approval or clearance documentation, where it exists",
      "The specialty society guideline or compendium entry for this indication",
      "Peer-reviewed articles covering this patient population",
      "Clinical notes establishing that the patient matches that population",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section",
    text: "[SERVICE] is not experimental for the indication at issue. [REGULATORY STATUS AND DATE, IF AVAILABLE], and its use in [CONDITION] is addressed in [GUIDELINE, COMPENDIUM OR PEER-REVIEWED SOURCE], enclosed as exhibit [NUMBER].\n\nThe patient meets the criteria described in that source: [DIAGNOSIS] confirmed on [DATE] by [TEST OR FINDING], [STAGE OR SEVERITY], following documented failure of [PRIOR TREATMENTS, WITH DATES AND OUTCOMES]. The enclosed records establish each of these facts.\n\nI request that the plan overturn the denial, and that any further adverse determination be made only after a peer-to-peer review with a board-certified [SPECIALTY] physician who treats this condition. Please also provide the technology assessment policy and the literature relied on in classifying this service as investigational.",
    note: "An illustration of structure. This tool will not supply citations: if you do not provide a source, the letter inserts a bracketed placeholder rather than naming one.",
  },

  faqs: [
    {
      question: "What is denial code CO-55?",
      answer:
        "CO-55 means the payer considers the procedure, treatment or drug experimental or investigational. It is applied through the plan's technology assessment policy, usually for a specific indication rather than the service in general.",
    },
    {
      question: "Is off-label use automatically experimental?",
      answer:
        "No. Off-label prescribing is lawful and common, and many plans cover it where a recognised compendium or specialty guideline supports the use. Say in the letter that the use is off-label and then show the support - the reviewer already knows.",
    },
    {
      question: "How many studies should I attach?",
      answer:
        "Few and well chosen. A guideline or compendium entry naming the indication, plus one or two studies in a matching population, is stronger than a long list. Highlight the relevant passages.",
    },
    {
      question: "Will the letter cite evidence for me?",
      answer:
        "No, and that is deliberate. A fabricated citation in a letter to a medical reviewer destroys the appeal and the credibility of the practice that sent it. Anything you do not supply appears as a bracketed placeholder.",
    },
    {
      question: "Can a patient appeal this type of denial?",
      answer:
        "Yes, and often should, because member appeals lead to external review where an independent clinician reads the evidence. The treating clinician's letter and records make the case; the member letter carries it into that process.",
    },
  ],

  related: [
    "medical-necessity-appeal-letter",
    "co-50-denial-appeal-letter",
    "appeal-letter-for-patients",
  ],
};
