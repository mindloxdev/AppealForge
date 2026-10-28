import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";

/**
 * Rate limiting, shared across instances.
 *
 * Counters live in Postgres rather than process memory, because a serverless
 * deployment runs many instances and a per-process counter would let a caller
 * multiply their allowance by the number of warm lambdas.
 *
 * The identifier is a salted hash of the caller IP, never the raw address, and
 * each row carries an expiry so nothing is retained beyond its window.
 */

export type Bucket =
  | "generate-free"
  | "generate-any"
  | "checkout"
  | "lead"
  | "auth"
  | "download"
  | "unlock";

interface BucketPolicy {
  limit: number;
  windowSeconds: number;
}

const POLICIES: Record<Bucket, BucketPolicy> = {
  // The published free allowance: three preview generations per day.
  "generate-free": { limit: 3, windowSeconds: 60 * 60 * 24 },
  // A ceiling that applies to everyone, including subscribers, as abuse
  // protection. Published in the terms as fair use.
  "generate-any": { limit: 60, windowSeconds: 60 * 60 },
  checkout: { limit: 12, windowSeconds: 60 * 15 },
  lead: { limit: 5, windowSeconds: 60 * 60 },
  auth: { limit: 10, windowSeconds: 60 * 15 },
  download: { limit: 60, windowSeconds: 60 * 60 },
  unlock: { limit: 30, windowSeconds: 60 * 15 },
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  /** Opaque handle so a caller can release a reservation that was not used. */
  release: () => Promise<void>;
}

/**
 * Caller IP, read from the request the handler already has rather than from
 * framework async context - which keeps this callable from a test.
 */
export function callerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "0.0.0.0";
}

/** Salted, truncated hash - enough to count, useless as an identity. */
export function identifierFor(raw: string): string {
  return createHash("sha256")
    .update(`${getEnv().ENTITLEMENT_SECRET}:${raw}`)
    .digest("base64url")
    .slice(0, 32);
}

function windowStartFor(windowSeconds: number, now: Date): Date {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / ms) * ms);
}

export async function consume(
  bucket: Bucket,
  rawIdentifier: string,
  options: { now?: Date; policy?: Partial<BucketPolicy> } = {},
): Promise<RateLimitResult> {
  const now = options.now ?? new Date();
  const base = POLICIES[bucket];
  const limit = options.policy?.limit ?? overrideLimit(bucket) ?? base.limit;
  const windowSeconds = options.policy?.windowSeconds ?? base.windowSeconds;

  const identifier = identifierFor(rawIdentifier);
  const windowStart = windowStartFor(windowSeconds, now);
  const expiresAt = new Date(windowStart.getTime() + windowSeconds * 1000);
  const resetInSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));

  const noop = async () => {};

  if (limit <= 0) {
    return { allowed: false, limit, remaining: 0, resetInSeconds, release: noop };
  }

  let count: number;
  try {
    const row = await prisma.rateLimit.upsert({
      where: { bucket_identifier_windowStart: { bucket, identifier, windowStart } },
      create: { bucket, identifier, windowStart, count: 1, expiresAt },
      update: { count: { increment: 1 } },
      select: { id: true, count: true },
    });
    count = row.count;
  } catch {
    // A database hiccup must not take the product down. Fail open, and let the
    // health endpoint surface the real problem.
    return { allowed: true, limit, remaining: limit, resetInSeconds, release: noop };
  }

  const release = async () => {
    try {
      await prisma.rateLimit.updateMany({
        where: { bucket, identifier, windowStart, count: { gt: 0 } },
        data: { count: { decrement: 1 } },
      });
    } catch {
      // Best effort only.
    }
  };

  if (count > limit) {
    return { allowed: false, limit, remaining: 0, resetInSeconds, release: noop };
  }

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - count),
    resetInSeconds,
    release,
  };
}

function overrideLimit(bucket: Bucket): number | undefined {
  if (bucket !== "generate-free") return undefined;
  return getEnv().FREE_PREVIEWS_PER_DAY;
}

/** Housekeeping for expired rows; safe to call from a cron or a deploy hook. */
export async function purgeExpired(now = new Date()): Promise<number> {
  const result = await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  return result.count;
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.resetInSeconds),
  };
}
