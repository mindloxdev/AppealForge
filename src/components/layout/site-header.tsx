"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, FileText, LogIn } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/public-config";
import { cn } from "@/lib/utils";

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) =>
    href.startsWith("/#") ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 xl:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive(item.href) && "text-foreground",
              )}
            >
              {item.short}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={signedIn ? "/account" : "/login"}>
              <LogIn aria-hidden="true" />
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </Button>

          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link href="/#generator">
              <FileText aria-hidden="true" />
              Generate an Appeal Letter
            </Link>
          </Button>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/40 animate-fade-in" />
              <Dialog.Content
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card p-6 shadow-lg outline-none"
                aria-describedby={undefined}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-base font-semibold">Menu</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X aria-hidden="true" />
                    </Button>
                  </Dialog.Close>
                </div>

                <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                  {mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-[var(--radius)] px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary",
                        isActive(item.href) && "bg-secondary",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <Button asChild variant="accent" size="lg" block>
                    <Link href="/#generator" onClick={() => setOpen(false)}>
                      Generate an Appeal Letter
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" block>
                    <Link
                      href={signedIn ? "/account" : "/login"}
                      onClick={() => setOpen(false)}
                    >
                      {signedIn ? "Account" : "Sign in"}
                    </Link>
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
