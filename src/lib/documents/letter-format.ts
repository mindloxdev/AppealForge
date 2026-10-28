/**
 * Shared letter shaping for both exports.
 *
 * A letter is a sequence of blocks separated by blank lines; single newlines
 * inside a block (address lines, an enclosures list, a signature) are real line
 * breaks and must survive into the document.
 */

export interface LetterBlock {
  lines: string[];
  /** The RE line is set in bold in both exports. */
  emphasis: boolean;
  /** Enclosure lines keep tight spacing. */
  tight: boolean;
}

export function toBlocks(letter: string): LetterBlock[] {
  return String(letter)
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trimEnd());
      return {
        lines,
        emphasis: /^re\s*:/i.test(block),
        tight: lines.length > 1,
      };
    });
}

const SLUG_SAFE = /[^a-z0-9]+/g;

/**
 * A filename that carries no patient or claim information - denial reason and
 * date only.
 */
export function documentFilename(
  denialReasonKey: string | undefined,
  extension: "docx" | "pdf",
  now = new Date(),
): string {
  const reason = (denialReasonKey ?? "appeal").toLowerCase().replace(SLUG_SAFE, "-").slice(0, 40);
  const date = now.toISOString().slice(0, 10);
  return `appeal-letter-${reason || "appeal"}-${date}.${extension}`;
}

export const LETTER_LIMITS = {
  /** Generous ceiling so an edited letter cannot be used to push large payloads. */
  maxCharacters: 24000,
} as const;
