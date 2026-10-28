import "server-only";
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import { toBlocks } from "@/lib/documents/letter-format";

/**
 * Word export.
 *
 * US Letter, one-inch margins, Times New Roman 11pt - the format an appeals
 * reviewer expects on paper. Nothing is branded inside the letter itself.
 */
export async function buildDocx(letter: string): Promise<Buffer> {
  const blocks = toBlocks(letter);

  const paragraphs = blocks.map((block) => {
    const children: TextRun[] = [];
    block.lines.forEach((line, index) => {
      children.push(
        new TextRun({
          text: line,
          bold: block.emphasis,
          break: index === 0 ? undefined : 1,
        }),
      );
    });

    return new Paragraph({
      children,
      alignment: AlignmentType.LEFT,
      spacing: { after: block.tight ? 120 : 200, line: 276 },
    });
  });

  const document = new Document({
    creator: "AppealForge",
    description: "Insurance appeal letter",
    title: "Appeal letter",
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 22 },
          paragraph: { spacing: { after: 200, line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) },
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: "" })],
      },
    ],
  });

  return Packer.toBuffer(document);
}
