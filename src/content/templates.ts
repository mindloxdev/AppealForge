import { DENIAL_REASONS, type DenialReasonKey } from "@/content/denial-reasons";

/**
 * The blank template library.
 *
 * Every template is a skeleton: a formal letter frame with bracketed fields and
 * prompts for the argument section. None of them contains invented patient
 * details or pre-written clinical claims - a template that already carries
 * someone else's reasoning is worse than a blank one, because it invites you to
 * leave in a sentence that is not true of your patient.
 */

export interface LetterTemplate {
  slug: string;
  title: string;
  /** Short statement of when this template fits. */
  useCase: string;
  description: string;
  denialReason: DenialReasonKey;
  codes: string[];
  /** Written in the first person for the patient-facing template. */
  voice: "provider" | "patient";
  searchTerms: string[];
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    slug: "medical-necessity-appeal-template",
    title: "Medical necessity appeal template",
    useCase: "The plan says the service was not medically necessary.",
    description:
      "Prompts for severity, duration, failed conservative treatment, the standard the care meets, and a peer-to-peer review request.",
    denialReason: "medical-necessity",
    codes: ["CO-50"],
    voice: "provider",
    searchTerms: ["medical necessity", "not medically necessary", "clinical"],
  },
  {
    slug: "co-50-appeal-template",
    title: "CO-50 appeal template",
    useCase: "Your remittance advice shows reason code CO-50.",
    description:
      "The same medical necessity frame, with the RE line already set up to quote the CO-50 adjustment and the claim identifiers a reviewer needs.",
    denialReason: "medical-necessity",
    codes: ["CO-50"],
    voice: "provider",
    searchTerms: ["co50", "co-50", "remittance", "carc"],
  },
  {
    slug: "prior-authorization-appeal-template",
    title: "Prior authorization appeal template",
    useCase: "An authorization was required and the plan did not find one.",
    description:
      "Two paths in one skeleton: an approval that exists and was not matched, or a documented reason approval could not be obtained first.",
    denialReason: "prior-authorization",
    codes: ["CO-197"],
    voice: "provider",
    searchTerms: ["prior auth", "precertification", "authorization"],
  },
  {
    slug: "co-197-appeal-template",
    title: "CO-197 appeal template",
    useCase: "Your remittance advice shows reason code CO-197.",
    description:
      "Structured as a reprocess request first, with the authorization number, approved codes, date range and units in the RE block.",
    denialReason: "prior-authorization",
    codes: ["CO-197"],
    voice: "provider",
    searchTerms: ["co197", "co-197", "precert"],
  },
  {
    slug: "timely-filing-appeal-template",
    title: "Timely filing appeal template",
    useCase: "The plan says the claim arrived after its filing deadline.",
    description:
      "Built around dated proof: the clearinghouse acceptance report, the trace number, and the exception you are relying on.",
    denialReason: "timely-filing",
    codes: ["CO-29"],
    voice: "provider",
    searchTerms: ["timely filing", "late claim", "filing limit"],
  },
  {
    slug: "co-29-appeal-template",
    title: "CO-29 appeal template",
    useCase: "Your remittance advice shows reason code CO-29.",
    description:
      "The timely filing frame with space for the original submission date, the acceptance record and the primary payer determination.",
    denialReason: "timely-filing",
    codes: ["CO-29"],
    voice: "provider",
    searchTerms: ["co29", "co-29"],
  },
  {
    slug: "bundling-ncci-appeal-template",
    title: "Bundling and NCCI appeal template",
    useCase: "A line was bundled into another service on the claim.",
    description:
      "Prompts for the separate indication, site, session and practitioner, and for the modifier the documentation supports.",
    denialReason: "bundling",
    codes: ["CO-97", "CO-236"],
    voice: "provider",
    searchTerms: ["bundling", "ncci", "modifier 59", "unbundle"],
  },
  {
    slug: "co-97-appeal-template",
    title: "CO-97 appeal template",
    useCase: "Your remittance advice shows reason code CO-97.",
    description:
      "The bundling frame with the code pair, the modifier and the supporting note referenced in the opening paragraph.",
    denialReason: "bundling",
    codes: ["CO-97"],
    voice: "provider",
    searchTerms: ["co97", "co-97", "included in payment"],
  },
  {
    slug: "coding-modifier-appeal-template",
    title: "Coding or modifier appeal template",
    useCase: "The code or modifier on the claim was rejected as inconsistent.",
    description:
      "Makes you state up front whether this is a corrected claim or an appeal, then names the corrected code and the line of the note that supports it.",
    denialReason: "coding-modifier",
    codes: ["CO-4", "CO-16"],
    voice: "provider",
    searchTerms: ["coding", "modifier", "corrected claim"],
  },
  {
    slug: "duplicate-claim-appeal-template",
    title: "Duplicate claim appeal template",
    useCase: "The plan matched your claim to one it had already processed.",
    description:
      "Leads with the distinguishing fact - time, site, session or provider - and references both claim numbers.",
    denialReason: "duplicate",
    codes: ["CO-18"],
    voice: "provider",
    searchTerms: ["duplicate", "same day", "repeat service"],
  },
  {
    slug: "out-of-network-appeal-template",
    title: "Out-of-network appeal template",
    useCase: "The plan applied out-of-network benefits to the claim.",
    description:
      "Prompts for the emergency, availability or continuity argument, and asks for in-network benefit processing plus a gap exception.",
    denialReason: "out-of-network",
    codes: ["CO-242"],
    voice: "provider",
    searchTerms: ["out of network", "gap exception", "surprise bill"],
  },
  {
    slug: "coordination-of-benefits-appeal-template",
    title: "Coordination of benefits appeal template",
    useCase: "The plan believes another payer is responsible first.",
    description:
      "States the order of benefits and why, and references the primary payer determination as an enclosure.",
    denialReason: "coordination-of-benefits",
    codes: ["CO-22"],
    voice: "provider",
    searchTerms: ["cob", "coordination of benefits", "primary payer"],
  },
  {
    slug: "experimental-investigational-appeal-template",
    title: "Experimental or investigational appeal template",
    useCase: "The plan classified the service as investigational.",
    description:
      "Indication-first structure with space for regulatory status, a guideline or compendium entry, and the patient-matching paragraph.",
    denialReason: "experimental",
    codes: ["CO-55"],
    voice: "provider",
    searchTerms: ["experimental", "investigational", "off label"],
  },
  {
    slug: "patient-appeal-letter-template",
    title: "Patient appeal letter template",
    useCase: "You are the member and you are appealing on your own behalf.",
    description:
      "Written in the first person and in plain language, with prompts for symptoms, what you already tried, and the specific request.",
    denialReason: "medical-necessity",
    codes: [],
    voice: "patient",
    searchTerms: ["patient", "member", "myself", "plain language"],
  },
  {
    slug: "general-insurance-appeal-template",
    title: "General insurance appeal template",
    useCase: "Your denial does not match any of the categories above.",
    description:
      "A neutral frame: quote the plan's reason verbatim, set out what the record shows, and ask for one specific action.",
    denialReason: "other",
    codes: [],
    voice: "provider",
    searchTerms: ["general", "other", "any denial"],
  },
];

