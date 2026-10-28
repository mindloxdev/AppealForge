import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/auth-forms";
import { getOptionalSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your AppealForge plan and billing.",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  if (await getOptionalSession()) redirect("/account");
  return (
    <AuthShell title="Sign in" subtitle="Manage your plan, billing and receipts.">
      <SignInForm />
    </AuthShell>
  );
}
