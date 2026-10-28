import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DenialPage } from "@/components/seo/denial-page";
import { getAppealPage } from "@/content/appeal-pages";
import { getOptionalSession } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";

const SLUG = "out-of-network-denial-appeal-letter";

export function generateMetadata(): Metadata {
  const page = getAppealPage(SLUG);
  if (!page) return {};

  return pageMetadata({
    title: page.seoTitle,
    description: page.metaDescription,
    path: `/${page.slug}`,
    type: "article",
  });
}

export default async function Page() {
  const page = getAppealPage(SLUG);
  if (!page) notFound();

  const session = await getOptionalSession();
  return <DenialPage page={page} signedIn={Boolean(session)} />;
}
