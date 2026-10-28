import type { AppealPage } from "./types";

export const co197Page: AppealPage = {
  slug: "co-197-denial-appeal-letter",
  seoTitle: "CO-197 Appeal Letter: Precertification Absent Denials, Fixed",
  metaDescription:
    "CO-197 means authorization or notification was absent. Diagnose why the claim and the approval did not match, then generate the appeal or reprocess request free.",
  h1: "CO-197 denial appeal letter",
  eyebrow: "Reading the remittance",
  intro:
    "A CO-197 nearly always has a specific mechanical cause. Find the cause, name it in the first paragraph, and ask for the one action that fixes it.",
  toolPreset: "prior-authorization",
  denialCode: "CO-197",
  denialReasonLabel: "Prior authorization",
  heroPoints: [
    "A diagnostic path for mismatched authorizations",
    "Reprocess request or formal appeal - how to choose",
    "Free draft, no account needed",
  ],

  definition: {
    heading: "What CO-197 says, exactly",
    paragraphs: [
      "CO-197 is the claim adjustment reason code for precertification, authorization, notification or pre-treatment absent. It describes what the payer's system found when the claim was processed, which is not necessarily what happened in your office.",
      "Because it is administrative, the remedy is usually administrative too. The question to answer first is whether an approval exists at all. If one does, you are asking for a correction. If one does not, you are asking the plan to make a new decision after the fact.",
      "Code descriptions are standard but payer practice is not. Read the remark codes beside the reason code and the wording on the denial notice before deciding which route applies.",
    ],
  },

  commonCauses: {
    heading: "Reprocess or appeal: choosing the route",
    intro: "Four situations, four different letters. Say in the first sentence which one you are sending.",
    items: [
      {
        title: "A valid authorization exists for the service billed",
        body: "Send a reprocess or claim adjustment request with the approval attached. It is faster and does not consume an appeal level.",
      },
      {
        title: "The request was submitted and never answered",
        body: "Send a reprocess request with the submission receipt. The failure to respond before the date of service is the plan's event, not yours.",
      },
      {
        title: "No authorization exists, for any reason",
        body: "Send a formal appeal asking for retroactive authorization. You are asking for a new determination, so give the reviewer the clinical reason to grant it.",
      },
      {
        title: "The plan says authorization was not required",
        body: "Then there is nothing to appeal: ask for the denial to be corrected, and get the answer in writing for the next time the same code is billed.",
      },
    ],
  },

  strategies: {
    heading: "What makes a CO-197 letter work",
    items: [
      {
        title: "One cause, one sentence, up front",
        body: "The approval covers the service performed, and here is the correspondence. Or: the request went in on this date under this reference number and the plan had not responded.",
      },
      {
        title: "Every identifier the plan needs to match the file",
        body: "Authorization number, approval date, approved codes, date range, units, rendering provider and claim number.",
      },
      {
        title: "An explanation for any change",
        body: "Procedures change once they are underway and schedules move. Say why, and attach the operative note or the rescheduling record.",
      },
      {
        title: "A short clinical paragraph",
        body: "Even an administrative appeal benefits from showing the service was appropriate, because the person granting retroactive authorization has to defend it internally.",
      },
      {
        title: "A named, specific request",
        body: "Reprocess claim X against authorization Y, or grant retroactive authorization for service Z and pay the claim.",
      },
    ],
  },

  documentation: {
    heading: "What to enclose",
    bullets: [
      "The denial letter or EOB showing CO-197",
      "The authorization approval, portal screenshot or fax confirmation",
      "A dated call log with the representative name and reference number",
      "The submission receipt where the request went unanswered",
      "The operative note or scheduling record where the service changed",
      "Eligibility verification for the date of service",
    ],
  },

  sampleParagraph: {
    heading: "Sample RE block and opening",
    label: "Letter head and opening",
    text: "RE: Appeal of CO-197 denial - request to reprocess\n    Patient: [PATIENT NAME]   DOB: [DATE OF BIRTH]   Member ID: [MEMBER ID]\n    Claim #: [CLAIM NUMBER]   Date of service: [DATE OF SERVICE]\n    CPT: [CODES]   Authorization #: [AUTH NUMBER], approved [DATE]\n\nDear Appeals Reviewer:\n\nThis letter concerns claim [CLAIM NUMBER], denied with reason code CO-197 for services provided to [PATIENT NAME] on [DATE OF SERVICE]. Authorization [AUTH NUMBER] was approved on [DATE] for [CPT CODES], covering [DATE RANGE]. The enclosed approval shows the service was authorized before it was performed, and I am requesting that the plan reprocess the claim against that authorization.",
    note: "A formatting example. The authorization details in it are placeholders, not a template for claiming an approval you do not have.",
  },

  faqs: [
    {
      question: "Is CO-197 the same as CO-15?",
      answer:
        "No. CO-15 generally means the authorization number is missing, invalid or does not apply to the billed services or provider - closer to a data problem on the claim. CO-197 means the required approval was absent. The diagnostic work overlaps: compare the authorization details against the claim either way.",
    },
    {
      question: "How long does a reprocess take?",
      answer:
        "Plans vary, but a reprocess is normally faster than a formal appeal because no new determination is needed. Ask for a reference number when you request it and diary a follow-up a couple of weeks out.",
    },
    {
      question: "Can the patient be billed for a CO-197 denial?",
      answer:
        "Usually not while the CO adjustment stands, because obtaining authorization is generally the practice's responsibility under the payer agreement. Check your contract and state rules before moving any balance.",
    },
    {
      question: "The approved code is not the code we performed. What now?",
      answer:
        "Explain the clinical reason the procedure changed, attach the operative note, and ask the plan to extend the authorization to the code actually performed. Intraoperative changes are a recognised and well-understood reason for this mismatch.",
    },
    {
      question: "Does this tool write a reprocess request as well as an appeal?",
      answer:
        "Yes. Choose the prior authorization reason and say in the clinical section that an authorization exists; the letter then asks for a reprocess against that authorization rather than a new determination.",
    },
  ],

  related: [
    "prior-authorization-denial-appeal-letter",
    "co-50-denial-appeal-letter",
    "timely-filing-appeal-letter",
  ],
};
