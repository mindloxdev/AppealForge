import "server-only";
import { NextResponse } from "next/server";

/**
 * Uniform API responses.
 *
 * Every error the browser sees is a stable code plus a sentence written for a
 * person. Stack traces, provider messages and submitted content never travel
 * in a response body, and nothing from these routes is cacheable.
 */

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Content-Type-Options": "nosniff",
};

export function ok<T extends object>(data: T, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(
    { ok: true, ...data },
    { ...init, headers: { ...NO_STORE, ...(init.headers ?? {}) } },
  );
}

export function fail(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
  headers: Record<string, string> = {},
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message, ...extra } },
    { status, headers: { ...NO_STORE, ...headers } },
  );
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Maximum accepted request body, in bytes. */
export const MAX_BODY_BYTES = 128 * 1024;

export async function readJson<T = unknown>(request: Request): Promise<T> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Send this request as JSON.");
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new ApiError(413, "payload_too_large", "That request is too large.");
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    throw new ApiError(413, "payload_too_large", "That request is too large.");
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed as T;
  } catch {
    throw new ApiError(400, "bad_json", "We could not read that request.");
  }
}

/**
 * Last line of defence. Logs a code and a short message - never a request body,
 * never form content, never a letter.
 */
export function handleRouteError(route: string, error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return fail(error.status, error.code, error.message, error.extra);
  }

  const known = error as { status?: number; code?: string; message?: string } | undefined;
  if (known && typeof known.status === "number" && typeof known.code === "string") {
    return fail(known.status, known.code, known.message ?? "Request failed.");
  }

  console.error(
    JSON.stringify({
      event: "route_error",
      route,
      message: error instanceof Error ? error.message : "unknown error",
    }),
  );
  return fail(500, "server_error", "Something went wrong on our side. Please try again.");
}
