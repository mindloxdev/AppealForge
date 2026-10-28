import { z } from "zod";
import {
  APPEAL_LEVELS,
  DENIAL_REASON_KEYS,
  ENCLOSURE_OPTIONS,
  LETTER_AUTHORS,
} from "@/content/denial-reasons";

/**
 * The appeal form schema. Imported by the browser form and by the route
 * handler, so the rules a user sees are the rules the server enforces.
 *
 * Almost everything is optional on purpose: a blank field becomes a bracketed
 * placeholder in the letter rather than an invented fact. What is required is
 * only what the letter cannot be written without.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trim, strip control characters, collapse runs of blank lines. */
function clean(value: unknown, { multiline }: { multiline: boolean }): string {
  if (typeof value !== "string") return "";
  let out = value.replace(CONTROL_CHARS, "").replace(/\r\n?/g, "\n");
  if (!multiline) out = out.replace(/\n+/g, " ");
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

const shortText = (max: number, label: string) =>
  z
    .preprocess(
      (value) => clean(value, { multiline: false }),
      z.string().max(max, `${label} is limited to ${max} characters.`),
    )
    .default("");

const longText = (max: number, label: string) =>
  z
    .preprocess(
      (value) => clean(value, { multiline: true }),
      z.string().max(max, `${label} is limited to ${max} characters.`),
    )
    .default("");

const isoDate = (label: string) =>
  z
    .preprocess(
      (value) => clean(value, { multiline: false }),
      z
        .string()
        .refine((value) => value === "" || isRealIsoDate(value), {
          message: `${label} must be a real date.`,
        }),
    )
    .default("");

export function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= lengths[month - 1];
}

const appealLevelValues = APPEAL_LEVELS.map((level) => level.value) as [string, ...string[]];
const authorValues = LETTER_AUTHORS.map((author) => author.value) as [string, ...string[]];
const enclosureValues = ENCLOSURE_OPTIONS.map((option) => option.value) as [string, ...string[]];

export const MAX_TOTAL_INPUT_CHARS = 14000;

export const appealFormSchema = z
  .object({
    // Step 1 - denial details
    insurerName: shortText(120, "Insurance company name"),
    appealLevel: z.enum(appealLevelValues).default("first-internal"),
    denialReason: z.enum(DENIAL_REASON_KEYS),
    denialReasonOther: longText(400, "Denial reason description"),
    claimNumber: shortText(80, "Claim number"),
    memberId: shortText(80, "Member ID"),
    dateOfService: isoDate("Date of service"),
    denialDate: isoDate("Denial date"),
    cptCodes: shortText(200, "CPT/HCPCS codes"),
    icdCodes: shortText(200, "ICD-10 codes"),
    serviceDescription: longText(400, "Service description"),
    amountBilled: shortText(40, "Amount billed"),

    // Step 2 - clinical information
    diagnosisHistory: longText(2500, "Diagnosis and relevant history"),
    symptomsImpact: longText(2500, "Symptoms, duration, severity and functional impact"),
    treatmentsTried: longText(2500, "Treatments already tried"),
    medicalNecessity: longText(2500, "Why the service was necessary now"),
    clinicalGuideline: longText(600, "Clinical guideline or insurer policy"),
    evidenceAvailable: z.array(z.enum(enclosureValues)).max(20).default([]),

    // Step 3 - parties and documents
    letterAuthor: z.enum(authorValues).default("provider"),
    providerName: shortText(120, "Provider name"),
    providerCredentials: shortText(60, "Professional credentials"),
    providerNpi: shortText(20, "NPI"),
    practiceName: shortText(160, "Practice name"),
    practiceAddress: longText(300, "Practice mailing address"),
    practicePhone: shortText(40, "Phone number"),
    patientName: shortText(120, "Patient name"),
    patientDob: isoDate("Patient date of birth"),
    enclosures: z.array(z.enum(enclosureValues)).max(20).default([]),
  })
  .superRefine((value, ctx) => {
    if (!value.insurerName) {
      ctx.addIssue({
        code: "custom",
        path: ["insurerName"],
        message: "Enter the insurance company name as it appears on the denial.",
      });
    }

    if (value.denialReason === "other" && value.denialReasonOther.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["denialReasonOther"],
        message: "Describe the denial reason in a sentence so the letter can answer it.",
      });
    }

    const clinicalChars =
      value.diagnosisHistory.length +
      value.symptomsImpact.length +
      value.treatmentsTried.length +
      value.medicalNecessity.length;

    if (clinicalChars < 80) {
      ctx.addIssue({
        code: "custom",
        path: ["diagnosisHistory"],
        message:
          "Add the clinical facts. The letter can only argue from what you provide - a few sentences is enough to start.",
      });
    }

    const total = Object.values(value).reduce(
      (sum, entry) => sum + (typeof entry === "string" ? entry.length : 0),
      0,
    );
    if (total > MAX_TOTAL_INPUT_CHARS) {
      ctx.addIssue({
        code: "custom",
        path: ["medicalNecessity"],
        message:
          "That is more text than one letter can use. Trim the clinical sections and try again.",
      });
    }
  });

export type AppealFormValues = z.input<typeof appealFormSchema>;
export type AppealFormData = z.output<typeof appealFormSchema>;

/** Field order used by the error summary so it matches the visual order. */
export const FIELD_ORDER: (keyof AppealFormData)[] = [
  "insurerName",
  "appealLevel",
  "denialReason",
  "denialReasonOther",
  "claimNumber",
  "memberId",
  "dateOfService",
  "denialDate",
  "cptCodes",
  "icdCodes",
  "serviceDescription",
  "amountBilled",
  "diagnosisHistory",
  "symptomsImpact",
  "treatmentsTried",
  "medicalNecessity",
  "clinicalGuideline",
  "evidenceAvailable",
  "letterAuthor",
  "providerName",
  "providerCredentials",
  "providerNpi",
  "practiceName",
  "practiceAddress",
  "practicePhone",
  "patientName",
  "patientDob",
  "enclosures",
];

export const STEP_FIELDS: Record<1 | 2 | 3, (keyof AppealFormData)[]> = {
  1: [
    "insurerName",
    "appealLevel",
    "denialReason",
    "denialReasonOther",
    "claimNumber",
    "memberId",
    "dateOfService",
    "denialDate",
    "cptCodes",
    "icdCodes",
    "serviceDescription",
    "amountBilled",
  ],
  2: [
    "diagnosisHistory",
    "symptomsImpact",
    "treatmentsTried",
    "medicalNecessity",
    "clinicalGuideline",
    "evidenceAvailable",
  ],
  3: [
    "letterAuthor",
    "providerName",
    "providerCredentials",
    "providerNpi",
    "practiceName",
    "practiceAddress",
    "practicePhone",
    "patientName",
    "patientDob",
    "enclosures",
  ],
};

export const emptyAppealForm: AppealFormValues = {
  insurerName: "",
  appealLevel: "first-internal",
  denialReason: "medical-necessity",
  denialReasonOther: "",
  claimNumber: "",
  memberId: "",
  dateOfService: "",
  denialDate: "",
  cptCodes: "",
  icdCodes: "",
  serviceDescription: "",
  amountBilled: "",
  diagnosisHistory: "",
  symptomsImpact: "",
  treatmentsTried: "",
  medicalNecessity: "",
  clinicalGuideline: "",
  evidenceAvailable: [],
  letterAuthor: "provider",
  providerName: "",
  providerCredentials: "",
  providerNpi: "",
  practiceName: "",
  practiceAddress: "",
  practicePhone: "",
  patientName: "",
  patientDob: "",
  enclosures: [],
};
