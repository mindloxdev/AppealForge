import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once at first use.
 *
 * Nothing here is ever imported into a client component - the `server-only`
 * guard above turns that mistake into a build error rather than a leaked key.
 * Public values live in src/lib/public-config.ts instead.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  // Which provider drafts the letter. "auto" uses every configured provider,
  // best first, so one key running out of credit does not take the product
  // down. Naming one pins it - no silent switch to a different model.
  AI_PROVIDER: z.enum(["auto", "anthropic", "mistral"]).default("auto"),

  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5"),

  MISTRAL_API_KEY: z.string().optional().default(""),
  MISTRAL_MODEL: z.string().default("mistral-medium-latest"),

  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_SINGLE_LETTER_PRICE_ID: z.string().optional().default(""),
  STRIPE_MONTHLY_PRICE_ID: z.string().optional().default(""),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  ENTITLEMENT_SECRET: z
    .string()
    .min(32, "ENTITLEMENT_SECRET must be at least 32 characters"),

  APP_URL: z.string().url().default("http://localhost:3000"),

  BILLING_COMPANY_NAME: z.string().default("[Billing Company]"),
  BILLING_COMPANY_EMAIL: z.string().email().default("appeals@example.com"),

  EMAIL_PROVIDER_API_KEY: z.string().optional().default(""),
  EMAIL_FROM_ADDRESS: z.string().optional().default(""),
  LEAD_NOTIFICATION_EMAIL: z.string().optional().default(""),

  FREE_PREVIEWS_PER_DAY: z.coerce.number().int().min(0).max(100).default(3),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    // The message names the variables, never their values.
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Feature switches, so routes can degrade honestly instead of crashing. */
export function features() {
  const env = getEnv();
  return {
    ai: env.ANTHROPIC_API_KEY.length > 0 || env.MISTRAL_API_KEY.length > 0,
    stripe: env.STRIPE_SECRET_KEY.length > 0,
    stripePrices: {
      single: env.STRIPE_SINGLE_LETTER_PRICE_ID.length > 0,
      monthly: env.STRIPE_MONTHLY_PRICE_ID.length > 0,
    },
    webhooks: env.STRIPE_WEBHOOK_SECRET.length > 0,
    email: env.EMAIL_PROVIDER_API_KEY.length > 0 && env.EMAIL_FROM_ADDRESS.length > 0,
  };
}
