import { FileText, Lock } from "lucide-react";

/**
 * A miniature of the letter the generator produces, shown beside the hero
 * headline.
 *
 * Purely decorative and purely synthetic - no real claim, no real person, and
 * no data from the visitor's own draft. It exists to answer "what do I
 * actually get?" before the visitor has filled anything in, which the headline
 * alone cannot do. Hidden from assistive technology: the sighted-only content
 * is redundant with the copy beside it.
 */
export function LetterPreviewCard() {
  return (
    <div aria-hidden="true" className="relative select-none">
      {/* Lifted sheet behind, so the card reads as paper rather than a panel. */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[var(--radius-lg)] border border-border/70 bg-card/60" />

      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-md">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <FileText className="size-3.5 text-teal-700" />
          <span className="text-xs font-semibold text-navy-800">Appeal letter</span>
          <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-semibold text-teal-800">
            Draft
          </span>
        </div>

        <div className="space-y-3.5 px-5 py-5 font-serif text-[0.8rem] leading-relaxed text-navy-800">
          <div className="space-y-1 text-[0.75rem] text-muted-foreground">
            <p>Northside Spine and Pain Clinic</p>
            <p>Austin, TX 78703</p>
          </div>

          <p className="font-semibold">
            RE: Formal first-level internal appeal &mdash; Claim 2026&hellip;300
          </p>

          <p>Dear Appeals Reviewer:</p>

          <p>
            This letter is a formal first-level internal appeal of the denial dated March 9, 2026.
            I am requesting that the plan overturn the denial and process the claim at the
            contracted rate.
          </p>

          {/* The paywall, shown honestly rather than hidden until checkout. */}
          <div className="relative pt-1 pb-9">
            <div className="space-y-2.5">
              {["100%", "94%", "98%", "88%", "96%", "60%"].map((width, index) => (
                <span
                  key={index}
                  style={{ width }}
                  className="block h-2 rounded-full bg-navy-100"
                />
              ))}
            </div>
            {/* The fade covers the lower half only, so the hidden lines stay legible as text. */}
            <div className="absolute inset-x-0 bottom-0 flex h-2/3 items-end justify-center bg-gradient-to-t from-card via-card/90 to-transparent">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-sans text-[0.7rem] font-semibold text-muted-foreground shadow-xs">
                <Lock className="size-3" />
                Full letter after unlock
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
