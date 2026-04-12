import Link from "next/link";
import { arMessages } from "@/lib/config/messages/ar";
import {
  buildTherapistsQueryString,
  type TherapistListFilters,
} from "@/services/therapists";

type TherapistPaginationProps = {
  filters: TherapistListFilters;
  currentPage: number;
  totalPages: number;
};

function buildPageHref(filters: TherapistListFilters, page: number) {
  const query = buildTherapistsQueryString(filters, { page });
  return query ? `/therapists?${query}` : "/therapists";
}

export function TherapistPagination({
  filters,
  currentPage,
  totalPages,
}: TherapistPaginationProps) {
  const messages = arMessages.therapists.browse;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-4">
      <Link
        href={buildPageHref(filters, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage <= 1}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          currentPage <= 1
            ? "pointer-events-none bg-slate-100 text-slate-400"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {messages.previousPage}
      </Link>

      <p className="text-sm text-slate-600">
        {messages.pageLabel} {currentPage} / {totalPages}
      </p>

      <Link
        href={buildPageHref(filters, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          currentPage >= totalPages
            ? "pointer-events-none bg-slate-100 text-slate-400"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {messages.nextPage}
      </Link>
    </nav>
  );
}
