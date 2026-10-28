import type { AppealFormData } from "@/lib/validation/appeal";

/**
 * Output validation.
 *
 * The model is instructed to return a letter and nothing else. This checks the
 * shape of what came back before any of it reaches a user: a plausible formal
 * letter, the claim identifiers in an RE line, an enclosures list, a signature
 * block, and a sensible length.
 *
 * It never adds facts. A letter that fails validation is rejected or
 * regenerated; it is never patched up with invented content.
 */

export interface LetterValidation {
  ok: boolean;
  /** Blocking problems. */
  issues: string[];
  /** Non-blocking observations surfaced to the user as review prompts. */
  notes: string[];
  wordCount: number;
  placeholders: string[];
}

const MIN_WORDS = 280;
const MAX_WORDS = 1100;

/** Bracketed placeholders the model was told to insert for missing facts. */
export function findPlaceholders(letter: string): string[] {
  const matches = letter.match(/\[[^\]\n]{2,80}\]/g) ?? [];
  return Array.from(new Set(matches));
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Strips anything the model may have wrapped around the letter itself. */
export function cleanLetter(raw: string): string {
  let out = String(raw).replace(/\r\n?/g, "\n").trim();

  const fenced = out.match(/^```[a-z]*\n([\s\S]*?)\n```$/i);
  if (fenced) out = fenced[1].trim();

  // A conversational opener would be a rule violation; drop it rather than
  // showing it to the user.
  out = out.replace(
    /^(?:here(?:'s| is)[^\n]*|sure[^\n]*|certainly[^\n]*|below is[^\n]*)\n+/i,
    "",
  );

  // Some models reach for markdown emphasis even when asked for a plain
  // letter. The markers are not content: left in, they would be exported
  // literally into the Word and PDF files, and a bolded "**RE:**" line would
  // read as a missing RE line to the checks below. Headings are deliberately
  // not stripped - those signal the wrong document structure, which is a
  // reason to reject the draft rather than tidy it.
  out = out
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "$1")
    .replace(/__(?=\S)([\s\S]*?\S)__/g, "$1");

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function validateLetter(letter: string, form: AppealFormData): LetterValidation {
  const issues: string[] = [];
  const notes: string[] = [];
  const text = letter.trim();
  const lower = text.toLowerCase();
  const wordCount = countWords(text);

  if (wordCount < MIN_WORDS) issues.push("The draft came back too short to be a complete letter.");
  if (wordCount > MAX_WORDS) issues.push("The draft came back longer than a formal appeal letter.");

  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);
  if (blocks.length < 5) issues.push("The draft is not structured as a formal letter.");

  if (!/^re\s*:/im.test(text)) issues.push("The draft is missing its RE line.");

  if (!/\benclosure/i.test(text)) issues.push("The draft is missing its enclosures list.");

  if (!/\b(sincerely|respectfully)\b/i.test(text)) {
    issues.push("The draft is missing its signature block.");
  }

  if (/^(here|sure|certainly|i've|i have)\b/i.test(text)) {
    issues.push("The draft contains text outside the letter.");
  }

  // Markdown headings or bullet lists are not formal letter format. The
  // enclosures list is the one exception the prompt allows.
  if (/^#{1,6}\s/m.test(text)) issues.push("The draft contains headings inside the letter.");

  // Identifiers the user supplied should appear somewhere in the letter.
  const expectations: [string, string][] = [
    [form.claimNumber, "claim number"],
    [form.memberId, "member ID"],
    [form.patientName, "patient name"],
  ];
  for (const [value, label] of expectations) {
    if (value && !lower.includes(value.toLowerCase())) {
      notes.push(`The ${label} you entered does not appear in the draft - check the RE line.`);
    }
  }

  if (form.insurerName && !lower.includes(form.insurerName.toLowerCase().split(" ")[0])) {
    notes.push("The insurer name does not appear in the draft - check the address block.");
  }

  const placeholders = findPlaceholders(text);

  return { ok: issues.length === 0, issues, notes, wordCount, placeholders };
}
