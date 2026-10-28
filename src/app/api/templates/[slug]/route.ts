import { NextResponse } from "next/server";
import { getTemplate, renderTemplateText } from "@/content/templates";
import { buildDocx } from "@/lib/documents/docx";
import { buildPdf } from "@/lib/documents/pdf";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * GET /api/templates/[slug]?format=docx|pdf
 *
 * Blank templates are free and need no entitlement - they contain nothing but
 * placeholders and prompts. No email is required to download one.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await context.params;
  const template = getTemplate(slug);
  if (!template) {
    return NextResponse.json({ ok: false, error: { code: "not_found" } }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "docx";
  const text = renderTemplateText(template, getEnv().APP_URL);
  const file = format === "docx" ? await buildDocx(text) : await buildPdf(text);

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type":
        format === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
      "Content-Disposition": `attachment; filename="${template.slug}.${format}"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
