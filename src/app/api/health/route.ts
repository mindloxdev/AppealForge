import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { features, getEnv } from "@/lib/env";
import { providerStatus } from "@/lib/ai/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Booleans only. Enough to tell whether a deployment is wired up, with nothing
 * that reveals a value.
 */
export async function GET(): Promise<NextResponse> {
  const env = getEnv();
  const flags = features();

  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }

  return NextResponse.json(
    {
      ok: database,
      version: "1.0.0",
      config: {
        database,
        ai: flags.ai,
        aiProviders: providerStatus(),
        stripe: flags.stripe,
        stripePrices: flags.stripePrices,
        stripeWebhook: flags.webhooks,
        email: flags.email,
        freePreviewsPerDay: env.FREE_PREVIEWS_PER_DAY,
        appUrl: env.APP_URL,
      },
    },
    {
      status: database ? 200 : 503,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    },
  );
}
