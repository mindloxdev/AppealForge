import type { AppealPage } from "./types";

export const medicalNecessityPage: AppealPage = {
  slug: "medical-necessity-appeal-letter",
  seoTitle: "Medical Necessity Appeal Letter: Generator, Sample and Checklist",
  metaDescription:
    "Write a medical necessity appeal letter for a denied claim. The facts reviewers look for, a sample paragraph, a document checklist, and a free draft.",
  h1: "Medical necessity appeal letter",
  eyebrow: "Denial code CO-50",
  intro:
    "The plan says the service was not medically necessary. Your record says otherwise. This builds the letter that puts your record in front of a reviewer in the order they read it - and marks every fact you do not supply rather than inventing one.",
  toolPreset: "medical-necessity",
  denialCode: "CO-50",
  denialReasonLabel: "Medical necessity",
  heroPoints: [
    "Built around the plan's own medical policy criteria",
    "Includes the peer-to-peer review request",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What a medical necessity denial means",
    paragraphs: [
      "The claim adjustment reason code CO-50 is described as non-covered services because the payer does not deem the service a medical necessity. Read that carefully: it is a statement about the criteria the payer applied to the documentation it held, not a finding that the treating clinician was wrong.",
      "Those criteria are written down somewhere. They may live in the plan's own medical policy, in a licensed criteria set such as InterQual or MCG, or - for Medicare - in a local or national coverage determination. The first reviewer is often working from a checklist drawn from that document, confirming whether certain elements appear in your notes.",
      "That is the opening an appeal uses. You are not arguing about medicine in the abstract: you are supplying the elements that were missing, in terms the reviewer can match to their own criteria, and asking for a clinician in the same specialty to look at it.",
      "Codes and payer explanations vary. Confirm the actual wording on your explanation of benefits or denial notice before you rely on any code description, including this one.",
    ],
  },

  commonCauses: {
    heading: "Common reasons this denial appears",
    intro:
      "Most medical necessity denials are not disagreements about care. They are gaps between what the record said and what the criteria asked for.",
    items: [
      {
        title: "Conservative treatment is not documented",
        body: "The note says the patient has tried everything, but no dates, durations, doses or outcomes appear. A reviewer working from a criteria set cannot credit an assertion.",
      },
      {
        title: "Severity is described, not measured",
        body: "Adjectives rarely satisfy criteria. Pain scores, exam findings, measured limits and test results do.",
      },
      {
        title: "The records never reached the reviewer",
        body: "Documentation was requested and sent late, sent to the wrong queue, or attached to a different claim. The decision was made on an incomplete file.",
      },
      {
        title: "Diagnosis and procedure do not line up",
        body: "The ICD-10 code on the claim does not support the procedure under the plan policy, so the edit fires before any clinical review happens.",
      },
    ],
  },

  strategies: {
    heading: "What can strengthen a medical necessity appeal",
    intro: "Five things carry most of the weight. Supply them in this order.",
    items: [
      {
        title: "Severity, with numbers",
        body: "Pain scores, examination findings, imaging or laboratory results, and measured functional limits. Say what the patient cannot do.",
      },
      {
        title: "Duration, with dates",
        body: "How long the problem has persisted, anchored to the visits that documented it.",
      },
      {
        title: "Failed conservative care, itemised",
        body: "Each treatment with its dates, doses and documented response. Twelve weeks of supervised therapy from May to August reads differently from the patient has tried physical therapy.",
      },
      {
        title: "Why this service, now",
        body: "What the service changes about management, and the documented risk of waiting - progression, permanent injury, avoidable surgery or admission.",
      },
      {
        title: "The standard you are measuring against",
        body: "The plan medical policy, coverage determination or specialty society guideline the care satisfies. Only name what you have and can attach.",
      },
    ],
  },

  documentation: {
    heading: "Records that usually matter",
    intro:
      "What belongs in the envelope depends on the denial, the payer and the plan's appeal process. These are the records that most often carry a medical necessity appeal.",
    bullets: [
      "The denial letter or explanation of benefits showing the determination",
      "Office notes for the visit in question and the visits before it",
      "Imaging, laboratory or diagnostic results that document severity",
      "Therapy notes, medication records or injection records showing what was tried and what happened",
      "The insurer medical policy or coverage determination you are answering",
      "The specialty society guideline pages you cite, if you cite any",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Argument section, abridged",
    text: "The denial states that [SERVICE] is not medically necessary. The enclosed records document a [DURATION] history of [CONDITION] at [SEVERITY], with [OBJECTIVE FINDING] recorded on examination on [DATE] and progression since [DATE]. Conservative management has failed: [TREATMENT] from [DATE] to [DATE], [TREATMENT] at [DOSE], and [TREATMENT] on [DATE], each producing [DOCUMENTED RESPONSE].\n\n[SERVICE] is the appropriate next step for this presentation, consistent with [CITE APPLICABLE CLINICAL GUIDELINE]. Deferring it leaves a patient with [DOCUMENTED RISK] without a treatment plan. I request that the plan overturn this denial and process the claim for payment, and that any further adverse determination be made only after a peer-to-peer review with a board-certified physician in the same specialty.",
    note: "An example of structure, not a prediction. Every bracketed field has to be replaced with something your own record supports.",
  },

  faqs: [
    {
      question: "What is denial code CO-50?",
      answer:
        "CO-50 is the claim adjustment reason code for a service the payer does not consider medically necessary under the criteria it applied. The CO group code makes it a contractual obligation of the provider under most payer agreements, which affects who can be billed. Check your own remittance advice: payers apply codes differently.",
    },
    {
      question: "Who should sign a medical necessity appeal letter?",
      answer:
        "The treating clinician. A billing office can prepare and send the letter, but the clinical statements belong to the person who examined the patient and can defend them in a peer-to-peer review.",
    },
    {
      question: "How long should the letter be?",
      answer:
        "One to two pages. Letters generated here run roughly 400 to 700 words, which is enough to cover severity, failed treatment, the standard applied and the specific request without burying any of it.",
    },
    {
      question: "Do I need to cite a clinical guideline to appeal?",
      answer:
        "No, but a guideline you actually hold and can attach is persuasive. If you do not have one, the letter inserts a bracketed placeholder rather than naming a source it cannot support - a fabricated citation damages the appeal and the credibility of the practice that sent it.",
    },
    {
      question: "What is a peer-to-peer review?",
      answer:
        "A conversation between the treating clinician and a physician working for the plan. For clinical denials it moves the decision from a checklist to a clinician, which is why the generated letter requests one and asks for a reviewer in the same specialty.",
    },
    {
      question: "How long do I have to appeal?",
      answer:
        "It depends on the plan and the product, and Medicare timelines differ by program again. The only deadline to rely on is the one printed on your denial notice - verify it before you file.",
    },
  ],

  related: [
    "co-50-denial-appeal-letter",
    "prior-authorization-denial-appeal-letter",
    "experimental-investigational-denial-appeal-letter",
    "appeal-letter-for-patients",
  ],
};
