import { Client } from "pg";
import { existsSync } from "node:fs";

/**
 * Direct database access for end-to-end tests.
 *
 * Uses `pg` rather than the application's Prisma client, because that module is
 * marked server-only and refuses to load outside a server component graph.
 */

for (const file of [".env.test", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

/** Rate-limit rows are per IP, and every test runs from the same one. */
export async function clearRateLimits(bucket?: string): Promise<void> {
  await withClient(async (client) => {
    if (bucket) {
      await client.query('DELETE FROM "RateLimit" WHERE bucket = $1', [bucket]);
    } else {
      await client.query('DELETE FROM "RateLimit"');
    }
  });
}

/** Gives an account an active subscription, as the Stripe webhook would. */
export async function seedActiveSubscription(email: string): Promise<string> {
  return withClient(async (client) => {
    const user = await client.query('SELECT id FROM "User" WHERE "emailNormalized" = $1', [
      email.toLowerCase(),
    ]);
    const userId = user.rows[0]?.id;
    if (!userId) throw new Error(`no user for ${email}`);

    const id = `sub_e2e_${Date.now()}`;
    const customerId = `cus_e2e_${Date.now()}`;

    // The webhook also stamps the customer id onto the user, which is what
    // makes the billing portal reachable.
    await client.query('UPDATE "User" SET "stripeCustomerId" = $1 WHERE id = $2', [
      customerId,
      userId,
    ]);

    await client.query(
      `INSERT INTO "Subscription"
         (id, "userId", "stripeSubscriptionId", "stripeCustomerId", "stripePriceId",
          status, "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW() + INTERVAL '30 days', false, NOW(), NOW())`,
      [id, userId, `stripe_${id}`, customerId, "price_e2e_monthly"],
    );
    return id;
  });
}

/** Records a paid purchase for a draft, as the webhook would. */
export async function seedPaidPurchase(draftId: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO "Purchase"
         (id, "draftId", "stripeSessionId", "amountTotal", currency, status, "paidAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 1200, 'usd', 'PAID', NOW(), NOW(), NOW())
       ON CONFLICT ("draftId") DO NOTHING`,
      [`pur_e2e_${Date.now()}`, draftId, `cs_test_e2e_${Date.now()}`],
    );
  });
}

export async function cleanupE2eData(): Promise<void> {
  await withClient(async (client) => {
    await client.query(`DELETE FROM "Subscription" WHERE id LIKE 'sub_e2e_%'`);
    await client.query(`DELETE FROM "Purchase" WHERE "stripeSessionId" LIKE 'cs_test_e2e_%'`);
    await client.query(`DELETE FROM "User" WHERE email LIKE '%@appealforge.test'`);
    await client.query(`DELETE FROM "Lead" WHERE email LIKE '%@appealforge.test'`);
    await client.query(`DELETE FROM "RateLimit"`);
  });
}
