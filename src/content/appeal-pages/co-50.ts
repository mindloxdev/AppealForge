import type { AppealPage } from "./types";

export const co50Page: AppealPage = {
  slug: "co-50-denial-appeal-letter",
  seoTitle: "CO-50 Denial Appeal Letter: Reading the Code and Answering It",
  metaDescription:
    "CO-50 means the payer did not deem the service medically necessary. Read the remittance correctly, pick the right fix, and generate a CO-50 appeal letter free.",
  h1: "CO-50 denial appeal letter",
  eyebrow: "Reading the remittance",
  intro:
    "Start from the remittance advice. CO-50 tells you who absorbs the balance, what the plan decided, and which of three very different fixes your claim actually needs.",
  toolPreset: "medical-necessity",
  denialCode: "CO-50",
  denialReasonLabel: "Medical necessity",
  heroPoints: [
    "What the CO and PR prefixes change",
    "Remark codes that name what was missing",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What CO-50 means on a remittance advice",
    paragraphs: [
      "CO-50 has two halves. The 50 is the reason: non-covered services because the payer does not deem this a medical necessity. The CO is the group code, and it means contractual obligation - under most payer agreements the write-off falls on the provider rather than the patient.",
      "That prefix matters more than people expect. With a CO group code you generally cannot transfer the denied amount to the patient while the denial stands, and the claim is yours to appeal. The same reason arriving as PR, patient responsibility, changes both the financial conversation and who holds the appeal right.",
      "Group codes and payer practice vary by contract and by state. Read your own remittance advice and payer agreement before deciding who can be billed for anything.",
    ],
  },

  commonCauses: {
    heading: "Three different problems hide behind one code",
    intro:
      "Before writing a clinical argument, work out which of these you actually have. The wrong route wastes a filing window.",
    items: [
      {
        title: "The documentation never reached the reviewer",
        body: "Records were requested and arrived late, went to the wrong queue, or were attached to a different claim. The fix is a short cover appeal that points to each enclosed page - not a long argument the reviewer would already accept.",
      },
      {
        title: "The coding does not support the procedure",
        body: "The diagnosis on the claim does not satisfy the plan policy for that service. No amount of clinical rhetoric helps, because the reviewer is comparing codes. If the correct ICD-10 code was omitted, a corrected claim is the route.",
      },
      {
        title: "The criteria were applied and the record needs arguing",
        body: "This is the real medical necessity appeal: severity, failed conservative care, the standard the care meets, the risk of withholding it, and a request for peer-to-peer review.",
      },
    ],
  },

  strategies: {
    heading: "Read the remark codes before writing anything",
    intro:
      "A reason code gives you the category. The remittance advice remark codes beside it usually tell you what was actually missing.",
    items: [
      {
        title: "Check the remark codes",
        body: "They commonly point to records not received, a named policy, or a specific missing element. They are the difference between answering the denial and guessing at it.",
      },
      {
        title: "Check whether any line paid",
        body: "A whole-claim denial on a multi-line claim where the office visit paid and the procedure did not is a narrower argument than it first appears.",
      },
      {
        title: "Check eligibility for the date of service",
        body: "An eligibility problem dressed as a clinical denial is solved by eligibility evidence, not by clinical notes.",
      },
      {
        title: "Ask for the criteria",
        body: "Request the clinical criteria and the reviewer's credentials in the letter. Both are routinely provided on request and both are useful if the appeal escalates.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    intro:
      "Match the enclosure list to the problem you identified above rather than sending everything by reflex.",
    bullets: [
      "The denial letter or EOB itself, so the reviewer can match your letter to their file in one step",
      "Clinical notes for the date of service and the visits that led to it",
      "Diagnostic results that establish severity",
      "The plan medical policy or coverage determination, where you are answering one",
      "A corrected claim, where the real problem is a code rather than the care",
      "Proof of the original records submission, where the dispute is whether they arrived",
    ],
  },

  sampleParagraph: {
    heading: "Sample opening",
    label: "Opening paragraph",
    text: "This letter is a formal [APPEAL LEVEL] appeal of the denial dated [DENIAL DATE] for claim [CLAIM NUMBER], adjudicated with reason code CO-50 for services rendered to [PATIENT NAME] on [DATE OF SERVICE]. The plan determined that [SERVICE, CPT CODE] was not medically necessary. The enclosed records establish that the service met the applicable criteria when it was ordered, and I am requesting that the plan overturn the denial and process the claim for payment.",
    note: "An illustration of the opening only. Nothing here predicts how a particular payer will decide a particular claim.",
  },

  faqs: [
    {
      question: "What is the difference between CO-50 and PR-50?",
      answer:
        "The reason is the same - not deemed medically necessary. CO makes it a contractual write-off that the provider absorbs and appeals; PR assigns it to the patient. The prefix decides who can be billed and who holds the appeal right, so read it before discussing a balance with anyone.",
    },
    {
      question: "Can I bill the patient for a CO-50 denial?",
      answer:
        "Generally not while the CO adjustment stands, because a contractual obligation is a provider write-off under the payer agreement. A signed advance notice of non-coverage, where the plan and your contract allow one, is the usual exception. Check your contract and your state rules.",
    },
    {
      question: "How many times can a CO-50 denial be appealed?",
      answer:
        "Most plans offer at least one internal level and then an external or independent review. Each level has its own deadline and each one generally wants something new: more documentation, a peer-to-peer review, or a reviewer who reads the chart.",
    },
    {
      question: "Does a corrected claim restart the timely filing clock?",
      answer:
        "Treat it as if it does not. If the original claim was filed on time, say so and attach the proof, because a corrected claim filed late can attract a filing denial on top of the original problem.",
    },
    {
      question: "Is CO-50 the same as an experimental denial?",
      answer:
        "No. CO-55 covers services the payer classifies as experimental or investigational, and that argument is about published evidence rather than severity. Check which code is actually on your remittance.",
    },
  ],

  related: [
    "medical-necessity-appeal-letter",
    "co-197-denial-appeal-letter",
    "experimental-investigational-denial-appeal-letter",
  ],
};
