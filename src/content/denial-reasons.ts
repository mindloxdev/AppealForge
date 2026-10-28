/**
 * The denial-reason library.
 *
 * One record per reason drives four things: the searchable dropdown, the
 * DENIAL REASON line sent to the model, the "what to attach" and "next steps"
 * cards shown with the finished letter, and the blank templates.
 *
 * Code meanings below are the standard CARC descriptions. They are a starting
 * point, not a contract: payers apply codes differently, so every surface that
 * shows them also tells the user to verify against their own EOB or denial
 * notice.
 */

export type DenialReasonKey =
  | "medical-necessity"
  | "prior-authorization"
  | "not-covered"
  | "experimental"
  | "timely-filing"
  | "bundling"
  | "coding-modifier"
  | "duplicate"
  | "out-of-network"
  | "coordination-of-benefits"
  | "other";

export interface DenialReason {
  key: DenialReasonKey;
  /** Label in the dropdown. */
  label: string;
  /** Short name used in headings and checklists. */
  short: string;
  /** Value written into the DENIAL REASON line of the model input. */
  promptName: string;
  /** CARC codes commonly associated with this reason. */
  codes: string[];
  /** Plain explanation shown as soon as the reason is selected. */
  meaning: string;
  /** What commonly strengthens this specific appeal. */
  evidenceHint: string;
  /** Documents that often matter for this denial. */
  attachChecklist: string[];
  /** Denial-specific next steps shown beneath the letter. */
  nextSteps: string[];
  /** Prompted argument paragraphs for the blank downloadable template. */
  templateParagraphs: string[];
  /** SEO page that presets the tool to this reason, when one exists. */
  pageSlug?: string;
}

