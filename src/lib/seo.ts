import type { Metadata } from "next";

/**
 * Page metadata builder.
 *
 * Next replaces the parent `openGraph` object wholesale when a page defines its
 * own, so any page that sets one has to restate the image. Centralising that
 * here is what stops a page from silently losing its social card - a defect the
 * end-to-end SEO spec checks for.
 */
export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const { title, description, path, type = "website" } = input;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
