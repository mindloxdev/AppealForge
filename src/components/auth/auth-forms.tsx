"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
  type AuthState,
} from "@/lib/auth/actions";

const initial: AuthState = {};

function Feedback({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-[var(--radius)] border border-red-200 bg-destructive-soft px-3 py-2 text-sm text-destructive"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{state.error}</span>
      </p>
    );
  }
  if (state.notice) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius)] border border-emerald-200 bg-success-soft px-3 py-2 text-sm text-success"
      >
        <p className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.notice}</span>
        </p>
        {state.devResetLink ? (
          <p className="mt-2 break-all text-xs">
            Development only - no mail provider is configured:{" "}
            <Link href={state.devResetLink} className="underline">
              {state.devResetLink}
            </Link>
          </p>
        ) : null}
      </div>
    );
  }
  return null;
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback state={state} />

      <Field id="name" label="Name" optional>
        {(props) => (
          <Input
            {...props}
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>

      <Field id="email" label="Email">
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field id="password" label="Password" hint="At least 10 characters.">
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        )}
      </Field>

      <Button type="submit" block size="lg" loading={pending}>
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        An account is only needed for the monthly plan and billing. The generator works without one,
        and no letters or claim details are ever stored on an account.
      </p>
    </form>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initial);
  // Controlled so a failed attempt does not wipe what was typed: the server
  // re-render that follows an action would reset an uncontrolled input.
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback state={state} />

      <Field id="email" label="Email">
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field id="password" label="Password">
        {(props) => (
          <Input {...props} name="password" type="password" autoComplete="current-password" required />
        )}
      </Field>

      <Button type="submit" block size="lg" loading={pending}>
        Sign in
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/signup" className="font-medium text-accent underline-offset-2 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback state={state} />

      <Field id="email" label="Email">
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Button type="submit" block size="lg" loading={pending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      <Feedback state={state} />
      <input type="hidden" name="token" value={token} />

      <Field id="password" label="New password" hint="At least 10 characters.">
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        )}
      </Field>

      <Button type="submit" block size="lg" loading={pending}>
        Change password
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
