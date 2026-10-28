import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPEAL_PAGES } from "@/content/appeal-pages";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <FileQuestion className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl font-bold">That page does not exist</h1>
        <p className="mt-3 text-base text-muted-foreground">
          The link may be old or mistyped. If you were in the middle of a letter, it is still in the
          tab you were writing it in - drafts are not stored on our side, so nothing is lost unless
          that tab is closed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="accent">
            <Link href="/#generator">Start an appeal letter</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/denial-reasons">Browse denial reasons</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Popular guides
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {APPEAL_PAGES.slice(0, 6).map((page) => (
            <li key={page.slug}>
              <Link
                href={`/${page.slug}`}
                className="block rounded-[var(--radius)] border border-border bg-card p-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {page.h1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