export const DENIAL_REASONS: DenialReason[] = [
  {
    key: "medical-necessity",
    label: "Medical necessity - CO-50",
    short: "Medical necessity",
    promptName: "Medical necessity",
    codes: ["CO-50"],
    meaning:
      "The payer decided the service was not medically necessary under the criteria it applied. It is a decision about the documentation in front of the reviewer, not a judgment that the care was wrong.",
    evidenceHint:
      "Severity with numbers, how long the problem has lasted, each conservative treatment that failed with dates and doses, and what the record shows happens if the service is withheld.",
    attachChecklist: [
      "Denial letter or EOB showing the medical necessity determination",
      "Office notes for the visit and the preceding visits",
      "Imaging, laboratory or test results that document severity",
      "Records of failed conservative treatment, with dates and doses",
      "The insurer medical policy or coverage determination you are answering",
      "Specialty society guideline pages you cite",
    ],
    nextSteps: [
      "Request a peer-to-peer review with a board-certified physician in the same specialty, in writing and by phone.",
      "Ask in writing for the clinical criteria and the reviewer credentials used in the decision.",
      "If the internal appeal is denied, check whether external or independent review is available and what its deadline is.",
    ],
    templateParagraphs: [
      "The patient is a [AGE]-year-old with [DIAGNOSIS], documented in the enclosed records since [DATE]. Current findings include [SYMPTOMS AND EXAM FINDINGS] at a severity of [SEVERITY], with this functional impact: [WHAT THE PATIENT CANNOT DO].",
      "Conservative treatment has been tried and has failed: [TREATMENT, DATES, DOSES, DURATION]. The documented response was [RESULT]. [STATE WHY ANY REMAINING CONSERVATIVE OPTION IS UNSUITABLE OR CONTRAINDICATED FOR THIS PATIENT].",
      "[SERVICE] is the appropriate next step for this presentation. [CITE THE INSURER MEDICAL POLICY, COVERAGE DETERMINATION, OR SPECIALTY SOCIETY GUIDELINE YOU ARE ENCLOSING]. Without it the documented risk is [PROGRESSION, PERMANENT INJURY, AVOIDABLE HOSPITALIZATION OR SURGERY].",
      "I request a peer-to-peer review with a board-certified [SPECIALTY] physician before any further adverse determination, together with a copy of the clinical criteria applied to this claim.",
    ],
    pageSlug: "medical-necessity-appeal-letter",
  },
  {
    key: "prior-authorization",
    label: "Prior authorization missing - CO-197",
    short: "Prior authorization",
    promptName: "Prior authorization",
    codes: ["CO-197"],
    meaning:
      "The payer did not find the precertification, authorization or notification it required for this service when the claim was processed. It is an administrative finding rather than a clinical one.",
    evidenceHint:
      "Proof. Either an authorization exists and the claim was not matched to it, or there is a documented reason it could not be obtained before the service.",
    attachChecklist: [
      "Denial letter or EOB showing the authorization determination",
      "Authorization approval letter, number, or payer portal screenshot",
      "Call log with date, time, representative name and reference number",
      "Emergency or urgent documentation if authorization could not be obtained first",
      "Eligibility verification for the date of service",
    ],
    nextSteps: [
      "If an authorization already exists, ask for the claim to be reprocessed against it rather than filing a full appeal.",
      "Request retroactive authorization explicitly, and cite the plan provision if your plan documents include one.",
      "Confirm the plan retroactive-review window, which is often much shorter than the appeal deadline.",
    ],
    templateParagraphs: [
      "[CHOOSE ONE AND DELETE THE OTHER] An authorization was obtained before the service: authorization number [AUTH NUMBER], approved [DATE] by [REPRESENTATIVE NAME OR REFERENCE NUMBER], covering [CPT CODES]. The claim should be reprocessed against that authorization. / Authorization could not be obtained in advance because [URGENT OR EMERGENT CIRCUMSTANCE ON [DATE]], and the plan was notified on [DATE].",
      "The service was medically appropriate when it was provided: [ONE OR TWO SENTENCES OF CLINICAL JUSTIFICATION, WITH DATES]. The enclosed records document [WHAT THE RECORDS SHOW].",
      "I request retroactive authorization and reprocessing of this claim for payment. [IF THE PLAN DOCUMENT OR PROVIDER MANUAL ALLOWS RETROACTIVE REVIEW, NAME THAT PROVISION HERE.]",
    ],
    pageSlug: "prior-authorization-denial-appeal-letter",
  },
  {
    key: "not-covered",
    label: "Not covered or excluded benefit - CO-96 / PR-96",
    short: "Not covered",
    promptName: "Not covered / excluded",
    codes: ["CO-96", "PR-96"],
    meaning:
      "The payer treated the charge as outside the member benefits. CO assigns the write-off to the provider under the payer contract; PR assigns it to the patient, which changes who holds the balance and who appeals.",
    evidenceHint:
      "Benefit language. Make the plan produce the exact exclusion it relied on, then show the service sits inside a covered benefit category.",
    attachChecklist: [
      "Denial letter or EOB showing the non-covered determination",
      "Summary of Benefits and Coverage or plan certificate pages",
      "Clinical notes showing what was done and why",
      "Any written coverage statement or approval given before the service",
    ],
    nextSteps: [
      "Ask in writing for the specific exclusion language and the section of the plan document it appears in.",
      "Check whether the service was adjudicated under the right benefit category or code before appealing on the merits.",
      "If the exclusion applies, ask about a single-case agreement or the patient financial pathway instead.",
    ],
    templateParagraphs: [
      "The denial states that the service is not a covered benefit. The service provided was [SERVICE], which falls within the [BENEFIT CATEGORY] benefit described in the member plan documents.",
      "Please identify the exact exclusion relied on for this decision, including the section and page of the plan document or certificate of coverage.",
      "[IF APPLICABLE] The claim appears to have been adjudicated under the wrong benefit category or code. I ask the plan to reprocess it under [CORRECT CATEGORY OR CODE] and pay the claim.",
    ],
  },
  {
    key: "experimental",
    label: "Experimental or investigational - CO-55",
    short: "Experimental",
    promptName: "Experimental / investigational",
    codes: ["CO-55"],
    meaning:
      "The payer classified the procedure, treatment or drug as experimental or investigational for this indication, usually through an internal technology assessment policy.",
    evidenceHint:
      "Published evidence for this indication: regulatory status, specialty society guidelines or compendia, and studies covering patients like yours.",
    attachChecklist: [
      "Denial letter or EOB showing the investigational determination",
      "FDA approval or clearance documentation, where it exists",
      "Specialty society guideline or compendium entry for this indication",
      "Peer-reviewed articles covering this patient population",
      "Clinical notes showing the patient matches the studied population",
    ],
    nextSteps: [
      "Name the exact indication. These denials usually turn on the indication rather than the service itself.",
      "Request the technology assessment policy the decision relied on, and its revision date.",
      "Ask for peer-to-peer review with a specialist who treats this condition, and check external review availability.",
    ],
    templateParagraphs: [
      "[SERVICE] is not experimental or investigational for the indication at issue. [REGULATORY STATUS AND DATE, IF YOU HAVE IT], and its use in [CONDITION] is addressed in [GUIDELINE, COMPENDIUM OR PEER-REVIEWED SOURCE YOU ARE ENCLOSING].",
      "The patient matches the population described in that evidence: [DIAGNOSIS, STAGE OR SEVERITY, PRIOR TREATMENTS AND THEIR RESULTS].",
      "I request that the denial be overturned, that a peer-to-peer review with a board-certified [SPECIALTY] physician be arranged, and that the plan provide the policy and literature it relied on in classifying this service as investigational.",
    ],
    pageSlug: "experimental-investigational-denial-appeal-letter",
  },
  {
    key: "timely-filing",
    label: "Timely filing - CO-29",
    short: "Timely filing",
    promptName: "Timely filing",
    codes: ["CO-29"],
    meaning:
      "The payer treated the claim as received after its filing limit. Nothing about the clinical record changes this determination; only dated evidence does.",
    evidenceHint:
      "Dated proof that the claim was submitted on time, or a documented reason the filing clock should not have run.",
    attachChecklist: [
      "Clearinghouse acceptance report showing the original submission date and trace number",
      "Payer claim status record or acknowledgement from the original submission",
      "Proof of mailing or fax confirmation for paper claims",
      "Primary payer EOB, where coordination of benefits delayed the secondary claim",
      "Eligibility records where coverage information was incorrect at the time of service",
    ],
    nextSteps: [
      "Lead with the clearinghouse acceptance report. It is dated, third-party and specific to the claim.",
      "If the claim went to another payer first, say so and attach that payer EOB with its date.",
      "File quickly: appeal windows for filing denials are often shorter than for clinical denials.",
    ],
    templateParagraphs: [
      "Claim [CLAIM NUMBER] for services provided on [DATE OF SERVICE] was submitted on [SUBMISSION DATE], within the plan filing limit. The enclosed clearinghouse acceptance report shows the claim was accepted on [DATE] under trace number [TRACE NUMBER].",
      "[IF APPLICABLE] Any delay was caused by [COORDINATION OF BENEFITS / INCORRECT COVERAGE INFORMATION / A PLAN PROCESSING OR ROUTING ERROR], documented by [ENCLOSURE]. The primary payer determination is dated [DATE], and this claim followed within [NUMBER] days.",
      "I request reconsideration based on the enclosed proof of timely submission, and payment of the claim. If the plan maintains that no submission was received, please provide the claim receipt history relied on.",
    ],
    pageSlug: "timely-filing-appeal-letter",
  },
  {
    key: "bundling",
    label: "Bundled services or NCCI edit - CO-97 / CO-236",
    short: "Bundling",
    promptName: "Bundling / NCCI",
    codes: ["CO-97", "CO-236"],
    meaning:
      "The payer treated the service as already paid inside another service on the claim, or applied a procedure-to-procedure edit to the code pair.",
    evidenceHint:
      "Documentation that the services were separate and distinct - different session, site, lesion or practitioner - and the modifier that the note supports.",
    attachChecklist: [
      "Denial letter or EOB showing the bundling determination",
      "Operative report or procedure note for each service",
      "Office note showing the separate problem addressed at the same visit",
      "Times, sites or sessions that make the services distinct",
      "Corrected claim, where a modifier was omitted",
    ],
    nextSteps: [
      "Check whether a modifier is permitted for that code pair before arguing the point.",
      "Use the modifier the documentation supports - 25 for a separate evaluation and management service, or 59, XE, XS, XP or XU for a distinct procedural service.",
      "If the modifier was simply missing, a corrected claim is usually faster than an appeal.",
    ],
    templateParagraphs: [
      "The services billed on claim [CLAIM NUMBER] were separate and distinct. [PROCEDURE A, CPT CODE] was performed on [ANATOMIC SITE] at [TIME] for [INDICATION]. [PROCEDURE B, CPT CODE] was performed on [DIFFERENT SITE] at [TIME] for [SEPARATE INDICATION].",
      "The enclosed [OPERATIVE REPORT OR OFFICE NOTE] documents each service separately, including the distinct indication, the site and the time. Modifier [25 / 59 / XE / XS / XP / XU] is therefore supported on [CPT CODE].",
      "I request that the plan reprocess claim [CLAIM NUMBER] and pay both lines as separately reportable services.",
    ],
    pageSlug: "co-97-bundling-denial-appeal-letter",
  },
  {
    key: "coding-modifier",
    label: "Coding or modifier issue - CO-4 / CO-16",
    short: "Coding or modifier",
    promptName: "Coding / modifier",
    codes: ["CO-4", "CO-16"],
    meaning:
      "The payer found the procedure code inconsistent with the modifier used, a required modifier missing, or information missing from the claim. The remark codes beside it usually name the missing element.",
    evidenceHint:
      "Precision. Name the exact code or modifier that belongs on the claim and point to the line in the note that supports it.",
    attachChecklist: [
      "Denial letter or EOB with the reason and remark codes",
      "The clinical note that supports the corrected code or modifier",
      "Corrected claim, where you are submitting one",
      "Code descriptors for the codes in question",
    ],
    nextSteps: [
      "Decide whether this is a corrected claim or an appeal before you send anything - they follow different routes.",
      "Quote the code descriptor and the matching line from the clinical note.",
      "Read the remark codes carefully; for missing-information denials they usually identify exactly what was missing.",
    ],
    templateParagraphs: [
      "The claim should read [CORRECT CODE OR MODIFIER] rather than [CODE OR MODIFIER AS BILLED]. The enclosed note documents [SUPPORTING DETAIL THAT MATCHES THE CODE DESCRIPTOR].",
      "[STATE CLEARLY WHETHER YOU ARE SUBMITTING A CORRECTED CLAIM OR APPEALING THE DETERMINATION, AND REFERENCE THE ENCLOSED CORRECTED CLAIM IF THERE IS ONE.]",
      "I request that the plan reprocess the claim as [CORRECTED CLAIM / APPEALED DETERMINATION] and pay it at the contracted rate.",
    ],
  },
  {
    key: "duplicate",
    label: "Duplicate claim or service - CO-18",
    short: "Duplicate",
    promptName: "Duplicate",
    codes: ["CO-18"],
    meaning:
      "The payer matched this claim or line to one it had already processed. Repeated services on the same day are a common cause of a false match.",
    evidenceHint:
      "Distinctness: different times, sites, sessions, providers or units, with notes that show it.",
    attachChecklist: [
      "Denial letter or EOB showing the duplicate determination",
      "Notes for each service, with times and rendering providers",
      "Procedure or anesthesia logs showing separate sessions",
      "Both claim numbers, where two claims were filed",
    ],
    nextSteps: [
      "State the distinguishing fact in the first sentence: time, site, session or provider.",
      "Check whether the original claim actually paid before appealing the duplicate denial.",
      "Add the appropriate modifier on resubmission where the service genuinely repeated.",
    ],
    templateParagraphs: [
      "These are not duplicate services. [SERVICE] was provided twice on [DATE]: first at [TIME] for [REASON], and again at [TIME] for [SEPARATE REASON], by [PROVIDER OR PROVIDERS].",
      "Claim [FIRST CLAIM NUMBER] and claim [SECOND CLAIM NUMBER] therefore describe distinct encounters. The enclosed notes and [PROCEDURE OR ANESTHESIA LOG] show the separate times and indications.",
      "I request that the plan release the denial on claim [CLAIM NUMBER] and pay it as a distinct service.",
    ],
  },
  {
    key: "out-of-network",
    label: "Out of network - CO-242",
    short: "Out of network",
    promptName: "Out of network",
    codes: ["CO-242"],
    meaning:
      "The payer applied a network rule because the services were not provided by a network or primary care provider. The care itself is not in question.",
    evidenceHint:
      "Why this episode could not reasonably happen in network: an emergency, no available in-network provider, or an active course of treatment already underway.",
    attachChecklist: [
      "Denial letter or EOB showing the network determination",
      "Emergency department or ambulance records, where the care was emergent",
      "A documented search for in-network providers: names, dates and wait times",
      "Records showing active treatment already underway with this provider",
      "Referral or authorization that directed the patient to this provider",
    ],
    nextSteps: [
      "Ask the plan to process the claim at the in-network benefit level, not simply to pay something.",
      "For emergency care or care at an in-network facility, ask the plan in writing whether federal surprise-billing protections were applied.",
      "Request a network gap exception or single-case agreement for the remaining course of care.",
    ],
    templateParagraphs: [
      "[CHOOSE THE ONE THAT APPLIES] The care was emergent and the patient could not choose the facility or provider. / No in-network provider was reasonably available: this office contacted [NAMES] on [DATES] and the earliest appointment offered was [DATE]. / The patient was in an active course of treatment with this provider that began [DATE].",
      "Processing this claim at the out-of-network level leaves the patient responsible for [AMOUNT] for care that was not reasonably available in network.",
      "I request that the plan process claim [CLAIM NUMBER] at the in-network benefit level, and approve a network gap exception for the remaining course of treatment.",
    ],
    pageSlug: "out-of-network-denial-appeal-letter",
  },
  {
    key: "coordination-of-benefits",
    label: "Coordination of benefits - CO-22",
    short: "Coordination of benefits",
    promptName: "Coordination of benefits",
    codes: ["CO-22"],
    meaning:
      "The payer believes another plan is responsible first, or that its coordination-of-benefits information is out of date.",
    evidenceHint:
      "A clear statement of which plan is primary and why, with the other payer determination attached.",
    attachChecklist: [
      "Denial letter or EOB showing the coordination determination",
      "Primary payer EOB or remittance advice",
      "Updated coordination of benefits form or questionnaire",
      "Eligibility records for both plans on the date of service",
    ],
    nextSteps: [
      "Call member services and confirm the recorded order of benefits before appealing.",
      "Ask the patient to complete the plan coordination of benefits questionnaire - many of these clear with that alone.",
      "Attach the primary payer EOB even if you believe the plan already has it.",
    ],
    templateParagraphs: [
      "[PRIMARY PLAN NAME] is primary for this patient and [SECONDARY PLAN NAME] is secondary, because [REASON: ACTIVE EMPLOYMENT, BIRTHDAY RULE, MEDICARE SECONDARY PAYER STATUS, COURT ORDER].",
      "The primary payer processed the claim on [DATE] and paid [AMOUNT], leaving [BALANCE]. The primary payer EOB is enclosed, together with the updated coordination of benefits information.",
      "I request that the plan process this claim as secondary payer and pay the remaining allowed amount.",
    ],
  },
  {
    key: "other",
    label: "Other - describe the denial in your own words",
    short: "Other",
    promptName: "Other",
    codes: [],
    meaning:
      "Use this when the denial does not match a listed reason. Quote the plan wording exactly and the letter will answer the reason as written.",
    evidenceHint:
      "A clean statement of what the plan decided, what the record shows, and the exact action you are asking for.",
    attachChecklist: [
      "Denial letter or EOB",
      "Clinical notes for the date of service",
      "Any correspondence with the plan about this claim",
      "Itemized claim",
    ],
    nextSteps: [
      "Quote the plan reason verbatim in the letter so the reviewer can match it to the file.",
      "Ask for one specific action: overturn and pay, reprocess, or reopen.",
      "Note the appeal deadline printed on your denial letter and file well before it.",
    ],
    templateParagraphs: [
      "The plan reason for denial reads: [QUOTE THE DENIAL LANGUAGE EXACTLY AS IT APPEARS].",
      "The record shows otherwise: [FACTS WITH DATES, DRAWN FROM THE ENCLOSED DOCUMENTS].",
      "I request that the plan [OVERTURN THE DENIAL AND PAY THE CLAIM / REPROCESS THE CLAIM / REOPEN THE DETERMINATION], and confirm in writing the criteria applied and the deadline for the next level of review.",
    ],
  },
];

