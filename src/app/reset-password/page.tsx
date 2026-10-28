import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="That link is incomplete" subtitle="Request a new password reset link.">
        <p className="text-sm text-muted-foreground">
          The reset link did not include a token. Request a new one from the sign-in page.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you do not use elsewhere.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
