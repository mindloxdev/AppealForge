// Reports the word count of each denial page's content - everything beneath the
// hero and the generator. The spec's band is 700 to 1,000 words.
//
//   npx tsx scripts/count-page-words.mjs
import { APPEAL_PAGES, pageWordCount } from "../src/content/appeal-pages/index.ts";

let outside = 0;

for (const page of APPEAL_PAGES) {
  const words = pageWordCount(page);
  const status = words < 700 ? "LOW " : words > 1000 ? "HIGH" : "ok  ";
  if (status.trim() !== "ok") outside += 1;
  console.log(`${status} ${String(words).padStart(4)}  ${page.slug}`);
}

console.log(
  outside === 0
    ? `all ${APPEAL_PAGES.length} pages inside 700-1000 words`
    : `${outside} of ${APPEAL_PAGES.length} page(s) outside the band`,
);
process.exitCode = outside === 0 ? 0 : 1;
