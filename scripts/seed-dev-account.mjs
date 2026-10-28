// Creates (or resets) a local development account so the signed-in and
// subscriber views can be exercised without Stripe.
//
//   npx tsx --tsconfig tsconfig.scripts.json scripts/seed-dev-account.mjs
//   npx tsx --tsconfig tsconfig.scripts.json scripts/seed-dev-account.mjs --free
//
// The generated password is written to scripts/.dev-account.json, which is
// gitignored, and is never printed to the terminal. Synthetic data only -
// this account is not a real person and must never hold real claim details.
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

process.loadEnvFile(".env");

const withSubscription = !process.argv.includes("--free");
const email = "dev@appealforge.test";
const name = "Dev Tester";

// Readable but not guessable: five words-worth of entropy, regenerated on
// every run so a stale copy of the file is never a working credential.
const password = `af-${randomBytes(9).toString("base64url")}`;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash(password, 12);
const emailNormalized = email.trim().toLowerCase();

const user = await prisma.user.upsert({
  where: { emailNormalized },
  update: { passwordHash, name },
  create: { email, emailNormalized, name, passwordHash },
});

await prisma.subscription.deleteMany({ where: { userId: user.id } });

if (withSubscription) {
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: `sub_dev_${user.id}`,
      stripeCustomerId: `cus_dev_${user.id}`,
      stripePriceId: "price_dev_monthly",
      status: "ACTIVE",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });
}

await prisma.$disconnect();

const target = "scripts/.dev-account.json";
writeFileSync(
  target,
  `${JSON.stringify(
    {
      note: "Local development account. Synthetic data only. Regenerated on every run of seed-dev-account.mjs.",
      url: `${process.env.APP_URL ?? "http://localhost:3000"}/login`,
      email,
      password,
      subscription: withSubscription ? "ACTIVE (letters unlock without checkout)" : "none",
    },
    null,
    2,
  )}\n`,
);

console.log(`Account ready for ${email}.`);
console.log(`Subscription: ${withSubscription ? "ACTIVE" : "none (use --free to keep it off)"}`);
console.log(`Password written to ${target} - open that file to read it.`);
