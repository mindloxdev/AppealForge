import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Anonymous aggregate counters.
 *
 * Only an event name and an optional low-cardinality detail (such as a denial
 * reason key) are ever recorded. No identifiers, no claim data, no letter text,
 * no IP address. There is no third-party analytics SDK anywhere in this app, so
 * form fields cannot be auto-captured and sessions cannot be replayed.
 */
export type AnalyticsEvent =
  | "generator_viewed"
  | "form_started"
  | "denial_reason_selected"
  | "letter_generation_requested"
  | "letter_generation_succeeded"
  | "letter_generation_failed"
  | "preview_displayed"
  | "checkout_started"
  | "payment_completed"
  | "docx_downloaded"
  | "pdf_downloaded"
  | "lead_submitted";

const DETAIL_PATTERN = /^[a-z0-9_-]{0,40}$/;

export async function track(event: AnalyticsEvent, detail = ""): Promise<void> {
  const safeDetail = DETAIL_PATTERN.test(detail) ? detail : "";
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);

  try {
    await prisma.usageCounter.upsert({
      where: { day_metric_detail: { day, metric: event, detail: safeDetail } },
      create: { day, metric: event, detail: safeDetail, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    // Counters must never break a user flow.
  }
}
