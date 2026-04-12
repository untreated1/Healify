import { arMessages } from "@/lib/config/messages/ar";
import type {
  TherapistListFilters,
  TherapistSpecializationOption,
} from "@/services/therapists";

type TherapistFiltersProps = {
  filters: TherapistListFilters;
  specializations: TherapistSpecializationOption[];
};

const ratingOptions = [4, 4.5];

export function TherapistFilters({
  filters,
  specializations,
}: TherapistFiltersProps) {
  const messages = arMessages.therapists;

  return (
    <form
      action="/therapists"
      method="get"
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.filters.specialization}</span>
          <select
            name="specialization"
            defaultValue={filters.specialization ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          >
            <option value="">{messages.filters.allSpecializations}</option>
            {specializations.map((specialization) => (
              <option key={specialization.slug} value={specialization.slug}>
                {specialization.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.filters.minPrice}</span>
          <input
            type="number"
            min="0"
            name="minPrice"
            defaultValue={filters.minPrice ?? ""}
            placeholder={messages.filters.anyPrice}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.filters.maxPrice}</span>
          <input
            type="number"
            min="0"
            name="maxPrice"
            defaultValue={filters.maxPrice ?? ""}
            placeholder={messages.filters.anyPrice}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.filters.minRating}</span>
          <select
            name="minRating"
            defaultValue={filters.minRating ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          >
            <option value="">{messages.filters.anyRating}</option>
            {ratingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.filters.availability}</span>
          <select
            name="availability"
            defaultValue={filters.availability ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          >
            <option value="">{messages.filters.anyAvailability}</option>
            <option value={messages.browse.availabilityFilterValue}>
              {messages.filters.availabilityOnlyFuture}
            </option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span>{messages.browse.sortTitle}</span>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0"
          >
            <option value="recommended">{messages.sorts.recommended}</option>
            <option value="rating_desc">{messages.sorts.rating_desc}</option>
            <option value="price_asc">{messages.sorts.price_asc}</option>
            <option value="price_desc">{messages.sorts.price_desc}</option>
            <option value="availability_soonest">
              {messages.sorts.availability_soonest}
            </option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {messages.browse.applyFilters}
        </button>
        <a
          href="/therapists"
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {messages.browse.clearFilters}
        </a>
      </div>
    </form>
  );
}
