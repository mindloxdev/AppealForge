import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-[var(--radius)] border p-4 text-sm [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:mt-0.5",
  {
    variants: {
      variant: {
        info: "border-border bg-secondary/70 text-foreground [&_svg]:text-navy-600",
        accent: "border-teal-200 bg-accent-soft text-teal-900 [&_svg]:text-teal-700",
        success: "border-emerald-200 bg-success-soft text-success [&_svg]:text-success",
        warning: "border-amber-200 bg-warning-soft text-warning [&_svg]:text-warning",
        destructive: "border-red-200 bg-destructive-soft text-destructive [&_svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("font-semibold leading-snug", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm leading-relaxed opacity-90", className)} {...props} />;
}
