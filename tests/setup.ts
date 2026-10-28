import { existsSync } from "node:fs";

// Tests run against the local .env (and .env.test when present). Nothing here
// contacts Anthropic or Stripe: those clients are only constructed by code the
// tests stub or avoid.
for (const file of [".env", ".env.test"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

process.env.AUTH_SECRET ||= "test-auth-secret-0123456789abcdef0123456789";
process.env.ENTITLEMENT_SECRET ||= "test-entitlement-secret-0123456789abcdef01";
