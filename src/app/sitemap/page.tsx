import type { Metadata } from "next";
import Link from "next/link";
import { APPEAL_PAGES } from "@/content/appeal-pages";
import { LETTER_TEMPLATES } from "@/content/templates";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on AppealForge, in one list.",
  alternates: { canonical: "/sitemap" },
};

const GROUPS = [
  {
    title: "Tool",
    links: [
      { href: "/", label: "Appeal letter generator" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/templates", label: "Letter templates" },
      { href: "/denial-reasons", label: "Denial reasons" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "For billing teams",
    links: [
      { href: "/for-medical-billers", label: "For medical billers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Create an account" },
      { href: "/forgot-password", label: "Reset your password" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/refund-policy", label: "Refund and cancellation policy" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="font-display text-3xl font-bold">Sitemap</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every page on this site. The machine-readable version is at{" "}
        <Link href="/sitemap.xml" className="underline underline-offset-2 hover:text-foreground">
          /sitemap.xml
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-accent hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Denial appeal guides">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Denial appeal guides
          </h2>
          <ul className="mt-3 space-y-2">
            {APPEAL_PAGES.map((page) => (
              <li key={page.slug}>
                <Link href={`/${page.slug}`} className="text-sm hover:text-accent hover:underline">
                  {page.h1}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Letter templates" className="md:col-span-2">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Letter templates
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {LETTER_TEMPLATES.map((template) => (
              <li key={template.slug}>
                <Link
                  href={`/api/templates/${template.slug}?format=docx`}
                  className="text-sm hover:text-accent hover:underline"
                >
                  {template.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
