# AppealForge

A full-stack web application that turns denial details and clinical notes into a
professional US medical insurance appeal letter. Free to draft and preview, $12
to unlock a single letter, $29/month for billing teams.

The product's defining constraint is that **no claim data is ever stored**. The
form, the draft and the finished letter exist only in the browser tab that made
them; the paid half of a letter travels as ciphertext whose key the server
releases only after Stripe confirms payment. That rule is enforced by a test
that walks every column of every table looking for claim markers after a full
purchase cycle.

---

## Contents

1. [Architecture](#architecture)
2. [Technology stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Local installation](#local-installation)
5. [Environment configuration](#environment-configuration)
6. [PostgreSQL setup](#postgresql-setup)
7. [Prisma migrations](#prisma-migrations)
8. [Claude API configuration](#claude-api-configuration)
9. [Stripe products and prices](#stripe-products-and-prices)
10. [Stripe webhook configuration](#stripe-webhook-configuration)
11. [Email configuration](#email-configuration)
12. [Running locally](#running-locally)
13. [Running the tests](#running-the-tests)
14. [Production build](#production-build)
15. [Deployment](#deployment)
16. [Custom domain, SSL and security headers](#custom-domain-ssl-and-security-headers)
17. [Privacy limitations and compliance](#privacy-limitations-and-compliance)
18. [Content and SEO](#content-and-seo)
19. [Troubleshooting](#troubleshooting)
20. [Production launch checklist](#production-launch-checklist)

---

## Architecture

```
src/
  app/                      routes (App Router, server-rendered)
    page.tsx                the generator, above the fold
    <9 denial pages>/       SEO landing pages from one shared template
    templates/ pricing/ ... marketing and policy pages
    account/ login/ ...     optional accounts, for subscriptions only
    checkout/success/       the tab Stripe returns to
    api/                    generate-letter, unlock, download, checkout,
                            stripe-webhook, create-portal-session, leads,
                            templates/[slug], health
  components/
    generator/              the three-step form and the letter workspace
    ui/                     shadcn-style primitives on Radix
    seo/                    the denial page template and JSON-LD builders
    leads/ marketing/ layout/ auth/ account/
  content/                  denial reasons, appeal pages, templates, FAQ
  lib/
    ai/                     system prompt (verbatim), input builder, output validation
    auth/                   sessions, password hashing, server actions
    billing/                Stripe client, entitlement checks
    documents/              DOCX and PDF generation
    privacy/                preview / paywall split
    rate-limit/             shared Postgres-backed limiter
    security/               draft sealing and entitlement tokens
    validation/             the zod schema shared by client and server
prisma/schema.prisma        accounts, payments, leads, counters - no claim data
tests/unit | integration | e2e
```

### How a letter is made

1. **Form** - three steps, validated by one zod schema used on both sides.
2. **`POST /api/generate-letter`** - validates, counts the request against the
   caller's free allowance, builds a labelled field block, calls Claude with the
   system prompt used verbatim, and validates the shape of what comes back.
3. **Split** - everything through the salutation plus the first two body
   paragraphs is the free preview. The rest is encrypted with AES-GCM.
4. **Response** - `{ draftId, preview, sealed, shape }`. The browser receives
   paragraph *word counts* for the locked part, never its words, so the blurred
   block in the DOM contains nothing readable.
5. **Payment** - checkout opens in a second tab so the tab holding the draft
   stays alive. Stripe returns to `/checkout/success`, which verifies the
   payment server-side and broadcasts the key back over a same-origin
   `BroadcastChannel`.
6. **Unlock** - the browser decrypts the remainder, enables editing and the
   exports. `POST /api/download` rebuilds the DOCX or PDF from the *edited*
   text after re-checking the entitlement.

### Why the paywall works without storing anything

The key for a draft is `HMAC(ENTITLEMENT_SECRET, draftId)`. The server can
re-derive it at any moment but only does so once a paid `Purchase` row exists
for that random draft id, or an active `Subscription` row exists for the signed
-in account. A success-page redirect never grants access on its own: either the
webhook has recorded the payment, or `/api/unlock` asks Stripe directly and
records it. Both paths converge on one row through a unique `stripeSessionId`.

---

## Technology stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 | Server-rendered SEO pages, route handlers for the API |
| Language | TypeScript (strict) | `npm run typecheck` is part of `npm run check` |
| Styling | Tailwind CSS v4 + design tokens | Tokens in `src/app/globals.css` |
| Components | shadcn-style primitives on Radix UI | Vendored in `src/components/ui` |
| Forms | React Hook Form + zod | One schema, client and server |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) | Prisma 7 reads connection URLs from `prisma.config.ts` |
| AI | `@anthropic-ai/sdk`, `claude-opus-5` | Server-only; adaptive thinking, medium effort, refusal fallbacks |
| Payments | Stripe Checkout + Billing Portal | Verified webhooks, idempotent processing |
| Documents | `docx` and `pdf-lib` | Real files, not screenshots of HTML |
| Auth | `jose` + `bcryptjs` | See the note below |
| Tests | Vitest + Playwright | 42 unit/integration, 36 end-to-end |

**On authentication:** the account surface is deliberately small - sign in, sign
out, reset password, manage billing - because accounts exist only to hold a
subscription. Rather than adopt a full framework for that, sessions are a signed
JWT in an HTTP-only cookie (`jose`) and passwords are bcrypt hashes, with the
rules a framework would give us written explicitly in `src/lib/auth/`: uniform
sign-in errors, a dummy verify on unknown accounts so timing does not leak,
single-use reset tokens that invalidate their siblings, and rate limiting on
every auth action. If you later need SSO or social login, swap this module.

---

## Prerequisites

- **Node.js 20 or newer** (22+ recommended; developed on 24).
- **PostgreSQL 14+** - a local instance, Docker, or a managed provider.
- **A Stripe account** - test mode is enough for everything except live charges.
- **An Anthropic API key** - the letter generator returns a clear
  "not configured" error without one, and everything else still works.

---

## Local installation

```bash
git clone <your-repo-url> appealforge-web
cd appealforge-web
npm install          # runs `prisma generate` afterwards
cp .env.example .env # then fill it in - see below
```

---

## Environment configuration

Every variable is documented in `.env.example`. The required ones:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Runtime (pooled) connection |
| `DIRECT_URL` | yes | Unpooled connection for migrations |
| `AUTH_SECRET` | yes | Signs session cookies (32+ chars) |
| `ENTITLEMENT_SECRET` | yes | Derives letter keys and signs entitlements (32+ chars) |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | yes | Canonical URLs and Stripe returns |
| `ANTHROPIC_API_KEY` | production | The letter generator |
| `STRIPE_SECRET_KEY` | for payments | Server-side Stripe |
| `STRIPE_WEBHOOK_SECRET` | for payments | Webhook signature verification |
| `STRIPE_SINGLE_LETTER_PRICE_ID` | recommended | Otherwise an inline price is created |
| `STRIPE_MONTHLY_PRICE_ID` | recommended | Otherwise an inline price is created |
| `BILLING_COMPANY_NAME` + `NEXT_PUBLIC_BILLING_COMPANY_NAME` | recommended | The lead CTA on every page |
| `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `LEAD_NOTIFICATION_EMAIL` | optional | Password reset and lead notifications |
| `FREE_PREVIEWS_PER_DAY` | optional | Defaults to 3 |

Generate the secrets:

```bash
openssl rand -base64 48   # AUTH_SECRET
openssl rand -base64 48   # ENTITLEMENT_SECRET
```

`GET /api/health` reports which of these are present - as booleans, never
values. It is the fastest way to confirm a deployment is wired up.

---

## PostgreSQL setup

**Docker (what the development environment uses):**

```bash
docker run -d --name appealforge-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=appealforge \
  -p 55432:5432 postgres:16-alpine
```

Then in `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/appealforge?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:55432/appealforge?schema=public"
```

**Managed providers** (Neon, Supabase, Railway, RDS) work unchanged. Where the
provider offers a pooled and a direct URL, put the pooled one in `DATABASE_URL`
and the direct one in `DIRECT_URL`.

---

## Prisma migrations

Prisma 7 takes connection URLs from `prisma.config.ts`, not from the schema.

```bash
npx prisma migrate dev            # create and apply a migration (development)
npx prisma migrate deploy         # apply existing migrations (production)
npx prisma generate               # regenerate the client (also runs on install)
npx prisma studio                 # inspect the data
```

The schema holds accounts, Stripe references, business leads, webhook
idempotency keys, rate-limit counters and anonymous daily counters. There is no
table for letters or claim data, by design.

---

## Claude API configuration

Set `ANTHROPIC_API_KEY`. `ANTHROPIC_MODEL` defaults to `claude-opus-5`.

The system prompt is used **verbatim**. It lives in `docs/system-prompt.txt`,
is compiled into `src/lib/ai/system-prompt.ts` by
`npm run prompt:generate`, and a unit test fails if the shipped string stops
matching the spec copy or its recorded SHA-256. User input never touches it:
form values travel in a separate, fenced user message, flattened to one line per
field and stripped of anything resembling the fence.

What the request sets: adaptive thinking at medium effort, the system prompt
cached, server-side refusal fallbacks, a 120-second timeout, and at most one
retry - and only for a failure that produced no letter, so a user is never
billed twice for one draft.

---

## Stripe products and prices

1. In the Stripe dashboard (test mode), create two prices:
   - **Single letter** - one-time, $12.00 USD.
   - **Monthly plan** - recurring monthly, $29.00 USD.
2. Copy each price ID (`price_...`) into `STRIPE_SINGLE_LETTER_PRICE_ID` and
   `STRIPE_MONTHLY_PRICE_ID`.
3. Enable the **Billing Portal** (Settings → Billing → Customer portal) and
   allow cancellation, so `/account/billing` works.

If the price IDs are left blank the application creates inline prices at the
amounts in `src/lib/public-config.ts`. That is fine for a first test and poor
for reporting; set real price IDs before launch.

Prices are never taken from the browser. The client sends a plan name only.

---

## Stripe webhook configuration

**Locally**, with the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET, then restart `npm run dev`
```

**In production**, add an endpoint at `https://your-domain/api/stripe-webhook`
and subscribe to:

```
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
charge.refunded
customer.subscription.created
customer.subscription.updated
customer.subscription.paused
customer.subscription.resumed
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

Signatures are verified against the raw body. Each event id is inserted before
processing, so a duplicate delivery is acknowledged and ignored; a handler
failure returns 500 and clears the key so Stripe's retry can run it again.

---

## Email configuration

Optional, and Resend-compatible. Without it:

- Password reset links cannot be emailed. In development the link is displayed
  on the page instead; in production the request returns the same neutral
  message to everyone and no mail is sent - so configure this before launch if
  you want password reset to work.
- Lead notifications are skipped. The lead is still stored.

---

## Running locally

```bash
npm run dev          # http://localhost:3000
```

Useful scripts:

```bash
npm run typecheck          # tsc --noEmit
npm run lint               # eslint
npm run test               # vitest (unit + integration)
npm run test:e2e           # playwright
npm run check              # typecheck + lint + test + build
npm run prompt:generate    # rebuild the system prompt module from docs/
npx tsx scripts/count-page-words.mjs          # SEO pages must stay 700-1,000 words
npx tsx scripts/generate-denial-routes.mjs    # regenerate the denial page routes
```

---

## Running the tests

**Unit and integration** (`npm run test`) need the database running. The
Anthropic SDK is mocked, so no API call is made and nothing is spent.

- `tests/unit` - the verbatim prompt, the structured input block, form
  validation, output validation, the preview/paywall split, document shaping.
- `tests/integration/api.test.ts` - the route handlers against a real database:
  generation, the free allowance and its refund on failure, unlock, downloads,
  forged entitlements, leads, webhook signature verification and idempotency.
- `tests/integration/privacy.test.ts` - runs a full generate → pay → unlock →
  download cycle with marker strings in every claim field, then scans every
  text column of every table for them. This is the test that holds the product's
  central promise in place.

**End-to-end** (`npm run test:e2e`) drives the installed Chrome against the dev
server. Start it first:

```bash
npm run dev
npx tsx --tsconfig tsconfig.scripts.json scripts/seed-test-draft.mjs  # one sealed, paid draft
npm run test:e2e
```

Covered: the free preview and that the locked text is genuinely absent from the
DOM; unlock through the real API and both downloads; editing changing what gets
exported; account creation, sign-in and sign-out; a subscriber unlocking without
a purchase; rejection of forged entitlements and unknown drafts; every SEO page's
metadata, preset, structured data and internal links; sitemap and robots; no
horizontal scroll and comfortable tap targets at phone and desktop widths;
labelled controls, keyboard-only operation of the searchable dropdown, a visible
focus ring in both normal and forced-colors modes, and reduced-motion support.

Only the model call is ever stubbed. To exercise it for real, put a key in
`.env` and use the app - that spends money on the API; nothing in `npm run test`
does.

---

## Production build

```bash
npm run build
npm run start
```

`npm run check` runs typecheck, lint, the Vitest suites and the build in order.

---

## Deployment

The application is a standard Node.js Next.js app. It does **not** depend on any
edge-only runtime: every route handler declares `runtime = "nodejs"`.

### Vercel

1. Push the repository and import it at vercel.com.
2. Add every variable from `.env.example` in **Project → Settings →
   Environment Variables** (production and preview).
3. Set the build command to `prisma migrate deploy && next build` so migrations
   run before each deployment, or run `npx prisma migrate deploy` from CI.
4. Deploy, then add the Stripe webhook endpoint for the deployed URL and paste
   the signing secret back into the environment.
5. Check `https://your-domain/api/health`.

### Railway, Render, Fly.io or your own server

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start            # listens on $PORT, default 3000
```

Put the app behind TLS, set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the public
origin, and provision PostgreSQL from the same provider or a managed one.

### Database

Any managed PostgreSQL works. Point `DIRECT_URL` at an unpooled connection for
migrations. Run `prisma migrate deploy` on every release.

---

## Custom domain, SSL and security headers

1. Point the domain at your host and let it issue the certificate (Vercel,
   Railway and Render all do this automatically; use Caddy or certbot if you
   are self-hosting).
2. Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to `https://your-domain` with no
   trailing slash - canonical URLs, the sitemap and Stripe returns all read it.
3. Confirm the headers in `next.config.ts` and `src/proxy.ts` survive your
   proxy: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, a referrer policy,
   a permissions policy, and a per-request nonce-based Content Security Policy.
   API routes additionally send `no-store` and `noindex`.
4. Verify the CSP in the browser console after deploying - a proxy that rewrites
   headers can silently break it.

---

## Privacy limitations and compliance

Read this before letting a practice use the tool.

- **What is never stored:** the form, the draft, the finished letter, patient
  name, date of birth, member ID, claim number, diagnosis, codes or clinical
  narrative. Not in the database, not in Stripe metadata, not in URLs, not in
  analytics, not in logs.
- **What is stored:** accounts (email, password hash, Stripe customer id),
  payment records keyed by a random draft id, business leads from the contact
  form, rate-limit counters keyed by a salted hash of the caller's IP with an
  automatic expiry, and anonymous daily event counts.
- **The consequence:** a closed tab destroys the draft, and nobody - including
  the operator - can recover it. The UI, the success page and the refund policy
  all say so.
- **PHI still transits the system.** Minimising and not retaining data is not
  the same as being outside HIPAA. If you are a covered entity or a business
  associate, either put the appropriate agreements in place with this
  service and its processors (hosting, Anthropic, Stripe, email), or instruct
  staff to leave patient identifiers blank - the letter brackets them and works
  exactly as well.
- **No compliance claim is made anywhere in the product**, and none should be
  added without the agreements and operational safeguards actually being in
  place. Get a legal and security review before processing PHI for third
  parties.
- **No third-party analytics.** There is no analytics script in the browser
  bundle at all, so form fields cannot be auto-captured and sessions cannot be
  replayed. Counters are server-side aggregates.

---

## Content and SEO

Nine denial-specific landing pages plus `/templates`, all rendered from
`src/components/seo/denial-page.tsx` and the typed content in
`src/content/appeal-pages/`. Each page carries 700-1,000 words of its own
content - enforced by `npx tsx scripts/count-page-words.mjs` and an end-to-end
test - with its own definition, causes, strategies, documentation list, sample
paragraph and FAQs.

To add a page: add a content module and export it from
`src/content/appeal-pages/index.ts`, then run
`npx tsx scripts/generate-denial-routes.mjs`.

Metadata is built through `src/lib/seo.ts` so no page can lose its canonical or
its social card. Structured data (`SoftwareApplication`, `FAQPage`,
`BreadcrumbList`, `Organization`, `WebSite`) describes only what is visible -
no ratings, no reviews, nothing fabricated.

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Invalid server environment` on startup | A required variable is missing or too short. The message names it. |
| `/api/health` returns 503 | The database is unreachable. Check `DATABASE_URL` and that Postgres is running. |
| Letter generation returns "not configured" | `ANTHROPIC_API_KEY` is empty. |
| Checkout returns "Payments are not configured" | `STRIPE_SECRET_KEY` is empty. |
| Payment succeeds but the letter does not unlock | The webhook is not reaching you. `/api/unlock` falls back to asking Stripe directly, so check `STRIPE_WEBHOOK_SECRET` and the endpoint URL. |
| "That payment belongs to a different letter" | A one-time purchase unlocks the draft it was bought for. Use the tab where that draft was generated, or the monthly plan. |
| The draft disappeared | It only ever lived in that tab. Nothing is stored; the refund policy covers this case. |
| `prisma migrate` cannot connect | Migrations use `DIRECT_URL`. Pooled URLs often reject the advisory locks migrations need. |
| `server-only` throws in a script | Run it with `npx tsx --tsconfig tsconfig.scripts.json`, which aliases that module for scripts. |
| Playwright cannot find a browser | The config uses the installed Chrome (`channel: "chrome"`). Install Chrome or drop the channel to download a bundled browser. |

---

## Production launch checklist

**Configuration**

- [ ] Real `AUTH_SECRET` and `ENTITLEMENT_SECRET` (32+ random characters each).
- [ ] `APP_URL` and `NEXT_PUBLIC_APP_URL` set to the public origin.
- [ ] `ANTHROPIC_API_KEY` set; `/api/health` shows `ai: true`.
- [ ] Live Stripe keys, both price IDs, and the webhook secret from the live
      endpoint.
- [ ] `BILLING_COMPANY_NAME` and `NEXT_PUBLIC_BILLING_COMPANY_NAME` replaced -
      the placeholder `[Billing Company]` appears on every page until you do.
- [ ] Email provider configured, or password reset knowingly disabled.

**Content and legal**

- [ ] Replace every `[DATE]`, `[LEGAL ENTITY NAME]`, `[STATE / JURISDICTION]`
      and `[VENUE]` placeholder in `/privacy`, `/terms` and `/refund-policy`.
- [ ] Confirm the processor table in `/privacy` matches your actual deployment.
- [ ] Have counsel review the privacy policy, terms and refund policy.
- [ ] Decide and document your PHI posture (see above).

**Verification**

- [ ] `npm run check` passes.
- [ ] `npm run test:e2e` passes against a deployed preview.
- [ ] A real test purchase with card `4242 4242 4242 4242` unlocks a letter, and
      both downloads open in Word and a PDF reader.
- [ ] A test subscription unlocks letters without further checkout, and
      cancelling in the billing portal ends access at the period end.
- [ ] The webhook endpoint shows successful deliveries in the Stripe dashboard.
- [ ] `/sitemap.xml` and `/robots.txt` resolve on the live domain; submit the
      sitemap to Search Console.
- [ ] Structured data passes Google's Rich Results Test on one denial page.
- [ ] Switch Stripe out of test mode last, and re-run the purchase check.
