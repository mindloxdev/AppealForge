import "server-only";
import bcrypt from "bcryptjs";

/**
 * Password hashing. bcrypt at cost 12 - slow enough to matter, fast enough for
 * a serverless request budget.
 */
const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Compare against a dummy hash so a missing account takes the same time as a
 * wrong password. Keeps sign-in from leaking which emails exist.
 */
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7f0Y7Kq2jvLxhp4UBfOqwsAxtFAZaxu";

export async function fakeVerify(): Promise<void> {
  await bcrypt.compare("not-the-password", DUMMY_HASH);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
