import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "border-border bg-secondary text-secondary-foreground",
        accent: "border-teal-200 bg-accent-soft text-teal-800",
        success: "border-emerald-200 bg-success-soft text-success",
        warning: "border-amber-200 bg-warning-soft text-warning",
        destructive: "border-red-200 bg-destructive-soft text-destructive",
        outline: "border-border bg-card text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
