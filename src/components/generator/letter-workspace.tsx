"use client";

import * as React from "react";
import {
  Copy,
  Download,
  FileText,
  Lock,
  Pencil,
  RefreshCw,
  RotateCcw,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/public-config";
import { cn } from "@/lib/utils";
import { greekParagraph, paragraphsOf, type DraftState } from "@/lib/client/draft";

interface LetterWorkspaceProps {
  draft: DraftState;
  unlocked: boolean;
  busy: { checkout: boolean; regenerate: boolean; download: "docx" | "pdf" | null; unlock: boolean };
  onCheckout: (plan: "single" | "monthly") => void;
  onRegenerate: () => void;
  onStartOver: () => void;
  onDownload: (format: "docx" | "pdf") => void;
  onEdit: (letter: string) => void;
}

export function LetterWorkspace({
  draft,
  unlocked,
  busy,
  onCheckout,
  onRegenerate,
  onStartOver,
  onDownload,
  onEdit,
}: LetterWorkspaceProps) {
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const letter = draft.fullLetter ?? draft.preview;
  const previewParagraphs = React.useMemo(
    () => paragraphsOf(unlocked ? letter : draft.preview),
    [unlocked, letter, draft.preview],
  );

  const copy = async () => {
    if (!unlocked) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      toast.success("Letter copied to your clipboard.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Your browser blocked the clipboard. Select the letter and copy manually.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-navy-600" aria-hidden="true" />
            <h2 className="font-display text-base font-semibold">Your draft appeal letter</h2>
          </div>
          {unlocked ? (
            <Badge variant="success">
              <Check aria-hidden="true" /> Unlocked
            </Badge>
          ) : (
            <Badge variant="warning">
              <Lock aria-hidden="true" /> Preview
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {draft.wordCount} words
          </span>
        </div>

        {/* A grid on phones: five ragged wrapped buttons read as a mistake,
            and two even columns give a comfortable tap target each. */}
        <div className="grid grid-cols-2 gap-2 border-b border-border px-5 py-3 sm:flex sm:flex-wrap sm:items-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={copy}
            disabled={!unlocked}
            title={unlocked ? undefined : "Unlock the letter to copy it"}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing((value) => !value)}
            disabled={!unlocked}
            aria-pressed={editing}
          >
            <Pencil aria-hidden="true" />
            {editing ? "Done editing" : "Edit letter"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            loading={busy.regenerate}
          >
            <RefreshCw aria-hidden="true" />
            Regenerate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDownload("docx")}
            disabled={!unlocked || busy.download !== null}
            loading={busy.download === "docx"}
          >
            <Download aria-hidden="true" />
            Word (.docx)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={unlocked ? "accent" : "outline"}
            onClick={() => onDownload("pdf")}
            disabled={!unlocked || busy.download !== null}
            loading={busy.download === "pdf"}
          >
            <Download aria-hidden="true" />
            PDF
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onStartOver}
            className="col-span-2 sm:col-auto sm:ml-auto"
          >
            <RotateCcw aria-hidden="true" />
            Start a new appeal
          </Button>
        </div>

        {editing && unlocked ? (
          <div className="p-5">
            <label htmlFor="letter-editor" className="text-sm font-medium">
              Edit your letter
            </label>
            <p className="mb-2 mt-1 text-xs text-muted-foreground">
              Your edits are used for both downloads. Nothing you type here is sent anywhere until
              you download.
            </p>
            <Textarea
              id="letter-editor"
              value={letter}
              onChange={(event) => onEdit(event.target.value)}
              rows={24}
              className="letter-type min-h-[32rem] text-[0.95rem]"
            />
          </div>
        ) : (
          <div className="relative">
            <div
              className={cn(
                "letter-type mx-auto max-w-[46rem] px-6 py-8 sm:px-10 sm:py-12",
                !unlocked && "pb-4",
              )}
              aria-live="polite"
            >
              {previewParagraphs.map((block, index) => (
                <p key={`${index}-${block.slice(0, 12)}`} className="mb-[1.05em] last:mb-0">
                  {block.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {lineIndex > 0 ? <br /> : null}
                      {line}
                    </React.Fragment>
                  ))}
                </p>
              ))}

              {!unlocked
                ? draft.shape.map((paragraph, index) => (
                    <p
                      key={`locked-${index}`}
                      aria-hidden="true"
                      className="mb-[1.05em] select-none blur-[4.5px]"
                    >
                      {greekParagraph(paragraph.words, index * 31 + 11)}
                    </p>
                  ))
                : null}
            </div>

            {!unlocked ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-card"
                />
                <p className="sr-only">
                  The rest of this letter is locked until it is unlocked with a purchase or a plan.
                </p>
              </>
            ) : null}
          </div>
        )}

        {!unlocked ? (
          <div className="border-t border-border bg-secondary/40 px-5 py-6 sm:px-8">
            <h3 className="font-display text-lg font-semibold">Unlock the full letter</h3>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              The draft is finished. Unlock it to read the argument, the specific request, the
              enclosures list and the signature block - and to edit and download it as PDF or Word.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {siteConfig.pricing.single.name}
                </span>
                <span className="mt-1 font-display text-2xl font-bold">
                  {siteConfig.pricing.single.priceLabel}
                </span>
                <span className="text-xs text-muted-foreground">one-time, this letter</span>
                <p className="mt-2 text-sm text-muted-foreground">
                  Full letter, editing, and both downloads for the draft on this screen.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  block
                  onClick={() => onCheckout("single")}
                  loading={busy.checkout}
                >
                  Unlock this letter
                </Button>
              </div>

              <div className="flex flex-col rounded-[var(--radius)] border-2 border-accent bg-card p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {siteConfig.pricing.monthly.name}
                </span>
                <span className="mt-1 font-display text-2xl font-bold">
                  {siteConfig.pricing.monthly.priceLabel}
                  <span className="text-sm font-medium text-muted-foreground"> / month</span>
                </span>
                <span className="text-xs text-muted-foreground">cancel any time</span>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlimited letters and downloads, subject to the published fair-use limits.
                </p>
                <Button
                  type="button"
                  variant="accent"
                  className="mt-4"
                  block
                  onClick={() => onCheckout("monthly")}
                  loading={busy.checkout}
                >
                  Start the monthly plan
                </Button>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Payment is handled by Stripe. Checkout opens in a new tab so this draft stays on
              screen - the letter is never stored on our servers, so keeping this tab open is what
              keeps it alive.
            </p>
            {busy.unlock ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-accent">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Waiting for payment confirmation...
              </p>
            ) : null}
          </div>
        ) : (
          <div className="border-t border-border bg-success-soft px-5 py-4">
            <p className="flex items-start gap-2 text-sm text-success">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Unlocked. Download or copy it now - closing this tab discards the letter, and we
                keep no copy to restore.
              </span>
            </p>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <div>
            <AlertTitle>Review before you send</AlertTitle>
            <AlertDescription>
              This is a draft. Check every factual statement, and have the treating clinician review
              and sign anything clinical.
            </AlertDescription>
          </div>
        </Alert>

        {draft.placeholders.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Placeholders to fill in</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                The letter marks every fact it did not have. Replace each one before sending.
              </p>
              <ul className="space-y-1.5">
                {draft.placeholders.map((placeholder) => (
                  <li key={placeholder} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {placeholder}
                    </code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {draft.notes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Worth checking</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {draft.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <Separator />
      </div>
    </div>
  );
}
