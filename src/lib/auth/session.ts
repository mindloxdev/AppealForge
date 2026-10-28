import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

/**
 * Session handling.
 *
 * A signed, HTTP-only cookie holding a short JWT. We deliberately do not use a
 * full auth framework here: the account surface is small (sign in, sign out,
 * reset password, manage billing), and jose + bcrypt are mature, auditable
 * building blocks that work unchanged on Node and Edge runtimes. The rules the
 * framework would give us are implemented explicitly below.
 */
export const SESSION_COOKIE = "af_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const ISSUER = "appealforge";
const AUDIENCE = "appealforge:session";

export interface SessionPayload {
  userId: string;
  email: string;
  /** Issued-at, seconds. Used to decide whether to roll the cookie forward. */
  iat: number;
  exp: number;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function signSessionToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      userId: payload.sub,
      email: payload.email,
      iat: payload.iat ?? 0,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createSession(userId: string, email: string): Promise<void> {
  const token = await signSessionToken(userId, email);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL_SECONDS));
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(0));
}

/** Returns the session when the cookie is present and valid, else null. */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Session from an explicit Request, for route handlers. Reading the cookie
 * header directly keeps handlers independent of framework async context.
 */
export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== SESSION_COOKIE) continue;
    return verifySessionToken(decodeURIComponent(part.slice(index + 1).trim()));
  }
  return null;
}

/** Throws when there is no valid session. Use in server components. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getOptionalSession();
  if (!session) {
    const error = new Error("Not signed in") as Error & { status: number };
    error.status = 401;
    throw error;
  }
  return session;
}
