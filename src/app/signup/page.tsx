import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/auth-forms";
import { getOptionalSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an AppealForge account to manage the monthly plan.",
  robots: { index: false, follow: true },
};

export default async function SignUpPage() {
  if (await getOptionalSession()) redirect("/account");
  return (
    <AuthShell
      title="Create your account"
      subtitle="Needed only for the monthly plan - the generator is free to try without one."
    >
      <SignUpForm />
    </AuthShell>
  );
}
