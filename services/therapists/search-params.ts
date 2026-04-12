import {
  therapistSortOptions,
  type TherapistListFilters,
  type TherapistSortOption,
} from "@/services/therapists/types";

export type RawSearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

export const DEFAULT_THERAPIST_PAGE_SIZE = 9;

function readValue(searchParams: RawSearchParams, key: string) {
  if (!searchParams) {
    return undefined;
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }

  const raw = searchParams[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePage(value: string | undefined) {
  const parsed = parseNumber(value);

  if (!parsed || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseSort(value: string | undefined): TherapistSortOption {
  if (value && therapistSortOptions.includes(value as TherapistSortOption)) {
    return value as TherapistSortOption;
  }

  return "recommended";
}

export function parseTherapistListFilters(
  searchParams: RawSearchParams,
): TherapistListFilters {
  const availability = readValue(searchParams, "availability");

  return {
    specialization: readValue(searchParams, "specialization") || undefined,
    minPrice: parseNumber(readValue(searchParams, "minPrice")),
    maxPrice: parseNumber(readValue(searchParams, "maxPrice")),
    minRating: parseNumber(readValue(searchParams, "minRating")),
    availability: availability === "future-slots" ? "future-slots" : undefined,
    sort: parseSort(readValue(searchParams, "sort")),
    page: parsePage(readValue(searchParams, "page")),
    pageSize: DEFAULT_THERAPIST_PAGE_SIZE,
  };
}

export function hasActiveFilters(filters: TherapistListFilters) {
  return Boolean(
    filters.specialization ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minRating !== undefined ||
      filters.availability,
  );
}

export function buildTherapistsQueryString(
  filters: TherapistListFilters,
  overrides: Partial<TherapistListFilters> = {},
) {
  const nextFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (nextFilters.specialization) {
    params.set("specialization", nextFilters.specialization);
  }

  if (nextFilters.minPrice !== undefined) {
    params.set("minPrice", String(nextFilters.minPrice));
  }

  if (nextFilters.maxPrice !== undefined) {
    params.set("maxPrice", String(nextFilters.maxPrice));
  }

  if (nextFilters.minRating !== undefined) {
    params.set("minRating", String(nextFilters.minRating));
  }

  if (nextFilters.availability) {
    params.set("availability", nextFilters.availability);
  }

  if (nextFilters.sort !== "recommended") {
    params.set("sort", nextFilters.sort);
  }

  if (nextFilters.page > 1) {
    params.set("page", String(nextFilters.page));
  }

  return params.toString();
}
