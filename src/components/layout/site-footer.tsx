import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { footerNav, siteConfig } from "@/lib/public-config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-7" />
              <span className="font-display text-base font-semibold">{siteConfig.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Appeal letters for denied US medical claims, drafted from your own denial details and
              clinical notes.
            </p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-px size-4 shrink-0 text-success" aria-hidden="true" />
              <span>Claim details and letters are not stored on our servers.</span>
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-display text-sm font-semibold text-foreground">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            The letters produced here are drafts for review. They may contain errors or omissions
            and must be checked by a qualified person before submission. {siteConfig.name} does not
            provide legal advice, does not guarantee coverage, and does not guarantee that an appeal
            will be approved.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
