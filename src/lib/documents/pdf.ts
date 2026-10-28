import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { toBlocks } from "@/lib/documents/letter-format";

/**
 * PDF export.
 *
 * Real text in a real PDF - not a screenshot of HTML. US Letter, one-inch
 * margins, Times at 11pt, wrapped with the font's own metrics and paginated so
 * no line is clipped and no signature block is split across pages mid-line.
 */

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const FONT_SIZE = 11;
const LINE_HEIGHT = 15.2;
const BLOCK_GAP = 8;
const TIGHT_GAP = 2;

const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * The base-14 fonts encode WinAnsi only, so typographic characters a model may
 * produce are folded down to their ASCII equivalents before drawing.
 */
const REPLACEMENTS: [RegExp, string][] = [
  [/[‘’‚′]/g, "'"],
  [/[“”„″]/g, '"'],
  [/–/g, "-"],
  [/—/g, "--"],
  [/…/g, "..."],
  [/[    ]/g, " "],
  [/•/g, "-"],
  [/−/g, "-"],
];

export function toPdfText(value: string): string {
  let out = value;
  for (const [pattern, replacement] of REPLACEMENTS) out = out.replace(pattern, replacement);
  // Anything still outside WinAnsi would throw at draw time.
  return out.replace(/[^ -ÿ\n]/g, "?");
}

export function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ").filter((word) => word !== "");
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);

    // A single token wider than the line gets hard-split rather than clipped.
    let remainder = word;
    while (font.widthOfTextAtSize(remainder, size) > maxWidth && remainder.length > 1) {
      let cut = remainder.length - 1;
      while (cut > 1 && font.widthOfTextAtSize(remainder.slice(0, cut), size) > maxWidth) cut -= 1;
      lines.push(remainder.slice(0, cut));
      remainder = remainder.slice(cut);
    }
    current = remainder;
  }

  if (current) lines.push(current);
  return lines;
}

export async function buildPdf(letter: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Appeal letter");
  pdf.setProducer("AppealForge");
  pdf.setCreator("AppealForge");

  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN - FONT_SIZE;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN - FONT_SIZE;
  };

  const blocks = toBlocks(letter);

  blocks.forEach((block, blockIndex) => {
    const font = block.emphasis ? bold : regular;
    if (blockIndex > 0) y -= block.tight ? TIGHT_GAP : BLOCK_GAP;

    for (const source of block.lines) {
      const wrapped = wrapLine(toPdfText(source), font, FONT_SIZE, CONTENT_WIDTH);
      for (const line of wrapped) {
        if (y < MARGIN) newPage();
        page.drawText(line, {
          x: MARGIN,
          y,
          size: FONT_SIZE,
          font,
          color: rgb(0.08, 0.13, 0.18),
        });
        y -= LINE_HEIGHT;
      }
    }
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
