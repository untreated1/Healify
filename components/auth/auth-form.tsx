import Link from "next/link";
import { arMessages } from "@/lib/config/messages/ar";

type AuthFormProps = {
  mode: "login" | "signup";
  action: string;
  redirectTo?: string;
  error?: string;
};

export function AuthForm({ mode, action, redirectTo, error }: AuthFormProps) {
  const messages = arMessages.auth;
  const isSignup = mode === "signup";
  const alternateHref = isSignup
    ? `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`
    : `/auth/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <form action={action} method="post" className="space-y-5">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      {isSignup ? (
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.fullNameLabel}</span>
          <input
            type="text"
            name="fullName"
            required
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span>{messages.emailLabel}</span>
        <input
          type="email"
          name="email"
          required
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span>{messages.passwordLabel}</span>
        <input
          type="password"
          name="password"
          minLength={8}
          required
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {messages.errors[error as keyof typeof messages.errors] ?? messages.errors.unknown}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
      >
        {isSignup ? messages.submitSignup : messages.submitLogin}
      </button>

      <Link
        href={alternateHref}
        className="block text-center text-sm text-slate-600 underline-offset-4 hover:underline"
      >
        {isSignup ? messages.switchToLogin : messages.switchToSignup}
      </Link>
    </form>
  );
}
