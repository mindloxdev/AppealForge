"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * One labelled form control: visible label, optional hint, inline error wired
 * through aria-describedby and aria-invalid. Every input in the generator uses
 * this, so no field can ship with a placeholder as its only label.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
  }) => React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {optional ? (
          <span className="text-xs text-muted-foreground">Optional</span>
        ) : null}
      </div>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Focusable error summary placed at the top of a step after a failed submit.
 * Each entry links to the field that produced it.
 */
export const ErrorSummary = React.forwardRef<
  HTMLDivElement,
  { errors: { id: string; message: string }[]; title?: string }
>(({ errors, title = "There is a problem" }, ref) => {
  if (errors.length === 0) return null;
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-[var(--radius)] border border-red-200 bg-destructive-soft p-4 outline-none"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertCircle className="size-4" aria-hidden="true" />
        {title}
      </p>
      <ul className="mt-2 space-y-1 pl-6 text-sm text-destructive">
        {errors.map((error) => (
          <li key={error.id} className="list-disc">
            <a
              href={`#${error.id}`}
              className="underline underline-offset-2 hover:no-underline"
              onClick={(event) => {
                event.preventDefault();
                const target = document.getElementById(error.id);
                target?.focus();
                target?.scrollIntoView({ block: "center", behavior: "smooth" });
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
ErrorSummary.displayName = "ErrorSummary";