const BY_SLUG = new Map(LETTER_TEMPLATES.map((template) => [template.slug, template]));

export function getTemplate(slug: string): LetterTemplate | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Builds the blank letter text for a template. Everything is a placeholder or a
 * prompt - there are no invented facts anywhere in the output.
 */
export function renderTemplateText(template: LetterTemplate, siteUrl: string): string {
  const reason = DENIAL_REASONS.find((entry) => entry.key === template.denialReason);
  const codes = template.codes.length ? ` (${template.codes.join(", ")})` : "";
  const enclosures = (reason?.attachChecklist ?? []).map((item) => `  - ${item}`).join("\n");
  const argument = (reason?.templateParagraphs ?? []).join("\n\n");

  const senderBlock =
    template.voice === "patient"
      ? "[YOUR NAME]\n[STREET ADDRESS]\n[CITY, STATE ZIP]\n[PHONE]\n[EMAIL]"
      : "[PRACTICE OR SENDER NAME]\n[STREET ADDRESS]\n[CITY, STATE ZIP]\n[PHONE]  [FAX]";

  const signature =
    template.voice === "patient"
      ? "Sincerely,\n\n\n[YOUR NAME]\nMember ID [MEMBER ID]\n[PHONE]"
      : "Sincerely,\n\n\n[NAME], [CREDENTIALS]\n[PRACTICE NAME]\nNPI [NPI]\n[PHONE]";

  const opening =
    template.voice === "patient"
      ? "I am appealing the denial dated [DENIAL DATE] of claim [CLAIM NUMBER] for the services described above. I am asking the plan to overturn this denial and pay the claim."
      : "This letter is a formal [FIRST-LEVEL / SECOND-LEVEL] internal appeal of the denial dated [DENIAL DATE] for the services described above. I am requesting that the plan overturn the denial and process the claim for payment.";

  return `${senderBlock}

[DATE]

[INSURER NAME]
Appeals Department
[INSURER APPEALS ADDRESS FROM YOUR DENIAL NOTICE]

RE: Formal appeal
    Patient: [PATIENT NAME]   DOB: [DATE OF BIRTH]
    Member ID: [MEMBER ID]   Claim #: [CLAIM NUMBER]
    Date of service: [DATE OF SERVICE]
    CPT/HCPCS: [CODES]   ICD-10: [CODES]
    Denial reason: ${reason?.short ?? "[DENIAL REASON]"}${codes}
    Denial dated: [DENIAL DATE]

Dear Appeals Reviewer:

${opening}

${argument}

For these reasons I ask the plan to overturn the denial and process the claim for payment. Please also provide the criteria relied on for this decision and the credentials of the reviewer, and confirm the deadline and address for the next level of review.

Enclosures:
${enclosures}

${signature}

--
Blank template from ${siteUrl} - replace every bracketed field, and delete any
prompt that does not apply. Have the treating clinician review and sign any
letter that makes clinical statements. This template is not legal advice and
does not guarantee any outcome.
`;
}
