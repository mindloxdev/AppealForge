"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileText, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { LetterTemplate } from "@/content/templates";

export function TemplateLibrary({ templates }: { templates: LetterTemplate[] }) {
  const [query, setQuery] = React.useState("");

  const matches = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((template) =>
      [template.title, template.useCase, template.description, ...template.codes, ...template.searchTerms]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, templates]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <Label htmlFor="template-search">Search templates</Label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="template-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="medical necessity, CO-197, timely filing"
              className="pl-9"
              type="search"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {matches.length} of {templates.length} templates
        </p>
      </div>

      {matches.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius)] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No template matches that search. Try a denial code, or use the general insurance appeal
          template.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((template) => (
            <li
              key={template.slug}
              className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <FileText className="size-4 text-navy-600" aria-hidden="true" />
                {template.codes.map((code) => (
                  <Badge key={code} variant="neutral" className="font-mono">
                    {code}
                  </Badge>
                ))}
                {template.voice === "patient" ? <Badge variant="accent">Patient voice</Badge> : null}
              </div>

              <h3 className="mt-3 font-display text-base font-semibold">{template.title}</h3>
              <p className="mt-1 text-sm font-medium text-foreground/80">{template.useCase}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {template.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`/api/templates/${template.slug}?format=docx`} download>
                    <Download aria-hidden="true" />
                    Word
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`/api/templates/${template.slug}?format=pdf`} download>
                    <Download aria-hidden="true" />
                    PDF
                  </a>
                </Button>
                <Button asChild size="sm" variant="ghost" className="ml-auto">
                  <Link href="/#generator">
                    <Sparkles aria-hidden="true" />
                    Generate instead
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
