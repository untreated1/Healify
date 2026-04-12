import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { sanitizeRedirectPath } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.auth.loginTitle,
  description: arMessages.auth.loginDescription,
  path: "/auth/login",
});

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};

  const redirectTo =
    typeof params.redirectTo === "string"
      ? sanitizeRedirectPath(params.redirectTo)
      : undefined;

  const error =
    typeof params.error === "string" ? params.error : undefined;

  return (
    <AuthShell
      title={arMessages.auth.loginTitle}
      description={arMessages.auth.loginDescription}
    >
      <AuthForm
        mode="login"
        action="/auth/login/submit"
        redirectTo={redirectTo}
        error={error}
      />
    </AuthShell>
  );
}