import { arMessages } from "@/lib/config/messages/ar";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-800">{arMessages.brand.name}</p>
        <p>{arMessages.footer.note}</p>
      </div>
    </footer>
  );
}
