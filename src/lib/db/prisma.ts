import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { getEnv } from "@/lib/env";

/**
 * One Prisma client per process. Next.js hot reload would otherwise open a new
 * connection pool on every edit.
 *
 * Prisma 7 connects through a driver adapter; `pg` is the Postgres driver.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const env = getEnv();
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    // Errors only: query logs are noise, and nothing that reaches the database
    // carries claim data in the first place.
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