export const DENIAL_REASON_KEYS = DENIAL_REASONS.map((reason) => reason.key) as [
  DenialReasonKey,
  ...DenialReasonKey[],
];

const BY_KEY = new Map(DENIAL_REASONS.map((reason) => [reason.key, reason]));

export function getDenialReason(key: string | undefined | null): DenialReason | undefined {
  if (!key) return undefined;
  return BY_KEY.get(key as DenialReasonKey);
}

/** Label plus codes, for the DENIAL REASON line sent to the model. */
export function denialReasonPromptValue(
  key: string | undefined,
  freeText?: string,
): string {
  const reason = getDenialReason(key);
  if (!reason) return "";
  if (reason.key === "other") {
    return freeText?.trim() ? `Other - ${freeText.trim()}` : "";
  }
  return reason.codes.length
    ? `${reason.promptName} (CARC ${reason.codes.join(", ")})`
    : reason.promptName;
}

export const APPEAL_LEVELS = [
  {
    value: "first-internal",
    label: "First-level internal appeal",
    prompt: "first-level internal appeal",
    description: "The first formal review by the plan after a denial.",
  },
  {
    value: "second-internal",
    label: "Second-level internal appeal",
    prompt: "second-level internal appeal",
    description: "Where the plan offers a second internal review.",
  },
  {
    value: "external",
    label: "External or independent review",
    prompt: "external / independent review",
    description: "Review by a reviewer who is not employed by the plan.",
  },
] as const;

