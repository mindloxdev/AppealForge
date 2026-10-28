"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";
import { createSession, destroySession, getOptionalSession } from "@/lib/auth/session";
import { fakeVerify, hashPassword, normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { consume } from "@/lib/rate-limit";

/**
 * Account actions.
 *
 * Deliberately small: accounts exist to manage a subscription, not to store
 * letters. Sign-in answers are uniform so the form cannot be used to discover
 * which email addresses have accounts.
 */

export interface AuthState {
  error?: string;
  notice?: string;
  /** Development convenience only - never populated in production. */
  devResetLink?: string;
}

const emailSchema = z.string().trim().email("Enter a valid email address.").max(180);
const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That password is too long.");

const GENERIC_SIGN_IN_ERROR = "That email and password combination is not correct.";

async function limitAuth(): Promise<string | null> {
  // Server actions run inside a request scope, so the header store is available.
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "0.0.0.0";
  const result = await consume("auth", ip);
  if (result.allowed) return null;
  const minutes = Math.max(1, Math.round(result.resetInSeconds / 60));
  return `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await limitAuth();
  if (limited) return { error: limited };

  const parsed = z
    .object({
      name: z.string().trim().max(120).optional().default(""),
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const email = parsed.data.email;
  const emailNormalized = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { emailNormalized },
    select: { id: true },
  });
  if (existing) {
    // Honest, because the sign-up form has to be usable; the sign-in form is
    // where enumeration actually matters.
    return { error: "An account already exists for that email. Sign in instead." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      emailNormalized,
      name: parsed.data.name || null,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true, email: true },
  });

  await createSession(user.id, user.email);
  redirect("/account");
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await limitAuth();
  if (limited) return { error: limited };

  const parsed = z
    .object({ email: emailSchema, password: z.string().min(1) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });

  if (!parsed.success) return { error: GENERIC_SIGN_IN_ERROR };

  const user = await prisma.user.findUnique({
    where: { emailNormalized: normalizeEmail(parsed.data.email) },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user) {
    // Same work either way, so timing does not reveal the answer.
    await fakeVerify();
    return { error: GENERIC_SIGN_IN_ERROR };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: GENERIC_SIGN_IN_ERROR };

  await createSession(user.id, user.email);
  redirect("/account");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limited = await limitAuth();
  if (limited) return { error: limited };

  const parsed = emailSchema.safeParse(formData.get("email"));
  const notice =
    "If an account exists for that address, a reset link is on its way. The link expires in one hour.";

  if (!parsed.success) return { notice };

  const user = await prisma.user.findUnique({
    where: { emailNormalized: normalizeEmail(parsed.data) },
    select: { id: true, email: true },
  });
  if (!user) return { notice };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const env = getEnv();
  const link = `${env.APP_URL}/reset-password?token=${token}`;
  const delivered = await sendResetEmail(user.email, link);

  if (!delivered && env.NODE_ENV === "development") {
    // Local development has no mail provider; surface the link so the flow can
    // be exercised. Never returned outside development.
    return { notice, devResetLink: link };
  }

  return { notice };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limited = await limitAuth();
  if (limited) return { error: limited };

  const parsed = z
    .object({ token: z.string().min(10).max(200), password: passwordSchema })
    .safeParse({ token: formData.get("token"), password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "That reset link is not valid." };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: "That reset link has expired. Request a new one." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Any other outstanding reset tokens for this account are now void.
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { notice: "Your password has been changed. Sign in with the new one." };
}

async function sendResetEmail(to: string, link: string): Promise<boolean> {
  const env = getEnv();
  if (!env.EMAIL_PROVIDER_API_KEY || !env.EMAIL_FROM_ADDRESS) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM_ADDRESS,
        to,
        subject: "Reset your AppealForge password",
        text: `Use this link within the next hour to choose a new password:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Used by server components that need the signed-in user. */
export async function currentUser() {
  const session = await getOptionalSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      stripeCustomerId: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          stripePriceId: true,
          createdAt: true,
        },
      },
      purchases: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          amountTotal: true,
          currency: true,
          createdAt: true,
          paidAt: true,
        },
      },
    },
  });
}
