import type { AppealPage } from "./types";

export const patientsPage: AppealPage = {
  slug: "appeal-letter-for-patients",
  seoTitle: "Insurance Appeal Letter for Patients: Free Template Generator",
  metaDescription:
    "Write your own health insurance appeal letter. What to ask your doctor for, what to say, what to attach, and a free draft in plain first-person language.",
  h1: "Insurance appeal letter for patients",
  eyebrow: "For members and families",
  intro:
    "You do not need a lawyer or a billing background to appeal a denied claim. You need the denial notice, a few facts from your doctor, and a letter that asks the plan for one specific thing.",
  toolPreset: "medical-necessity",
  denialCode: "",
  denialReasonLabel: "Any denial reason",
  heroPoints: [
    "Written in the first person, in plain language",
    "A checklist of what to ask your doctor's office for",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "Start with the denial notice, not the bill",
    paragraphs: [
      "The bill tells you what you might owe. The denial letter, or the explanation of benefits, tells you why - and that is what you appeal. Find four things on it before writing anything: the claim number, the date of service, the reason the plan gives, and the deadline and address for filing an appeal.",
      "If the reason appears as a code, that code is the argument you have to answer. A medical necessity denial is answered with clinical detail. An authorization denial is answered with proof that approval existed or could not be obtained. A network denial is answered with why this provider was the one you could reach. The generator picks the matching argument once you select the reason.",
      "Codes and plan wording vary. The explanation printed on your own notice governs, so read it carefully and quote it in your letter.",
    ],
  },

  commonCauses: {
    heading: "Ask your doctor's office for three things",
    intro:
      "Most practices have someone who handles denials every day. Ask for that person - the billing office or the prior authorization coordinator - rather than leaving a message for the clinician.",
    items: [
      {
        title: "Your records, or a letter of medical necessity",
        body: "You are entitled to request your own records. The notes are what show the plan how severe the problem is and what had already been tried.",
      },
      {
        title: "Any prior authorization history",
        body: "Whether an approval was requested, when, what the plan said, and any reference numbers.",
      },
      {
        title: "A peer-to-peer review request",
        body: "Only your clinician can do this one. It is a call between your doctor and a doctor at the plan, and for clinical denials it is one of the most effective steps available.",
      },
    ],
  },

  strategies: {
    heading: "What your letter needs to say",
    items: [
      {
        title: "Who you are and which claim this is",
        body: "Name, date of birth, member ID, claim number, date of service, and the date of the denial.",
      },
      {
        title: "What the plan decided, in its words",
        body: "Quote the denial reason so the reviewer can match your letter to their file.",
      },
      {
        title: "What actually happened",
        body: "The condition, how long it has gone on, how severe it is, what it stops you doing, and what you already tried that did not work.",
      },
      {
        title: "Why the care was necessary",
        body: "What your clinician expected it to change, and what happens to you without it.",
      },
      {
        title: "One specific request",
        body: "Overturn the denial and pay the claim. Add a request for the clinical criteria used and the reviewer's credentials - both are normally provided on request.",
      },
      {
        title: "A list of what you are enclosing",
        body: "So the reviewer knows what should be in the envelope, and you have a record of what you sent.",
      },
    ],
  },

  documentation: {
    heading: "What to attach",
    intro: "Keep it to what supports the appeal. More paper is not more persuasive.",
    bullets: [
      "A copy of the denial letter or explanation of benefits",
      "The relevant clinical notes from your doctor's office",
      "Test, imaging or laboratory results that show how serious the problem is",
      "Records of treatments you already tried and how they went",
      "Any prior authorization paperwork",
      "Your own dated log of calls to the plan, with reference numbers",
    ],
  },

  sampleParagraph: {
    heading: "Sample paragraph",
    label: "Your own words, in formal form",
    text: "I am appealing the denial dated [DENIAL DATE] of claim [CLAIM NUMBER] for the [SERVICE] I received on [DATE OF SERVICE]. The plan states that [QUOTE THE DENIAL REASON].\n\nI have had [CONDITION] since [DATE]. My symptoms are [SYMPTOMS], and they have reached the point where I cannot [SPECIFIC THING YOU CANNOT DO]. Before this service I tried [TREATMENT] from [DATE] to [DATE] and [TREATMENT] from [DATE] to [DATE]. Neither worked, and my doctor documented that in the records enclosed with this letter.\n\nMy doctor recommended [SERVICE] because [REASON]. I am asking the plan to overturn this denial and pay the claim. Please also send me the clinical criteria used to make this decision and the credentials of the reviewer who made it.",
    note: "An example of the tone and order. Fill in only what your own records support, and leave anything you are unsure about for your doctor's office to confirm.",
  },

  faqs: [
    {
      question: "Can I appeal a denied claim myself?",
      answer:
        "Yes. Members have appeal rights under their plan documents, and for most plans under federal or state rules as well. Your clinician can appeal too, and the strongest cases usually involve both: the clinical letter with the records, and your own letter carrying the appeal.",
    },
    {
      question: "How long do I have to appeal?",
      answer:
        "Check the deadline printed on your denial notice - it governs, and it differs by plan and product. File well before it rather than on the last day, because a late appeal is dismissed without anyone reading the argument.",
    },
    {
      question: "What is a peer-to-peer review and can I request one?",
      answer:
        "It is a conversation between your treating clinician and a physician at the insurance company. Only the clinician can request it, so ask your doctor's office to - for clinical denials it is one of the most effective steps available.",
    },
    {
      question: "Do I have to pay the bill while I appeal?",
      answer:
        "Ask the provider to hold the account while the appeal is pending; most will. If the denial carries a CO code, the balance is generally the provider's write-off rather than yours, so get that clarified before paying anything.",
    },
    {
      question: "What if I do not have all the clinical details?",
      answer:
        "Leave them blank. The letter marks each missing fact with a bracketed placeholder instead of guessing, and a reviewer would far rather see a blank than a wrong date.",
    },
    {
      question: "Is this legal advice?",
      answer:
        "No. This is a drafting tool. It produces a letter from the facts you enter, does not give legal or medical advice, and does not promise any outcome. For a denial involving large sums or a serious condition, consider a patient advocate or an attorney.",
    },
  ],

  related: [
    "medical-necessity-appeal-letter",
    "out-of-network-denial-appeal-letter",
    "experimental-investigational-denial-appeal-letter",
  ],
};
