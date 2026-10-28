import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogoMark } from "@/components/layout/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label="AppealForge home">
            <LogoMark className="size-10" />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>

        <p className="mt-5 flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          <span>Accounts hold billing details only - never letters or claim information.</span>
        </p>
      </div>
    </div>
  );
}
