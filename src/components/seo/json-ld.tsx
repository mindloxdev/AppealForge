import { siteConfig } from "@/lib/public-config";

/**
 * Structured data.
 *
 * Every property here describes something a visitor can actually see on the
 * page. No ratings, no reviews, no endorsements, no invented organisation
 * details - those would be fabricated markup.
 */

type Schema = Record<string, unknown>;

export function JsonLd({ schemas }: { schemas: Schema[] }) {
  if (schemas.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, never from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}

export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "en-US",
    description: siteConfig.description,
  };
}

export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description:
      "Software that drafts insurance appeal letters for denied US medical claims from details supplied by the user.",
  };
}

export function softwareApplicationSchema(description?: string): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${siteConfig.name} appeal letter generator`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web browser)",
    url: `${siteConfig.url}/`,
    description: description ?? siteConfig.description,
    offers: [
      {
        "@type": "Offer",
        name: siteConfig.pricing.single.name,
        price: (siteConfig.pricing.single.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        description: "One-time purchase that unlocks a single generated letter.",
      },
      {
        "@type": "Offer",
        name: siteConfig.pricing.monthly.name,
        price: (siteConfig.pricing.monthly.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        description: "Monthly subscription, subject to published fair-use limits.",
      },
    ],
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${siteConfig.url}${entry.path}`,
    })),
  };
}
