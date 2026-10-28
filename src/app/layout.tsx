import type { Metadata, Viewport } from "next";
import { Inter, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/lib/public-config";
import { getOptionalSession } from "@/lib/auth/session";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Medical Necessity Appeal Letter Generator | AppealForge",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  keywords: [
    "medical necessity appeal letter",
    "medical insurance appeal letter generator",
    "medical billing denial appeal",
    "CO-50 denial appeal letter",
    "CO-197 denial appeal letter",
    "prior authorization denial appeal letter",
    "timely filing denial appeal letter",
    "insurance appeal letter for patients",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: "Medical Necessity Appeal Letter Generator",
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Necessity Appeal Letter Generator",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getOptionalSession();

  return (
    <html lang="en" className={`${inter.variable} ${figtree.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-md"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader signedIn={Boolean(session)} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "rounded-[var(--radius)] border border-border bg-card text-foreground shadow-md",
            },
          }}
        />
      </body>
    </html>
  );
}
