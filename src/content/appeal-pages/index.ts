import type { AppealPage } from "./types";
import { medicalNecessityPage } from "./medical-necessity";
import { co50Page } from "./co-50";
import { priorAuthorizationPage } from "./prior-authorization";
import { co197Page } from "./co-197";
import { timelyFilingPage } from "./timely-filing";
import { bundlingPage } from "./bundling";
import { experimentalPage } from "./experimental";
import { outOfNetworkPage } from "./out-of-network";
import { patientsPage } from "./patients";

export type { AppealPage, AppealPageFaq, ContentSection } from "./types";

/** Every denial-specific landing page, in navigation order. */
export const APPEAL_PAGES: AppealPage[] = [
  medicalNecessityPage,
  co50Page,
  priorAuthorizationPage,
  co197Page,
  timelyFilingPage,
  bundlingPage,
  experimentalPage,
  outOfNetworkPage,
  patientsPage,
];

const BY_SLUG = new Map(APPEAL_PAGES.map((page) => [page.slug, page]));

export function getAppealPage(slug: string): AppealPage | undefined {
  return BY_SLUG.get(slug);
}

export const APPEAL_PAGE_SLUGS = APPEAL_PAGES.map((page) => page.slug);

/** Words of page content, used by the SEO content test. */
export function pageWordCount(page: AppealPage): number {
  const parts: string[] = [];

  for (const section of [page.definition, page.commonCauses, page.strategies, page.documentation]) {
    if (section.heading) parts.push(section.heading);
    if (section.intro) parts.push(section.intro);
    for (const paragraph of section.paragraphs ?? []) parts.push(paragraph);
    for (const item of section.items ?? []) parts.push(item.title, item.body);
    for (const bullet of section.bullets ?? []) parts.push(bullet);
  }

  parts.push(page.sampleParagraph.heading, page.sampleParagraph.text, page.sampleParagraph.note);
  for (const faq of page.faqs) parts.push(faq.question, faq.answer);

  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}
