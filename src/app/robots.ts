import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/public-config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/+$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Transactional and account surfaces carry nothing a search engine
        // should index, and some of them are only reachable with a session.
        disallow: ["/api/", "/account", "/account/", "/checkout/", "/login", "/signup", "/reset-password", "/forgot-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
