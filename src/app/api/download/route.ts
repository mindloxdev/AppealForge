import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth/session";
import { checkEntitlementToken } from "@/lib/billing/entitlements";
import { isDraftId } from "@/lib/security/entitlement";
import { buildDocx } from "@/lib/documents/docx";
import { buildPdf } from "@/lib/documents/pdf";
import { documentFilename, LETTER_LIMITS } from "@/lib/documents/letter-format";
import { callerIp, consume, rateLimitHeaders } from "@/lib/rate-limit";
import { track } from "@/lib/analytics/track";
import { ApiError, fail, handleRouteError, readJson } from "@/lib/api/respond";
import { DENIAL_REASON_KEYS } from "@/content/denial-reasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  draftId: z.string().refine(isDraftId, "That draft is no longer available."),
  entitlement: z.string().min(20).max(4096),
  format: z.enum(["docx", "pdf"]),
  letter: z.string().min(40).max(LETTER_LIMITS.maxCharacters),
  denialReason: z.enum(DENIAL_REASON_KEYS).optional(),
});

/**
 * POST /api/download
 *
 * Builds the Word or PDF file from the letter currently in the user's editor,
 * after verifying the entitlement token server-side. The letter is held in
 * memory for the length of the request and never written anywhere.
 *
 * The body carries the letter because we deliberately do not keep a copy of it.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      throw new ApiError(
        400,
        "invalid_request",
        parsed.error.issues[0]?.message ?? "That download request was not valid.",
      );
    }
    const { draftId, entitlement, format, letter, denialReason } = parsed.data;

    const limit = await consume("download", callerIp(request));
    if (!limit.allowed) {
      return fail(
        429,
        "rate_limited",
        "Too many downloads in a short time. Please wait a few minutes.",
        { resetInSeconds: limit.resetInSeconds },
        rateLimitHeaders(limit),
      );
    }

    const session = await getSessionFromRequest(request);
    const check = await checkEntitlementToken(entitlement, draftId, session?.userId);
    if (!check.granted) {
      throw new ApiError(
        403,
        check.reason === "subscription_inactive" ? "subscription_inactive" : "not_entitled",
        check.reason === "subscription_inactive"
          ? "That plan is no longer active."
          : "This letter has not been unlocked.",
      );
    }

    const filename = documentFilename(denialReason, format);
    const file = format === "docx" ? await buildDocx(letter) : await buildPdf(letter);

    await track(format === "docx" ? "docx_downloaded" : "pdf_downloaded", denialReason ?? "");

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type":
          format === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError("download", error);
  }
}

export const maxDuration = 30;
