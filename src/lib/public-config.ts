/**
 * Values safe for the browser bundle. No secrets, no server-only config.
 */
export const siteConfig = {
  name: "AppealForge",
  tagline: "Create a stronger medical necessity appeal letter",
  description:
    "Turn your denial details and clinical documentation into a professional insurance appeal letter. Review your draft, prepare your supporting documents, and download your letter when ready.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "en_US",
  billingCompany: {
    name: process.env.NEXT_PUBLIC_BILLING_COMPANY_NAME || "[Billing Company]",
  },
  pricing: {
    single: {
      id: "single" as const,
      name: "Single letter",
      priceCents: 1200,
      priceLabel: "$12",
      cadence: "one-time",
    },
    monthly: {
      id: "monthly" as const,
      name: "Monthly plan",
      priceCents: 2900,
      priceLabel: "$29",
      cadence: "per month",
    },
  },
} as const;

export type PlanId = keyof typeof siteConfig.pricing;

export const mainNav = [
  // `short` keeps the desktop bar on one line; `label` is the full name, used
  // in the mobile sheet and as the accessible name in both.
  { href: "/#generator", label: "Appeal Letter Generator", short: "Generator" },
  { href: "/denial-reasons", label: "Denial Reasons", short: "Denial Reasons" },
  { href: "/templates", label: "Letter Templates", short: "Templates" },
  { href: "/how-it-works", label: "How It Works", short: "How It Works" },
  { href: "/pricing", label: "Pricing", short: "Pricing" },
  { href: "/for-medical-billers", label: "For Medical Billers", short: "For Billers" },
  { href: "/faq", label: "FAQ", short: "FAQ" },
] as const;

export const footerNav = [
  {
    title: "Product",
    links: [
      { href: "/#generator", label: "Appeal letter generator" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/templates", label: "Letter templates" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Denial appeal resources",
    links: [
      { href: "/medical-necessity-appeal-letter", label: "Medical necessity appeal" },
      { href: "/co-50-denial-appeal-letter", label: "CO-50 denial appeal" },
      { href: "/prior-authorization-denial-appeal-letter", label: "Prior authorization appeal" },
      { href: "/co-197-denial-appeal-letter", label: "CO-197 denial appeal" },
      { href: "/timely-filing-appeal-letter", label: "Timely filing appeal" },
      { href: "/co-97-bundling-denial-appeal-letter", label: "Bundling and NCCI appeal" },
      { href: "/experimental-investigational-denial-appeal-letter", label: "Experimental denial appeal" },
      { href: "/out-of-network-denial-appeal-letter", label: "Out-of-network appeal" },
      { href: "/appeal-letter-for-patients", label: "Appeal letter for patients" },
    ],
  },
  {
    title: "Medical billing services",
    links: [
      { href: "/for-medical-billers", label: "For medical billers" },
      { href: "/contact", label: "Talk to our billing team" },
      { href: "/denial-reasons", label: "Denial reason library" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/refund-policy", label: "Refund and Cancellation" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
] as const;
