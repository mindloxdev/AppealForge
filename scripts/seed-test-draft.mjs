// Creates a sealed draft plus a PAID purchase row, so the browser can exercise
// the real unlock and download endpoints without calling the model or Stripe.
//
//   npx tsx scripts/seed-test-draft.mjs
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { newDraftId, sealText } from "../src/lib/security/entitlement.ts";
import { splitLetter, lockedShape } from "../src/lib/privacy/letter-split.ts";
import { findPlaceholders, countWords } from "../src/lib/ai/validate-output.ts";

process.loadEnvFile(".env");

const letter = [
  "Jane Smith, MD\nNorthside Spine and Pain Clinic\n1200 West 6th Street, Suite 310\nAustin, TX 78703\n(512) 555-0142",
  "October 28, 2026",
  "Aetna\nNational Appeals Unit\n[INSURER APPEALS ADDRESS]",
  "RE: Formal first-level internal appeal - Patient: John A. Doe; DOB: 05/06/1974; Member ID: W1234567801; Claim #: 2026074512300; Date of service: March 2, 2026; CPT: 72148; ICD-10: M54.16; Denial reason: not medically necessary (CO-50); Denial dated: March 9, 2026",
  "Dear Appeals Reviewer:",
  "This letter is a formal first-level internal appeal of the denial dated March 9, 2026 of claim 2026074512300 for magnetic resonance imaging of the lumbar spine without contrast, performed on March 2, 2026. I am requesting that the plan overturn the denial and process the claim for payment at the contracted rate.",
  "Mr. Doe is a 52-year-old man with chronic lumbar radiculopathy documented since 2023, with a prior L4-L5 microdiscectomy in 2019. He reports left-sided radicular pain rated 7 of 10 that has persisted for fourteen weeks, with numbness in the L5 distribution. On examination of February 24, 2026 there was 4 of 5 weakness of the extensor hallucis longus, a progression from the examination of January 12, 2026. He is unable to sit for longer than twenty minutes or complete a full work shift.",
  "Conservative management has been attempted and has failed. He completed twelve weeks of supervised physical therapy between November 2025 and February 2026, maximum-tolerated nonsteroidal anti-inflammatory therapy, and two transforaminal epidural steroid injections on December 8, 2025 and January 19, 2026, each producing less than two weeks of relief.",
  "Advanced imaging is required to characterize the compressive lesion before surgical referral, consistent with [CITE APPLICABLE CLINICAL GUIDELINE]. Deferring imaging leaves a patient with documented, progressive motor deficit without a surgical plan. I therefore request that the plan overturn this denial and pay the claim, and that any further adverse determination be made only after a peer-to-peer review with a board-certified physician in the same specialty. Please also provide the clinical criteria and the reviewer credentials relied upon, and confirm the deadline and address for external review.",
  "Enclosures:\n- Denial letter and explanation of benefits dated March 9, 2026\n- Office notes dated January 12, 2026 and February 24, 2026\n- Physical therapy discharge summary\n- Injection procedure notes\n- Itemized claim",
  "Sincerely,\n\n\nJane Smith, MD\nNorthside Spine and Pain Clinic\nNPI [PROVIDER NPI]\n(512) 555-0142",
].join("\n\n");

const draftId = newDraftId();
const { preview, locked, lockedBlocks } = splitLetter(letter);
const sealed = await sealText(draftId, locked);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.purchase.create({
  data: {
    draftId,
    stripeSessionId: `cs_test_browser_${Date.now()}`,
    amountTotal: 1200,
    currency: "usd",
    status: "PAID",
    paidAt: new Date(),
  },
});
await prisma.$disconnect();

const payload = {
  ok: true,
  draftId,
  preview,
  sealed,
  shape: lockedShape(lockedBlocks),
  wordCount: countWords(letter),
  placeholders: findPlaceholders(letter),
  notes: [],
  free: { remaining: 2 },
};

writeFileSync(
  "scripts/.test-draft.json",
  JSON.stringify({ payload, lockedPlain: locked }, null, 2),
  "utf8",
);

console.log(`seeded paid draft ${draftId}`);
console.log(`preview blocks: ${preview.split("\n\n").length}, locked blocks: ${lockedBlocks.length}`);
