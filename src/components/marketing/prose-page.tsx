import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export interface ProseSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  items?: { title: string; body: string }[];
  table?: { head: string[]; rows: string[][] };
  callout?: string;
}

/**
 * Shared layout for policy and explanatory pages: one column, readable measure,
 * and a table of contents that doubles as in-page navigation.
 */
export function ProsePage({
  title,
  lede,
  updated,
  sections,
  footnote,
}: {
  title: string;
  lede: string;
  updated?: string;
  sections: ProseSection[];
  footnote?: string;
}) {
  return (
    <div className="container-page py-10 lg:py-14">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <article className="max-w-prose">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{lede}</p>
          {updated ? (
            <p className="mt-2 text-xs text-muted-foreground">Last updated: {updated}</p>
          ) : null}

          {sections.map((section) => (
            <section key={section.heading} id={slug(section.heading)} className="mt-10 scroll-mt-24">
              <h2 className="font-display text-xl font-bold">{section.heading}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 28)}
                  className="mt-3 text-[0.975rem] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets ? (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet.slice(0, 28)}
                      className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.items ? (
                <dl className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[var(--radius)] border border-border bg-card p-4"
                    >
                      <dt className="text-sm font-semibold">{item.title}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {section.table ? (
                <div className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {section.table.head.map((cell) => (
                          <th
                            key={cell}
                            scope="col"
                            className="border-b border-border bg-secondary px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>
                          {row.map((cell) => (
                            <td
                              key={cell}
                              className="border-b border-border px-4 py-2.5 align-top text-muted-foreground last:border-b-0"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section.callout ? (
                <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius)] border border-amber-200 bg-warning-soft p-4 text-sm leading-relaxed text-warning">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{section.callout}</span>
                </p>
              ) : null}
            </section>
          ))}

          {footnote ? (
            <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
              {footnote}
            </p>
          ) : null}
        </article>

        <nav aria-label="On this page" className="mt-12 hidden lg:sticky lg:top-24 lg:mt-0 lg:block lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </p>
          <ul className="mt-3 space-y-2 border-l border-border pl-4">
            {sections.map((section) => (
              <li key={section.heading}>
                <Link
                  href={`#${slug(section.heading)}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.heading}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
