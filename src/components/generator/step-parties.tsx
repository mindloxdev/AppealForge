"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxCard } from "@/components/ui/checkbox";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import { ENCLOSURE_OPTIONS, LETTER_AUTHORS } from "@/content/denial-reasons";
import type { AppealFormValues } from "@/lib/validation/appeal";

export function StepParties() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<AppealFormValues>();

  const author = watch("letterAuthor");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Parties and documents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Blank fields become bracketed placeholders you can fill in on the printed copy.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Who is the letter from?</legend>
        <Controller
          control={control}
          name="letterAuthor"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="sm:grid-cols-3"
            >
              {LETTER_AUTHORS.map((option) => (
                <RadioCard
                  key={option.value}
                  id={`author-${option.value}`}
                  value={option.value}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </RadioGroup>
          )}
        />
      </fieldset>

      <div className="rounded-[var(--radius)] border border-border bg-secondary/40 p-4">
        <h3 className="text-sm font-semibold text-foreground">
          {author === "patient" ? "Provider details (for the RE line)" : "Provider and practice"}
        </h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field id="providerName" label="Provider name" optional error={errors.providerName?.message}>
            {(props) => <Input {...props} {...register("providerName")} autoComplete="off" />}
          </Field>

          <Field
            id="providerCredentials"
            label="Professional credentials"
            optional
            error={errors.providerCredentials?.message}
          >
            {(props) => (
              <Input {...props} {...register("providerCredentials")} autoComplete="off" placeholder="MD, DO, NP" />
            )}
          </Field>

          <Field id="providerNpi" label="NPI" optional error={errors.providerNpi?.message}>
            {(props) => <Input {...props} {...register("providerNpi")} autoComplete="off" inputMode="numeric" />}
          </Field>

          <Field id="practiceName" label="Practice name" optional error={errors.practiceName?.message}>
            {(props) => <Input {...props} {...register("practiceName")} autoComplete="organization" />}
          </Field>

          <Field
            id="practiceAddress"
            label="Practice mailing address"
            optional
            className="sm:col-span-2"
            error={errors.practiceAddress?.message}
          >
            {(props) => <Textarea {...props} {...register("practiceAddress")} rows={2} />}
          </Field>

          <Field id="practicePhone" label="Phone number" optional error={errors.practicePhone?.message}>
            {(props) => <Input {...props} {...register("practicePhone")} type="tel" autoComplete="tel" />}
          </Field>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-secondary/40 p-4">
        <h3 className="text-sm font-semibold text-foreground">Patient</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field id="patientName" label="Patient name" optional error={errors.patientName?.message}>
            {(props) => <Input {...props} {...register("patientName")} autoComplete="off" />}
          </Field>

          <Field id="patientDob" label="Date of birth" optional error={errors.patientDob?.message}>
            {(props) => <Input {...props} {...register("patientDob")} type="date" />}
          </Field>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          You can leave the patient identifiers blank. The letter prints bracketed placeholders
          instead, and you fill them in on the copy you send.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Supporting documents checklist</legend>
        <p className="text-xs text-muted-foreground">
          Selected items are listed as enclosures in the letter and ticked on your attachment
          checklist.
        </p>
        <Controller
          control={control}
          name="enclosures"
          render={({ field }) => {
            const value: string[] = Array.isArray(field.value) ? field.value : [];
            return (
              <div className="grid gap-2 sm:grid-cols-2">
                {ENCLOSURE_OPTIONS.map((option) => (
                  <CheckboxCard
                    key={option.value}
                    id={`enclosure-${option.value}`}
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
    </div>
  );
}
