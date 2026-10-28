import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

/**
 * The privacy-preserving paywall.
 *
 * No letter is stored anywhere, so the paid part of a draft travels to the
 * browser as AES-GCM ciphertext. Its key is derived from a server secret and
 * the draft id: HMAC(ENTITLEMENT_SECRET, draftId). The server can re-derive the
 * key at any moment but only does so once Stripe confirms a payment carrying
 * that same draft id, or once an active subscription is verified.
 *
 * Consequences, stated plainly elsewhere in the product: closing the tab
 * destroys the draft, and nobody - including us - can recover it.
 */

const enc = new TextEncoder();

export function newDraftId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

export function isDraftId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(value);
}

function toBase64(bytes: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(bytes)).toString("base64");
}

/** Base64 to a standalone ArrayBuffer, which is what WebCrypto wants. */
function fromBase64(value: string): ArrayBuffer {
  const buffer = Buffer.from(value, "base64");
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function utf8(value: string): ArrayBuffer {
  const bytes = enc.encode(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function hmac(message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(getEnv().ENTITLEMENT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, utf8(message));
}

/** 32 bytes of AES key material bound to one draft. */
export async function deriveLetterKey(draftId: string): Promise<ArrayBuffer> {
  if (!isDraftId(draftId)) throw new Error("invalid draft id");
  return hmac(`appealforge:letter:v1:${draftId}`);
}

export async function deriveLetterKeyBase64(draftId: string): Promise<string> {
  return toBase64(await deriveLetterKey(draftId));
}

export interface SealedText {
  iv: string;
  ciphertext: string;
}

export async function sealText(draftId: string, plaintext: string): Promise<SealedText> {
  const keyBytes = await deriveLetterKey(draftId);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    utf8(plaintext),
  );
  return {
    iv: Buffer.from(iv).toString("base64"),
    ciphertext: toBase64(ciphertext),
  };
}

/** Mirror of the browser-side unseal; used by tests and by document export. */
export async function unsealText(keyBase64: string, sealed: SealedText): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    fromBase64(keyBase64),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(sealed.iv) },
    key,
    fromBase64(sealed.ciphertext),
  );
  return new TextDecoder().decode(plain);
}

// --- entitlement tokens ----------------------------------------------------

const ISSUER = "appealforge";
const AUDIENCE = "appealforge:entitlement";
const PURCHASE_TTL = "24h";
const SUBSCRIPTION_TTL = "12h";

export type EntitlementKind = "purchase" | "subscription";

export interface EntitlementClaims {
  kind: EntitlementKind;
  /** Draft the token unlocks. Subscription tokens are not bound to one draft. */
  draftId?: string;
  /** Subscription row id, re-checked against the database on every use. */
  subscriptionId?: string;
  exp: number;
}

function secretKey(): Uint8Array {
  return enc.encode(getEnv().ENTITLEMENT_SECRET);
}

export async function issuePurchaseEntitlement(draftId: string): Promise<string> {
  return new SignJWT({ kind: "purchase", draftId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(PURCHASE_TTL)
    .sign(secretKey());
}

export async function issueSubscriptionEntitlement(subscriptionId: string): Promise<string> {
  return new SignJWT({ kind: "subscription", subscriptionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(SUBSCRIPTION_TTL)
    .sign(secretKey());
}

export async function verifyEntitlement(token: unknown): Promise<EntitlementClaims | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 4096) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    const kind = payload.kind;
    if (kind !== "purchase" && kind !== "subscription") return null;
    return {
      kind,
      draftId: typeof payload.draftId === "string" ? payload.draftId : undefined,
      subscriptionId:
        typeof payload.subscriptionId === "string" ? payload.subscriptionId : undefined,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}