export const LETTER_AUTHORS = [
  {
    value: "provider",
    label: "Healthcare provider",
    prompt: "healthcare provider - write in the provider's voice on behalf of the practice",
    description: "Written in the provider voice, for a clinician to review and sign.",
  },
  {
    value: "billing-office",
    label: "Medical billing office",
    prompt: "medical billing office - write in the provider's voice on behalf of the practice",
    description: "Prepared by the billing office in the practice voice.",
  },
  {
    value: "patient",
    label: "Patient",
    prompt: "patient - write in first person and plain language",
    description: "Written in first person, in plain language, by the member.",
  },
] as const;

export const ENCLOSURE_OPTIONS = [
  { value: "denial-letter", label: "Denial letter or EOB" },
  { value: "clinical-notes", label: "Relevant clinical notes" },
  { value: "imaging-labs", label: "Imaging or laboratory results" },
  { value: "prior-auth", label: "Prior authorization records" },
  { value: "guidelines", label: "Relevant clinical guidelines or policy documents" },
  { value: "itemized-claim", label: "Itemized claim" },
  { value: "corrected-claim", label: "Corrected claim documentation" },
  { value: "clearinghouse", label: "Clearinghouse acceptance report" },
  { value: "other-docs", label: "Other supporting documentation" },
] as const;

export type EnclosureValue = (typeof ENCLOSURE_OPTIONS)[number]["value"];

const ENCLOSURE_LABELS = new Map(
  ENCLOSURE_OPTIONS.map((option) => [option.value, option.label] as const),
);

export function enclosureLabel(value: string): string {
  return ENCLOSURE_LABELS.get(value as EnclosureValue) ?? "";
}
