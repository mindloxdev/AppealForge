"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APPEAL_LEVELS, DENIAL_REASONS, getDenialReason } from "@/content/denial-reasons";
import type { AppealFormValues } from "@/lib/validation/appeal";

const reasonOptions = DENIAL_REASONS.map((reason) => ({
  value: reason.key,
  label: reason.label,
  keywords: [reason.short, ...reason.codes, reason.codes.join(" ").replace(/-/g, "")],
}));

export function StepDenial() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<AppealFormValues>();

  const denialReason = watch("denialReason");
  const reason = getDenialReason(denialReason);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Denial details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Copy these from the denial letter or explanation of benefits. Anything you leave blank
          appears in the letter as a bracketed placeholder - never as an invented fact.
        </p>
      </div>

      <Field id="insurerName" label="Insurance company name" error={errors.insurerName?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("insurerName")}
            autoComplete="off"
            placeholder="Aetna, UnitedHealthcare, BCBS of Texas"
          />
        )}
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Appeal level</legend>
        <Controller
          control={control}
          name="appealLevel"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="sm:grid-cols-3"
            >
              {APPEAL_LEVELS.map((level) => (
                <RadioCard
                  key={level.value}
                  id={`appeal-level-${level.value}`}
                  value={level.value}
                  title={level.label}
                  description={level.description}
                />
              ))}
            </RadioGroup>
          )}
        />
      </fieldset>

      <Field
        id="denialReason"
        label="Denial reason"
        hint="Search by reason or by code. The letter's argument is built around this choice."
        error={errors.denialReason?.message}
      >
        {(props) => (
          <Controller
            control={control}
            name="denialReason"
            render={({ field }) => (
              <Combobox
                id={props.id}
                options={reasonOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Choose the denial reason"
                searchPlaceholder="Try CO-50, prior auth, timely filing"
                emptyText="No match. Choose Other and describe the denial."
                describedBy={props["aria-describedby"]}
                invalid={Boolean(errors.denialReason)}
              />
            )}
          />
        )}
      </Field>

      {reason ? (
        <Alert variant="accent" aria-live="polite">
          <Info aria-hidden="true" />
          <AlertDescription>
            <p>
              <strong className="font-semibold">What this usually means: </strong>
              {reason.meaning}
            </p>
            <p className="mt-2">
              <strong className="font-semibold">What tends to strengthen this appeal: </strong>
              {reason.evidenceHint}
            </p>
            <p className="mt-2 text-xs opacity-80">
              Payers apply codes differently. Check the wording on your own EOB or denial notice
              before relying on a code description.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      {denialReason === "other" ? (
        <Field
          id="denialReasonOther"
          label="Describe the denial reason"
          hint="Quote the plan's wording so the letter answers what was actually decided."
          error={errors.denialReasonOther?.message}
        >
          {(props) => (
            <Textarea
              {...props}
              {...register("denialReasonOther")}
              rows={3}
              placeholder="The plan states the service is considered cosmetic under the member's benefit plan."
            />
          )}
        </Field>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="claimNumber" label="Claim number" optional error={errors.claimNumber?.message}>
          {(props) => <Input {...props} {...register("claimNumber")} autoComplete="off" />}
        </Field>

        <Field id="memberId" label="Member ID" optional error={errors.memberId?.message}>
          {(props) => <Input {...props} {...register("memberId")} autoComplete="off" />}
        </Field>

        <Field
          id="dateOfService"
          label="Date of service"
          optional
          error={errors.dateOfService?.message}
        >
          {(props) => <Input {...props} {...register("dateOfService")} type="date" />}
        </Field>

        <Field id="denialDate" label="Denial date" optional error={errors.denialDate?.message}>
          {(props) => <Input {...props} {...register("denialDate")} type="date" />}
        </Field>

        <Field
          id="cptCodes"
          label="CPT / HCPCS code(s)"
          optional
          error={errors.cptCodes?.message}
        >
          {(props) => (
            <Input {...props} {...register("cptCodes")} autoComplete="off" placeholder="72148, 97110" />
          )}
        </Field>

        <Field
          id="icdCodes"
          label="ICD-10 diagnosis code(s)"
          optional
          error={errors.icdCodes?.message}
        >
          {(props) => (
            <Input {...props} {...register("icdCodes")} autoComplete="off" placeholder="M54.16, G89.29" />
          )}
        </Field>
      </div>

      <Field
        id="serviceDescription"
        label="Service in plain English"
        optional
        hint="A reviewer reads this before the codes."
        error={errors.serviceDescription?.message}
      >
        {(props) => (
          <Textarea
            {...props}
            {...register("serviceDescription")}
            rows={2}
            placeholder="MRI of the lumbar spine without contrast, ordered before surgical referral"
          />
        )}
      </Field>

      <Field id="amountBilled" label="Amount billed" optional error={errors.amountBilled?.message}>
        {(props) => (
          <Input {...props} {...register("amountBilled")} inputMode="decimal" placeholder="$1,840.00" />
        )}
      </Field>
    </div>
  );
}
