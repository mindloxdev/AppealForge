import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";
import { callerIp, consume, rateLimitHeaders } from "@/lib/rate-limit";
import { track } from "@/lib/analytics/track";
import { ApiError, fail, handleRouteError, ok, readJson } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/leads
 *
 * Business contact details for the billing-company CTA. This form must never
 * be used for patient or claim information, and the schema below is deliberately
 * narrow so it cannot become a side channel for it.
 */
const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  organization: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email("Enter a valid work email address.").max(180),
  phone: z.string().trim().max(40).optional().default(""),
  monthlyClaimVolume: z.string().trim().max(60).optional().default(""),
  primaryChallenge: z.string().trim().max(400).optional().default(""),
  sourcePath: z.string().trim().max(200).optional().default(""),
  consent: z.literal(true, { message: "Please confirm you agree to be contacted." }),
  /** Honeypot. Real people never fill this. */
  company: z.string().max(200).optional().default(""),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = leadSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new ApiError(400, "invalid_lead", issue?.message ?? "Check the form and try again.", {
        field: issue?.path?.[0] ?? null,
      });
    }
    const lead = parsed.data;

    // Spam trap: accept, drop, say nothing.
    if (lead.company.trim().length > 0) {
      return ok({ received: true });
    }

    const limit = await consume("lead", callerIp(request));
    if (!limit.allowed) {
      return fail(
        429,
        "rate_limited",
        "We already have your request. Someone will be in touch shortly.",
        { resetInSeconds: limit.resetInSeconds },
        rateLimitHeaders(limit),
      );
    }

    await prisma.lead.create({
      data: {
        name: lead.name,
        organization: lead.organization || null,
        email: lead.email.toLowerCase(),
        phone: lead.phone || null,
        monthlyClaimVolume: lead.monthlyClaimVolume || null,
        primaryChallenge: lead.primaryChallenge || null,
        sourcePath: lead.sourcePath || null,
        consentedAt: new Date(),
      },
    });

    // Counter only - the lead's details are never part of an analytics event.
    await track("lead_submitted");
    await notify(lead.email);

    return ok({ received: true });
  } catch (error) {
    return handleRouteError("leads", error);
  }
}

/**
 * Optional email notification. Only runs when an email provider is configured;
 * the message names the inbox, never the claim or any clinical detail.
 */
async function notify(leadEmail: string): Promise<void> {
  const env = getEnv();
  if (!env.EMAIL_PROVIDER_API_KEY || !env.EMAIL_FROM_ADDRESS || !env.LEAD_NOTIFICATION_EMAIL) {
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM_ADDRESS,
        to: env.LEAD_NOTIFICATION_EMAIL,
        subject: "New billing-services enquiry",
        text: `A new enquiry was submitted by ${leadEmail}. Open the leads table for the full record.`,
      }),
    });
  } catch {
    // The lead is already stored; a failed notification must not fail the form.
    console.error(JSON.stringify({ event: "lead_notification_failed" }));
  }
}
