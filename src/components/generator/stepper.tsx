"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 1, label: "Denial Details", short: "Denial" },
  { id: 2, label: "Clinical Information", short: "Clinical" },
  { id: 3, label: "Parties & Documents", short: "Parties" },
] as const;

export function Stepper({
  current,
  furthest,
  onSelect,
}: {
  current: number;
  furthest: number;
  onSelect: (step: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="w-full">
      {/* On phones the per-step caption would wrap, so the count is stated once. */}
      <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground sm:hidden">
        Step {current} of {STEPS.length}
      </p>
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          const reachable = step.id <= furthest;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => reachable && onSelect(step.id)}
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius)] px-2 py-2 text-left transition-colors sm:px-3",
                  reachable ? "cursor-pointer hover:bg-secondary" : "cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-success bg-success-soft text-success",
                    active && "border-accent bg-accent text-accent-foreground",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : step.id}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.short}</span>
                  </span>
                </span>
              </button>

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px flex-1 transition-colors sm:block",
                    done ? "bg-success/40" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
