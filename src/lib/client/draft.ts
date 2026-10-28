"use client";

/**
 * Client-side draft handling.
 *
 * The draft lives in React state and nowhere else: no localStorage, no
 * sessionStorage, no cookie. The locked part of the letter is ciphertext until
 * the server releases its key, so even the blurred region in the DOM contains
 * no real words.
 *
 * Payment happens in a second tab so this tab - and the draft in its memory -
 * stays alive. The success tab broadcasts the key back over a same-origin
 * BroadcastChannel.
 */

export interface SealedPayload {
  iv: string;
  ciphertext: string;
}

export interface LockedParagraph {
  words: number;
}

export interface DraftState {
  draftId: string;
  preview: string;
  sealed: SealedPayload;
  shape: LockedParagraph[];
  wordCount: number;
  placeholders: string[];
  notes: string[];
  denialReason: string;
  /** Present once unlocked. */
  key?: string;
  entitlement?: string;
  /** The editable letter, once unlocked. */
  fullLetter?: string;
}

export const UNLOCK_CHANNEL = "appealforge:unlock";

export interface UnlockBroadcast {
  draftId: string;
  key: string;
  entitlement: string;
}

function base64ToBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

export async function unsealLetter(keyBase64: string, sealed: SealedPayload): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBuffer(keyBase64),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(sealed.iv) },
    key,
    base64ToBuffer(sealed.ciphertext),
  );
  return new TextDecoder().decode(plain);
}

export function joinLetter(preview: string, locked: string): string {
  return locked ? `${preview}\n\n${locked}` : preview;
}

export function paragraphsOf(text: string): string[] {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

const SYLLABLES = [
  "re", "con", "sid", "er", "a", "tion", "med", "i", "cal", "ne", "ces", "sar", "y",
  "pol", "cy", "claim", "pa", "tient", "ap", "peal", "doc", "u", "ment",
];

/**
 * Filler for the blurred region. Built from paragraph word counts only - the
 * API never sends the words themselves, so there is nothing to read in the DOM.
 */
export function greekParagraph(wordCount: number, seed: number): string {
  let state = (seed >>> 0) || 7;
  const next = () => {
    state = (state * 1103515245 + 12345) >>> 0;
    return state / 4294967296;
  };

  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    const parts = 1 + Math.floor(next() * 3);
    let word = "";
    for (let p = 0; p < parts; p += 1) {
      word += SYLLABLES[Math.floor(next() * SYLLABLES.length)];
    }
    words.push(word);
  }
  return words.join(" ");
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError("offline", "No connection. Check your network and try again.", 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const data = payload as { ok?: boolean; error?: { code?: string; message?: string } } | null;

  if (!response.ok || !data || data.ok === false) {
    throw new ApiClientError(
      data?.error?.code ?? "server_error",
      data?.error?.message ?? "Something went wrong. Please try again.",
      response.status,
    );
  }

  return payload as T;
}

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
