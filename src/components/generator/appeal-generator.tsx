"use client";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorSummary } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/generator/stepper";
import { StepDenial } from "@/components/generator/step-denial";
import { StepClinical } from "@/components/generator/step-clinical";
import { StepParties } from "@/components/generator/step-parties";
import { LetterWorkspace } from "@/components/generator/letter-workspace";
import { AttachmentsAndNextSteps } from "@/components/generator/attachments-next-steps";
import {
  appealFormSchema,
  emptyAppealForm,
  STEP_FIELDS,
  type AppealFormValues,
} from "@/lib/validation/appeal";
import {
  ApiClientError,
  joinLetter,
  postJson,
  unsealLetter,
  UNLOCK_CHANNEL,
  type DraftState,
  type UnlockBroadcast,
} from "@/lib/client/draft";
import type { DenialReasonKey } from "@/content/denial-reasons";

interface GenerateResponse {
  draftId: string;
  preview: string;
  sealed: { iv: string; ciphertext: string };
  shape: { words: number }[];
  wordCount: number;
  placeholders: string[];
  notes: string[];
  free: { remaining: number | null };
  key?: string;
}

type Phase = "form" | "generating" | "result";

export function AppealGenerator({
  presetDenialReason,
  signedIn = false,
}: {
  presetDenialReason?: DenialReasonKey;
  signedIn?: boolean;
}) {
  const form = useForm<AppealFormValues>({
    resolver: zodResolver(appealFormSchema) as never,
    defaultValues: {
      ...emptyAppealForm,
      ...(presetDenialReason ? { denialReason: presetDenialReason } : {}),
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [step, setStep] = React.useState(1);
  const [furthest, setFurthest] = React.useState(1);
  const [phase, setPhase] = React.useState<Phase>("form");
  const [draft, setDraft] = React.useState<DraftState | null>(null);
  const [stepErrors, setStepErrors] = React.useState<{ id: string; message: string }[]>([]);
  const [freeRemaining, setFreeRemaining] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState({
    checkout: false,
    regenerate: false,
    download: null as "docx" | "pdf" | null,
    unlock: false,
  });

  const summaryRef = React.useRef<HTMLDivElement>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const unlocked = Boolean(draft?.fullLetter);

  // A draft only exists in this tab's memory. Warn before it is thrown away.
  React.useEffect(() => {
    const dirty = form.formState.isDirty || draft !== null;
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.formState.isDirty, draft]);

  // The checkout tab broadcasts the key back here when payment is confirmed.
  React.useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(UNLOCK_CHANNEL);

    channel.onmessage = async (event: MessageEvent<UnlockBroadcast>) => {
      const message = event.data;
      if (!message?.draftId || !message.key) return;

      setDraft((current) => {
        if (!current || current.draftId !== message.draftId) return current;
        void applyKey(current, message.key, message.entitlement);
        return current;
      });
    };

    return () => channel.close();
  }, []);

  async function applyKey(current: DraftState, key: string, entitlement: string) {
    try {
      const locked = await unsealLetter(key, current.sealed);
      setBusy((value) => ({ ...value, unlock: false, checkout: false }));
      setDraft({
        ...current,
        key,
        entitlement,
        fullLetter: joinLetter(current.preview, locked),
      });
      toast.success("Payment confirmed. Your full letter is unlocked.");
    } catch {
      toast.error("We could not open the unlocked letter. Please regenerate it.");
    }
  }

  function collectStepErrors(target: number) {
    const fields = STEP_FIELDS[target as 1 | 2 | 3] ?? [];
    const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
    return fields
      .map((field) => {
        const message = errors[field as string]?.message;
        return message ? { id: String(field), message } : null;
      })
      .filter((entry): entry is { id: string; message: string } => entry !== null);
  }

  async function goToStep(target: number) {
    if (target <= step) {
      setStep(target);
      setStepErrors([]);
      return;
    }

    const fields = STEP_FIELDS[step as 1 | 2 | 3] ?? [];
    const valid = await form.trigger(fields as never, { shouldFocus: false });
    if (!valid) {
      const errors = collectStepErrors(step);
      setStepErrors(errors);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStepErrors([]);
    setStep(target);
    setFurthest((value) => Math.max(value, target));
  }

  async function submit(values: AppealFormValues) {
    setPhase("generating");
    setStepErrors([]);

    try {
      const response = await postJson<GenerateResponse>("/api/generate-letter", {
        form: values,
        ...(draft?.draftId ? { draftId: draft.draftId } : {}),
        ...(draft?.entitlement ? { entitlement: draft.entitlement } : {}),
      });

      const next: DraftState = {
        draftId: response.draftId,
        preview: response.preview,
        sealed: response.sealed,
        shape: response.shape,
        wordCount: response.wordCount,
        placeholders: response.placeholders,
        notes: response.notes,
        denialReason: String(values.denialReason),
      };

      setFreeRemaining(response.free?.remaining ?? null);

      if (response.key) {
        const locked = await unsealLetter(response.key, response.sealed);
        next.key = response.key;
        next.entitlement = draft?.entitlement;
        next.fullLetter = joinLetter(response.preview, locked);
      }

      setDraft(next);
      setPhase("result");
      window.requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (error) {
      setPhase("form");
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message, {
        description:
          error instanceof ApiClientError && error.code.startsWith("ai_")
            ? "Nothing was charged for this attempt."
            : undefined,
      });
    }
  }

  async function startCheckout(plan: "single" | "monthly") {
    if (!draft) return;
    if (plan === "monthly" && !signedIn) {
      toast.info("Create a free account first", {
        description: "The monthly plan needs an account so you can manage and cancel it.",
        action: { label: "Sign up", onClick: () => window.open("/signup", "_blank") },
      });
      return;
    }

    setBusy((value) => ({ ...value, checkout: true }));

    // Opened synchronously so the browser treats it as part of the click, which
    // keeps this tab - and the only copy of the draft - alive.
    const paymentTab = window.open("", "_blank");

    try {
      const response = await postJson<{ url: string }>("/api/create-checkout-session", {
        plan,
        draftId: draft.draftId,
      });

      const url = `${response.url}`;
      if (paymentTab && !paymentTab.closed) {
        paymentTab.location.href = url;
        setBusy((value) => ({ ...value, unlock: true }));
      } else {
        // Popup blocked: hand the user a link instead of navigating this tab away.
        toast.info("Your browser blocked the payment tab", {
          description: "Open checkout in a new tab to keep this draft on screen.",
          duration: 20000,
          action: { label: "Open checkout", onClick: () => window.open(url, "_blank") },
        });
        setBusy((value) => ({ ...value, checkout: false }));
      }
    } catch (error) {
      paymentTab?.close();
      setBusy((value) => ({ ...value, checkout: false, unlock: false }));
      toast.error(
        error instanceof ApiClientError ? error.message : "Checkout could not be started.",
      );
    }
  }

  async function download(format: "docx" | "pdf") {
    if (!draft?.entitlement || !draft.fullLetter) return;
    setBusy((value) => ({ ...value, download: format }));

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draftId: draft.draftId,
          entitlement: draft.entitlement,
          format,
          letter: draft.fullLetter,
          denialReason: draft.denialReason,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        throw new Error(payload?.error?.message ?? "The download could not be prepared.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? `appeal-letter.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(format === "docx" ? "Word file downloaded." : "PDF downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The download failed.");
    } finally {
      setBusy((value) => ({ ...value, download: null }));
    }
  }

  function startOver() {
    setDraft(null);
    setPhase("form");
    setStep(1);
    setFurthest(1);
    setStepErrors([]);
    form.reset({
      ...emptyAppealForm,
      ...(presetDenialReason ? { denialReason: presetDenialReason } : {}),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const values = form.watch();

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-b from-card to-secondary/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Appeal letter generator</h2>
              <p className="text-sm text-muted-foreground">
                No account needed to try. Claim details are never saved.
              </p>
            </div>
            {freeRemaining !== null ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {freeRemaining} free draft{freeRemaining === 1 ? "" : "s"} left today
              </span>
            ) : null}
          </div>
          <Stepper current={step} furthest={furthest} onSelect={goToStep} />
        </div>

        {phase === "generating" ? (
          <GeneratingState />
        ) : (
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}
              noValidate
              className="px-5 py-6 sm:px-6"
              id="appeal-form"
            >
              {stepErrors.length > 0 ? (
                <div className="mb-6">
                  <ErrorSummary ref={summaryRef} errors={stepErrors} />
                </div>
              ) : null}

              <div hidden={step !== 1}>
                <StepDenial />
              </div>
              <div hidden={step !== 2}>
                <StepClinical />
              </div>
              <div hidden={step !== 3}>
                <StepParties />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => goToStep(step - 1)}>
                    <ArrowLeft aria-hidden="true" />
                    Back
                  </Button>
                ) : null}

                {step < 3 ? (
                  <Button type="button" onClick={() => goToStep(step + 1)} className="ml-auto">
                    Continue
                    <ArrowRight aria-hidden="true" />
                  </Button>
                ) : (
                  <Button type="submit" variant="accent" size="lg" className="ml-auto">
                    <Sparkles aria-hidden="true" />
                    Generate appeal letter
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        )}

        <p className="flex items-start gap-2 border-t border-border bg-secondary/40 px-5 py-3 text-xs leading-relaxed text-muted-foreground sm:px-6">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          <span>
            Your entries are sent once to generate the letter and are then discarded. We do not save
            the form, the letter, or any patient details - which also means a refresh can lose an
            unfinished draft.
          </span>
        </p>
      </Card>

      {draft && phase === "result" ? (
        <div ref={resultRef} className="scroll-mt-24 space-y-8">
          <LetterWorkspace
            draft={draft}
            unlocked={unlocked}
            busy={busy}
            onCheckout={startCheckout}
            onRegenerate={() => {
              setBusy((value) => ({ ...value, regenerate: true }));
              void form.handleSubmit(submit)().finally(() =>
                setBusy((value) => ({ ...value, regenerate: false })),
              );
            }}
            onStartOver={startOver}
            onDownload={download}
            onEdit={(letter) =>
              setDraft((current) => (current ? { ...current, fullLetter: letter } : current))
            }
          />

          <AttachmentsAndNextSteps
            denialReasonKey={draft.denialReason}
            selectedEnclosures={[
              ...(Array.isArray(values.enclosures) ? values.enclosures : []),
              ...(Array.isArray(values.evidenceAvailable) ? values.evidenceAvailable : []),
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function GeneratingState() {
  const [message, setMessage] = React.useState(0);
  const messages = [
    "Reading your denial details",
    "Matching the argument to the denial reason",
    "Drafting the letter",
    "Checking the structure",
  ];

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setMessage((value) => Math.min(value + 1, messages.length - 1)),
      4000,
    );
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="px-5 py-10 sm:px-6" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Loader2 className="size-7 animate-spin text-accent" aria-hidden="true" />
        <p className="mt-4 font-display text-lg font-semibold">{messages[message]}...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes 20 to 40 seconds. Keep this tab open.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-[46rem] space-y-3" aria-hidden="true">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-1/4" />
        <div className="h-3" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <div className="h-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    </div>
  );
}
