import { NextResponse, type NextRequest } from "next/server";

/**
* Per-request Content Security Policy with a nonce (Next 16 proxy convention).
 *
 * Next.js reads the nonce out of the CSP header we set here and stamps it onto
 * the scripts it injects, so no inline script needs 'unsafe-inline'.
 */
export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    `default-src 'self'`,
    // 'unsafe-eval' is only needed by the dev-mode bundler.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    // Tailwind injects a style element; styles carry no injection risk here.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://api.stripe.com${isDev ? " ws: http://localhost:*" : ""}`,
    `frame-src https://js.stripe.com https://hooks.stripe.com`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `base-uri 'none'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the image optimizer.
    {
      source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
