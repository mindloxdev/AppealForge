/**
 * Splitting a letter into the free preview and the paid remainder.
 *
 * Free readers get everything through the salutation plus the first two body
 * paragraphs. The rest never leaves the server in cleartext - it is encrypted,
 * and the browser receives only paragraph word counts so it can draw a
 * convincing blurred block with no real words in the DOM.
 */

const PREVIEW_BODY_BLOCKS = 2;
const MIN_LOCKED_BLOCKS = 2;

export function splitBlocks(text: string): string[] {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** Index of the last header block: the salutation, else the RE line, else block two. */
export function headerEndIndex(blocks: string[]): number {
  const salutation = blocks.findIndex((block) => /^(dear|to whom it may concern)\b/i.test(block));
  if (salutation !== -1) return salutation;
  const reLine = blocks.findIndex((block) => /^re\s*:/i.test(block));
  if (reLine !== -1) return reLine;
  return Math.min(1, blocks.length - 1);
}

export interface LetterSplit {
  preview: string;
  locked: string;
  previewBlocks: string[];
  lockedBlocks: string[];
}

export function splitLetter(text: string): LetterSplit {
  const blocks = splitBlocks(text);
  if (blocks.length === 0) {
    return { preview: "", locked: "", previewBlocks: [], lockedBlocks: [] };
  }

  let cut = Math.min(headerEndIndex(blocks) + 1 + PREVIEW_BODY_BLOCKS, blocks.length);

  // Guarantee something stays locked, without ever emptying the preview.
  while (blocks.length - cut < MIN_LOCKED_BLOCKS && cut > 1) cut -= 1;
  if (cut >= blocks.length) cut = Math.max(1, blocks.length - 1);

  const previewBlocks = blocks.slice(0, cut);
  const lockedBlocks = blocks.slice(cut);

  return {
    preview: previewBlocks.join("\n\n"),
    locked: lockedBlocks.join("\n\n"),
    previewBlocks,
    lockedBlocks,
  };
}

export interface LockedParagraphShape {
  words: number;
}

/**
 * All the browser is told about the locked region: how many words are in each
 * paragraph. Never the words themselves.
 */
export function lockedShape(lockedBlocks: string[]): LockedParagraphShape[] {
  return lockedBlocks.map((block) => ({
    words: Math.max(1, block.split(/\s+/).filter(Boolean).length),
  }));
}

export function joinLetter(preview: string, locked: string): string {
  return locked ? `${preview}\n\n${locked}` : preview;
}
