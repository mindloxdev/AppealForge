import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/public-config";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label={`${siteConfig.name} logo`}
    >
      <path
        d="M16 2.2 28.5 6.3v8.9c0 7.4-5 12.9-12.5 14.6C8.5 28.1 3.5 22.6 3.5 15.2V6.3L16 2.2Z"
        fill="var(--navy-800)"
      />
      <path
        d="M11.4 9.4h6.1l4 4v9.2a.9.9 0 0 1-.9.9h-9.2a.9.9 0 0 1-.9-.9V10.3a.9.9 0 0 1 .9-.9Z"
        fill="#ffffff"
        fillOpacity="0.92"
      />
      <path
        d="m12.8 17.6 2.4 2.4 5-5.6"
        fill="none"
        stroke="var(--teal-600)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md text-[1.0625rem] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-85",
        className,
      )}
    >
      <LogoMark />
      <span className="font-display">{siteConfig.name}</span>
    </Link>
  );
}
