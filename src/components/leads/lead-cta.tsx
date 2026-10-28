"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { siteConfig } from "@/lib/public-config";
import { ApiClientError, postJson } from "@/lib/client/draft";
import { cn } from "@/lib/utils";

interface LeadFormValues {
  name: string;
  organization: string;
  email: string;
  phone: string;
  monthlyClaimVolume: string;
  primaryChallenge: string;
  consent: boolean;
  company: string;
}

export function LeadCta({
  variant = "band",
  className,
  sourcePath,
}: {
  variant?: "band" | "panel";
  className?: string;
  sourcePath?: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const company = siteConfig.billingCompany.name;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    defaultValues: {
      name: "",
      organization: "",
      email: "",
      phone: "",
      monthlyClaimVolume: "",
      primaryChallenge: "",
      consent: false,
      company: "",
    },
  });

  const consent = watch("consent");

  async function onSubmit(values: LeadFormValues) {
    setServerError(null);
    if (!values.consent) {
      setServerError("Please confirm you agree to be contacted.");
      return;
    }
    try {
      await postJson("/api/leads", {
        ...values,
        sourcePath: sourcePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
      });
      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : "That did not send. Please try again in a moment.",
      );
    }
  }

  return (
    <section
      id="billing-services"
      className={cn(
        "overflow-hidden rounded-[var(--radius-xl)] bg-navy-800 text-navy-50",
        variant === "band" ? "px-5 py-9 sm:px-10 sm:py-10" : "p-5 sm:p-6",
        className,
      )}
    >
      <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-300">
            Medical billing services
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
            Tired of Fighting Denials?
          </h2>
          <p className="mt-3 max-w-prose text-[0.95rem] leading-relaxed text-navy-100">
            Let {company} help your practice manage claim denials, appeals, and revenue cycle
            workflows.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-navy-100">
            {[
              "Denial work queues worked daily, not weekly",
              "Appeals prepared, tracked and followed up with the payer",
              "Clean resubmissions and corrected claims",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-navy-200">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
            <span>
              Contact details only. Never send patient names, claim numbers or clinical information
              through this form.
            </span>
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-card p-5 text-foreground shadow-lg sm:p-6">
          {submitted ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">Thank you - request received</h3>
              <p className="text-sm text-muted-foreground">
                A specialist will reach out using the details you provided. If it is urgent, call
                the number on your statement or reply to the confirmation email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Talk to our billing team</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us where to reach you and we will set up a consultation.
                </p>
              </div>

              {serverError ? (
                <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-destructive-soft px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="lead-name" label="Name" error={errors.name?.message}>
                  {(props) => (
                    <Input
                      {...props}
                      {...register("name", {
                        required: "Enter your name.",
                        minLength: { value: 2, message: "Enter your name." },
                      })}
                      autoComplete="name"
                    />
                  )}
                </Field>

                <Field
                  id="lead-organization"
                  label="Practice or organization"
                  optional
                  error={errors.organization?.message}
                >
                  {(props) => (
                    <Input {...props} {...register("organization")} autoComplete="organization" />
                  )}
                </Field>

                <Field id="lead-email" label="Work email" error={errors.email?.message}>
                  {(props) => (
                    <Input
                      {...props}
                      {...register("email", {
                        required: "Enter a work email address.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
                          message: "Enter a valid email address.",
                        },
                      })}
                      type="email"
                      autoComplete="email"
                    />
                  )}
                </Field>

                <Field id="lead-phone" label="Phone" optional error={errors.phone?.message}>
                  {(props) => <Input {...props} {...register("phone")} type="tel" autoComplete="tel" />}
                </Field>

                <Field
                  id="lead-volume"
                  label="Monthly claim volume"
                  optional
                  error={errors.monthlyClaimVolume?.message}
                >
                  {(props) => (
                    <Input {...props} {...register("monthlyClaimVolume")} placeholder="e.g. 800" />
                  )}
                </Field>

                <Field
                  id="lead-challenge"
                  label="Primary billing challenge"
                  optional
                  className="sm:col-span-2"
                  error={errors.primaryChallenge?.message}
                >
                  {(props) => (
                    <Textarea
                      {...props}
                      {...register("primaryChallenge")}
                      rows={2}
                      placeholder="Medical necessity denials from one payer keep coming back."
                    />
                  )}
                </Field>
              </div>

              {/* Honeypot: visually hidden, never announced. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                <label htmlFor="lead-company">Company</label>
                <input id="lead-company" tabIndex={-1} autoComplete="off" {...register("company")} />
              </div>

              <label
                htmlFor="lead-consent"
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground"
              >
                <Checkbox
                  id="lead-consent"
                  checked={consent}
                  onCheckedChange={(value) =>
                    setValue("consent", value === true, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <span>
                  I agree to be contacted about medical billing services using the details above,
                  and I understand this form is not for patient or claim information.
                </span>
              </label>

              <Button
                type="submit"
                variant="accent"
                block
                size="lg"
                loading={isSubmitting}
              >
                <Phone aria-hidden="true" />
                Talk to our billing team
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Prefer email? Request a consultation and we will reply within one business day.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
