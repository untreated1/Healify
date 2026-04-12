import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";

export async function SiteHeader() {
  const user = await getCurrentSessionUser();

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-950"
          >
            {arMessages.brand.name}
          </Link>
          <p className="mt-1 text-sm text-slate-600">
            {arMessages.brand.tagline}
          </p>
        </div>

        <nav className="flex items-center gap-3 text-sm text-slate-700">
          <Link
            href="/"
            className="rounded-full px-4 py-2 transition hover:bg-slate-100"
          >
            {arMessages.navigation.home}
          </Link>
          <Link
            href="/therapists"
            className="rounded-full bg-emerald-900 px-4 py-2 font-medium text-white transition hover:bg-emerald-800"
          >
            {arMessages.navigation.therapists}
          </Link>
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-slate-200 px-4 py-2 transition hover:bg-slate-100"
            >
              {arMessages.auth.submitLogin}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
