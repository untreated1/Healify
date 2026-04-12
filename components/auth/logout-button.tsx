import { arMessages } from "@/lib/config/messages/ar";

export function LogoutButton() {
  return (
    <form action="/auth/logout" method="post">
      <button
        type="submit"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
      >
        {arMessages.auth.logoutLabel}
      </button>
    </form>
  );
}
