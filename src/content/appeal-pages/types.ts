import type { DenialReasonKey } from "@/content/denial-reasons";

/**
 * Structured content for the denial-specific SEO pages.
 *
 * Every page renders from this shape through one shared template, so a new
 * denial page is a content change rather than a new React tree. Each page must
 * carry its own distinct explanation, causes, strategies and FAQs - thin
 * variations of the same text would be worse than no page at all.
 */

export interface ContentSection {
  heading: string;
  intro?: string;
  paragraphs?: string[];
  items?: { title: string; body: string }[];
  bullets?: string[];
}

export interface AppealPageFaq {
  question: string;
  answer: string;
}

export interface AppealPage {
  /** URL slug, without a leading slash. */
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  intro: string;
  /** Preselects the generator. */
  toolPreset: DenialReasonKey;
  denialCode: string;
  denialReasonLabel: string;
  heroPoints: string[];

  definition: ContentSection;
  commonCauses: ContentSection;
  strategies: ContentSection;
  documentation: ContentSection;

  sampleParagraph: {
    heading: string;
    label: string;
    text: string;
    note: string;
  };

  faqs: AppealPageFaq[];
  related: string[];
}
