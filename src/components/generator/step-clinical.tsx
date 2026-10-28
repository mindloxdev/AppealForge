"use client";

import { Controller, useFormContext } from "react-hook-form";
import { ShieldAlert } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckboxCard } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ENCLOSURE_OPTIONS, getDenialReason } from "@/content/denial-reasons";
import type { AppealFormValues } from "@/lib/validation/appeal";

export function StepClinical() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<AppealFormValues>();

  const reason = getDenialReason(watch("denialReason"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Clinical information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Write plainly - the letter puts it into formal language. Do not guess at dates or
          results: leave them out and the letter marks them for you.
        </p>
      </div>

      {reason ? (
        <p className="rounded-[var(--radius)] border border-teal-200 bg-accent-soft px-4 py-3 text-sm text-teal-900">
          <strong className="font-semibold">For a {reason.short.toLowerCase()} denial: </strong>
          {reason.evidenceHint}
        </p>
      ) : null}

      <Field
        id="diagnosisHistory"
        label="Diagnosis and relevant history"
        error={errors.diagnosisHistory?.message}
      >
        {(props) => (
          <Textarea
            {...props}
            {...register("diagnosisHistory")}
            rows={4}
            placeholder="Describe the patient's diagnosis, relevant medical history, and any information directly related to the denied service."
          />
        )}
      </Field>

      <Field
        id="symptomsImpact"
        label="Symptoms, duration, severity, and functional impact"
        error={errors.symptomsImpact?.message}
      >
        {(props) => (
          <Textarea
            {...props}
            {...register("symptomsImpact")}
            rows={4}
            placeholder="Describe the symptoms, how long they have been present, their severity, and how they affect the patient's daily activities or functioning."
          />
        )}
      </Field>

      <Field
        id="treatmentsTried"
        label="Treatments already tried"
        hint="Dates, doses and duration carry more weight than adjectives."
        error={errors.treatmentsTried?.message}
      >
        {(props) => (
          <Textarea
            {...props}
            {...register("treatmentsTried")}
            rows={4}
            placeholder="List previous treatments, medications, therapies, or procedures and explain which were ineffective, contraindicated, or otherwise unsuitable, if applicable."
          />
        )}
      </Field>

      <Field
        id="medicalNecessity"
        label="Why the service was necessary now"
        error={errors.medicalNecessity?.message}
      >
        {(props) => (
          <Textarea
            {...props}
            {...register("medicalNecessity")}
            rows={4}
            placeholder="Explain the clinical reason the service was needed at this time and the documented risks or consequences of delaying or withholding it."
          />
        )}
      </Field>

      <Field
        id="clinicalGuideline"
        label="Clinical guideline or insurer policy"
        optional
        hint="Leave blank and the letter writes a bracketed note. It will never invent a citation."
        error={errors.clinicalGuideline?.message}
      >
        {(props) => (
          <Input
            {...props}
            {...register("clinicalGuideline")}
            autoComplete="off"
            placeholder="Insurer medical policy name or number, LCD/NCD, or specialty society guideline"
          />
        )}
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Evidence available</legend>
        <p className="text-xs text-muted-foreground">
          Tick what you can attach to the appeal. Nothing is uploaded - this builds your checklist
          and tells the letter what to reference as an enclosure.
        </p>
        <Controller
          control={control}
          name="evidenceAvailable"
          render={({ field }) => {
            const value: string[] = Array.isArray(field.value) ? field.value : [];
            return (
              <div className="grid gap-2 sm:grid-cols-2">
                {ENCLOSURE_OPTIONS.map((option) => (
                  <CheckboxCard
                    key={option.value}
                    id={`evidence-${option.value}`}
                    label={option.label}
                    checked={value.includes(option.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...value, option.value]
                          : value.filter((entry) => entry !== option.value),
                      )
                    }
                  />
                ))}
              </div>
            );
          }}
        />
      </fieldset>

      <Alert variant="warning">
        <ShieldAlert aria-hidden="true" />
        <div>
          <AlertTitle>Keep it to what the appeal needs</AlertTitle>
          <AlertDescription>
            Only include information necessary for the appeal. Do not include Social Security
            numbers, full payment card details, or unrelated sensitive information.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
