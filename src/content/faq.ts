export interface FaqEntry {
  question: string;
  answer: string;
  group: "Using the tool" | "Letters and accuracy" | "Privacy and security" | "Billing";
}

export const SITE_FAQS: FaqEntry[] = [
  {
    group: "Using the tool",
    question: "Do I need an account to use the generator?",
    answer:
      "No. Pick a denial reason, fill in the three steps, and read the draft - no signup, no email. An account is only needed for the monthly plan, because a subscription has to live somewhere you can manage and cancel it.",
  },
  {
    group: "Using the tool",
    question: "How long does a letter take to generate?",
    answer:
      "Usually 20 to 40 seconds. The progress panel tells you which stage it is at. Keep the tab open while it works - the draft only exists in that tab.",
  },
  {
    group: "Using the tool",
    question: "How many free drafts do I get?",
    answer:
      "Three per day. The counter resets daily and is shown on the generator after your first draft. The monthly plan removes the daily cap.",
  },
  {
    group: "Using the tool",
    question: "Can I change the letter after it is generated?",
    answer:
      "Yes. Once the letter is unlocked, Edit letter opens the full text in an editor. Your edits are what gets exported to Word and PDF.",
  },
  {
    group: "Using the tool",
    question: "What if my denial reason is not in the list?",
    answer:
      "Choose Other and quote the plan's wording. The letter then answers the reason as written rather than forcing it into a category it does not fit.",
  },
  {
    group: "Letters and accuracy",
    question: "Will the letter invent facts to fill gaps?",
    answer:
      "No. Anything you do not provide appears as a bracketed placeholder such as [DATE OF PRIOR AUTH REQUEST]. The model is instructed never to invent clinical details, dates, test results, guideline names, policy numbers or statutes, and the output is checked for structure before you see it.",
  },
  {
    group: "Letters and accuracy",
    question: "Does the letter cite clinical guidelines?",
    answer:
      "Only the ones you supply. If you give it a policy number or a specialty society guideline, it references that. If you do not, it writes a bracketed note for you to fill in - it will not name a source it cannot support.",
  },
  {
    group: "Letters and accuracy",
    question: "Who should review the letter before it is sent?",
    answer:
      "A qualified person, always. Clinical statements belong to the treating clinician, who should read and sign anything that asserts a diagnosis, a severity or a treatment history.",
  },
  {
    group: "Letters and accuracy",
    question: "Will my appeal be approved?",
    answer:
      "No tool can tell you that, and any service that promises it is not being straight with you. What this does is put your own facts in the structure a reviewer expects, organised around the denial code you are actually answering.",
  },
  {
    group: "Letters and accuracy",
    question: "How long are the letters?",
    answer:
      "Roughly 400 to 700 words, in formal letter format: sender block, date, appeals address, RE line, opening, background, argument, specific request, enclosures and signature block.",
  },
  {
    group: "Privacy and security",
    question: "Do you store the letters or the claim details?",
    answer:
      "No. The form is processed in memory to draft the letter and then discarded. There is no database table for letters or patient details. The consequence is that a closed tab loses the draft for good - nobody can recover it, including us.",
  },
  {
    group: "Privacy and security",
    question: "Why does payment open in a second tab?",
    answer:
      "Because the draft lives only in the tab you generated it in. Sending that tab to Stripe would destroy it, so checkout opens alongside and hands the key back when payment is confirmed.",
  },
  {
    group: "Privacy and security",
    question: "Is this HIPAA compliant?",
    answer:
      "We do not make that claim. The application is built to minimise and not retain claim data, but compliance depends on agreements and operational safeguards across every provider involved, not on one product's architecture. If you are a covered entity, read the HIPAA section of the privacy policy before your staff enter patient identifiers.",
  },
  {
    group: "Privacy and security",
    question: "Can I use it without entering patient identifiers?",
    answer:
      "Yes, and for many practices that is the right call. Leave the patient name, date of birth, member ID and claim number blank; the letter prints bracketed placeholders and you complete them on the printed copy.",
  },
  {
    group: "Billing",
    question: "What does a single purchase cover?",
    answer:
      "The one draft on your screen when you pay: full text, editing, and both download formats. Regenerating that same letter afterwards costs nothing more.",
  },
  {
    group: "Billing",
    question: "What happens if generation fails after I have paid?",
    answer:
      "Payment and generation are separate steps: you only pay after a draft exists. If a regeneration fails afterwards, nothing further is charged, and your existing unlock still applies.",
  },
  {
    group: "Billing",
    question: "How do I cancel the monthly plan?",
    answer:
      "Account, then Billing, then Manage billing - which opens Stripe's portal. Cancelling stops the next renewal and keeps access until the end of the paid period.",
  },
  {
    group: "Billing",
    question: "Do you offer refunds?",
    answer:
      "If the service failed - the letter did not unlock, the download did not work, or the output was unusable - yes. The refund and cancellation policy sets out the detail.",
  },
];

export const FAQ_GROUPS = [
  "Using the tool",
  "Letters and accuracy",
  "Privacy and security",
  "Billing",
] as const;
