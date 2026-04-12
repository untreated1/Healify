import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { sanitizeRedirectPath } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.auth.signupTitle,
  description: arMessages.auth.signupDescription,
  path: "/auth/signup",
});

type SignupPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = searchParams ?? {};
  const redirectTo =
    typeof params.redirectTo === "string"
      ? sanitizeRedirectPath(params.redirectTo)
      : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <AuthShell
      title={arMessages.auth.signupTitle}
      description={arMessages.auth.signupDescription}
    >
      <AuthForm
        mode="signup"
        action="/auth/signup/submit"
        redirectTo={redirectTo}
        error={error}
      />
    </AuthShell>
  );
}
