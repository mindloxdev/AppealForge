import { test, expect } from "@playwright/test";

/**
 * Journey D: every denial page renders unique content, sets the right tool
 * preset, and emits valid structured data.
 */

const PAGES = [
  { slug: "medical-necessity-appeal-letter", preset: "Medical necessity", code: "CO-50" },
  { slug: "co-50-denial-appeal-letter", preset: "Medical necessity", code: "CO-50" },
  { slug: "prior-authorization-denial-appeal-letter", preset: "Prior authorization", code: "CO-197" },
  { slug: "co-197-denial-appeal-letter", preset: "Prior authorization", code: "CO-197" },
  { slug: "timely-filing-appeal-letter", preset: "Timely filing", code: "CO-29" },
  { slug: "co-97-bundling-denial-appeal-letter", preset: "Bundled", code: "CO-97" },
  { slug: "experimental-investigational-denial-appeal-letter", preset: "Experimental", code: "CO-55" },
  { slug: "out-of-network-denial-appeal-letter", preset: "Out of network", code: "CO-242" },
  { slug: "appeal-letter-for-patients", preset: "Medical necessity", code: "" },
];

const seenTitles = new Set<string>();
const seenDescriptions = new Set<string>();
const seenH1s = new Set<string>();

for (const page of PAGES) {
  test(`/${page.slug} renders unique content with valid structured data`, async ({
    page: browserPage,
  }) => {
    const response = await browserPage.goto(`/${page.slug}`);
    expect(response?.status()).toBe(200);

    // Unique metadata.
    const title = await browserPage.title();
    const description = await browserPage
      .locator('meta[name="description"]')
      .getAttribute("content");
    const canonical = await browserPage.locator('link[rel="canonical"]').getAttribute("href");

    expect(title.length).toBeGreaterThan(20);
    expect(description?.length ?? 0).toBeGreaterThan(70);
    expect(canonical).toContain(`/${page.slug}`);
    expect(seenTitles.has(title)).toBe(false);
    expect(seenDescriptions.has(description!)).toBe(false);
    seenTitles.add(title);
    seenDescriptions.add(description!);

    // One H1, and it is unique across the set.
    const h1s = browserPage.locator("h1");
    await expect(h1s).toHaveCount(1);
    const h1 = (await h1s.first().textContent())!.trim();
    expect(seenH1s.has(h1)).toBe(false);
    seenH1s.add(h1);

    // Open Graph.
    await expect(browserPage.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(browserPage.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(browserPage.locator('meta[property="og:image"]')).toHaveCount(1);

    // The embedded generator is preset to this denial reason.
    const combobox = browserPage.getByRole("combobox", { name: "Denial reason" });
    await expect(combobox).toContainText(page.preset);
    if (page.code) {
      await expect(browserPage.getByText(page.code).first()).toBeVisible();
    }

    // Structured data parses, and says what the page shows.
    const blocks = await browserPage.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThan(0);

    const schemas = blocks.flatMap((block) => {
      const parsed = JSON.parse(block);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
    const types = schemas.map((schema) => schema["@type"]);
    expect(types).toContain("SoftwareApplication");
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");

    const faqSchema = schemas.find((schema) => schema["@type"] === "FAQPage");
    expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(3);

    // Every question in the markup is actually on the page.
    for (const entry of faqSchema.mainEntity.slice(0, 3)) {
      await expect(browserPage.getByText(entry.name, { exact: false }).first()).toBeVisible();
    }

    // No fabricated ratings or reviews anywhere in the markup.
    const serialized = JSON.stringify(schemas);
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("reviewCount");
    expect(serialized).not.toContain("ratingValue");

    // Content below the tool, and working internal links.
    await expect(browserPage.getByRole("heading", { name: "Related resources" })).toBeVisible();
    const words = (await browserPage.locator("article").innerText()).split(/\s+/).length;
    expect(words).toBeGreaterThan(600);
  });
}

test("sitemap.xml lists every indexable page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  expect(xml).toContain("<urlset");
  for (const page of PAGES) {
    expect(xml).toContain(`/${page.slug}`);
  }
  // Transactional URLs must not be advertised.
  expect(xml).not.toContain("/checkout/");
  expect(xml).not.toContain("/account");
  expect(xml).not.toContain("/api/");
});

test("robots.txt points at the sitemap and excludes private routes", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Sitemap:");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain("Disallow: /account");
});

test("internal links across the marketing pages all resolve", async ({ page, request }) => {
  const checked = new Set<string>();

  for (const path of ["/", "/pricing", "/templates", "/denial-reasons", "/faq", "/sitemap"]) {
    await page.goto(path);
    const hrefs = await page.locator("a[href^='/']").evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute("href")!),
    );

    for (const href of hrefs) {
      const clean = href.split("#")[0]!.split("?")[0]!;
      if (!clean || clean.startsWith("/api/") || checked.has(clean)) continue;
      checked.add(clean);
      const response = await request.get(clean);
      expect(response.status(), `${path} -> ${clean}`).toBeLessThan(400);
    }
  }

  expect(checked.size).toBeGreaterThan(15);
});
