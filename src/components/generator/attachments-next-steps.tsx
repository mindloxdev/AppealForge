"use client";

import { CheckCircle2, Circle, ListChecks, Milestone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDenialReason, enclosureLabel } from "@/content/denial-reasons";

const GENERAL_NEXT_STEPS = [
  "Review every factual statement in the letter.",
  "Replace all remaining bracketed placeholders.",
  "Confirm the insurer's appeal deadline and submission instructions on your denial notice.",
  "Attach the relevant supporting documentation.",
  "Keep a copy of the appeal and proof of submission.",
  "Request a peer-to-peer review where the denial is clinical and the plan offers one.",
  "Check the insurer's requirements for external review if the internal appeal is denied.",
];

export function AttachmentsAndNextSteps({
  denialReasonKey,
  selectedEnclosures,
}: {
  denialReasonKey: string;
  selectedEnclosures: string[];
}) {
  const reason = getDenialReason(denialReasonKey);
  const selected = new Set(selectedEnclosures.map((value) => enclosureLabel(value)));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="size-5 text-navy-600" aria-hidden="true" />
            What to attach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {(reason?.attachChecklist ?? []).map((item) => {
              const checked = selected.has(item);
              return (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  {checked ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                  )}
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                    {item}
                    {checked ? <span className="sr-only"> (you selected this)</span> : null}
                  </span>
                </li>
              );
            })}

            {Array.from(selected)
              .filter((label) => !(reason?.attachChecklist ?? []).includes(label))
              .map((label) => (
                <li key={label} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
          </ul>

          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            Not every item is required for every appeal. What belongs in the envelope depends on the
            denial, the payer&apos;s requirements, and the appeal process that applies to the plan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Milestone className="size-5 text-navy-600" aria-hidden="true" />
            Next steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2.5">
            {GENERAL_NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.7rem] font-semibold text-navy-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {reason ? (
            <div className="mt-4 rounded-[var(--radius)] border border-teal-200 bg-accent-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                For a {reason.short.toLowerCase()} denial
              </p>
              <ul className="mt-2 space-y-2">
                {reason.nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-sm text-teal-900">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-700" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            We never invent a deadline or a mailing address. The letter carries
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
              [VERIFY APPEAL DEADLINE]
            </code>
            and
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
              [INSURER APPEALS ADDRESS]
            </code>
            style placeholders for you to confirm from your own denial notice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
