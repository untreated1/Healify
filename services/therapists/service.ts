import { AvailabilityStatus, Prisma, TherapistStatus } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import { arMessages } from "@/lib/config/messages/ar";
import {
  buildCredibilityCue,
  formatCurrencySar,
  formatInteger,
  formatRating,
  formatSaudiDateTime,
  toNumber,
} from "@/lib/formatters";
import {
  buildTherapistsQueryString,
  hasActiveFilters,
  parseTherapistListFilters,
  type RawSearchParams,
} from "@/services/therapists/search-params";
import type {
  AvailabilitySlotViewModel,
  PaginatedTherapistListResult,
  TherapistCardViewModel,
  TherapistListFilters,
  TherapistProfileViewModel,
  TherapistSortOption,
  TherapistSpecializationOption,
} from "@/services/therapists/types";

const browseMessages = arMessages.therapists.browse;
const profileMessages = arMessages.therapists.profile;

const publicTherapistInclude = {
  user: {
    select: {
      fullName: true,
    },
  },
  profile: {
    select: {
      headlineAr: true,
      bioAr: true,
      credentialsAr: true,
      languages: true,
      sessionModes: true,
    },
  },
  specializations: {
    select: {
      slug: true,
      nameAr: true,
    },
    orderBy: {
      nameAr: "asc" as const,
    },
  },
  availabilities: {
    where: {
      status: AvailabilityStatus.AVAILABLE,
    },
    select: {
      id: true,
      startsAtUtc: true,
      endsAtUtc: true,
      timezone: true,
      status: true,
    },
    orderBy: {
      startsAtUtc: "asc" as const,
    },
  },
} satisfies Prisma.TherapistInclude;

type PublicTherapistRecord = Prisma.TherapistGetPayload<{
  include: typeof publicTherapistInclude;
}>;

function getFutureAvailableSlots(record: PublicTherapistRecord) {
  const now = new Date();
  return record.availabilities.filter((slot) => slot.startsAtUtc > now);
}

function getNextAvailableSlot(record: PublicTherapistRecord) {
  return getFutureAvailableSlots(record)[0] ?? null;
}

function computeRecommendedScore(record: PublicTherapistRecord) {
  const verifiedScore = record.isVerified ? 25 : 0;
  const ratingScore = (toNumber(record.rating) / 5) * 35;
  const reviewScore = (Math.min(record.reviewCount, 100) / 100) * 15;
  const experienceScore = (Math.min(record.yearsOfExperience, 15) / 15) * 10;
  const availabilityScore = getNextAvailableSlot(record) ? 15 : 0;

  return Number(
    (
      verifiedScore +
      ratingScore +
      reviewScore +
      experienceScore +
      availabilityScore
    ).toFixed(4),
  );
}

function compareRecommended(a: PublicTherapistRecord, b: PublicTherapistRecord) {
  const scoreDiff = computeRecommendedScore(b) - computeRecommendedScore(a);
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  const ratingDiff = toNumber(b.rating) - toNumber(a.rating);
  if (ratingDiff !== 0) {
    return ratingDiff;
  }

  const reviewDiff = b.reviewCount - a.reviewCount;
  if (reviewDiff !== 0) {
    return reviewDiff;
  }

  const experienceDiff = b.yearsOfExperience - a.yearsOfExperience;
  if (experienceDiff !== 0) {
    return experienceDiff;
  }

  return a.slug.localeCompare(b.slug, "en");
}

function compareAvailabilitySoonest(a: PublicTherapistRecord, b: PublicTherapistRecord) {
  const aNext = getNextAvailableSlot(a);
  const bNext = getNextAvailableSlot(b);

  if (aNext && !bNext) {
    return -1;
  }

  if (!aNext && bNext) {
    return 1;
  }

  if (aNext && bNext) {
    const slotDiff = aNext.startsAtUtc.getTime() - bNext.startsAtUtc.getTime();
    if (slotDiff !== 0) {
      return slotDiff;
    }
  }

  const ratingDiff = toNumber(b.rating) - toNumber(a.rating);
  if (ratingDiff !== 0) {
    return ratingDiff;
  }

  return a.slug.localeCompare(b.slug, "en");
}

function matchesFilters(record: PublicTherapistRecord, filters: TherapistListFilters) {
  if (filters.specialization) {
    const hasSpecialization = record.specializations.some(
      (specialization) => specialization.slug === filters.specialization,
    );

    if (!hasSpecialization) {
      return false;
    }
  }

  const price = toNumber(record.sessionPriceSar);
  if (filters.minPrice !== undefined && price < filters.minPrice) {
    return false;
  }

  if (filters.maxPrice !== undefined && price > filters.maxPrice) {
    return false;
  }

  const rating = toNumber(record.rating);
  if (filters.minRating !== undefined && rating < filters.minRating) {
    return false;
  }

  if (filters.availability === "future-slots" && !getNextAvailableSlot(record)) {
    return false;
  }

  return true;
}

function sortRecords(records: PublicTherapistRecord[], sort: TherapistSortOption) {
  const nextRecords = [...records];

  switch (sort) {
    case "rating_desc":
      return nextRecords.sort((a, b) => {
        const ratingDiff = toNumber(b.rating) - toNumber(a.rating);
        return ratingDiff !== 0 ? ratingDiff : compareRecommended(a, b);
      });
    case "price_asc":
      return nextRecords.sort((a, b) => {
        const priceDiff = toNumber(a.sessionPriceSar) - toNumber(b.sessionPriceSar);
        return priceDiff !== 0 ? priceDiff : compareRecommended(a, b);
      });
    case "price_desc":
      return nextRecords.sort((a, b) => {
        const priceDiff = toNumber(b.sessionPriceSar) - toNumber(a.sessionPriceSar);
        return priceDiff !== 0 ? priceDiff : compareRecommended(a, b);
      });
    case "availability_soonest":
      return nextRecords.sort(compareAvailabilitySoonest);
    case "recommended":
    default:
      return nextRecords.sort(compareRecommended);
  }
}

function mapAvailabilitySlot(slot: {
  id: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
}): AvailabilitySlotViewModel {
  return {
    id: slot.id,
    startsAtUtc: slot.startsAtUtc.toISOString(),
    endsAtUtc: slot.endsAtUtc.toISOString(),
    formattedLabel: formatSaudiDateTime(slot.startsAtUtc),
  };
}

function mapToCardViewModel(record: PublicTherapistRecord): TherapistCardViewModel {
  const nextAvailable = getNextAvailableSlot(record);

  return {
    id: record.id,
    slug: record.slug,
    fullName: record.user.fullName,
    isVerified: record.isVerified,
    sessionPriceSar: formatCurrencySar(record.sessionPriceSar),
    ratingLabel: formatRating(record.rating),
    reviewCount: record.reviewCount,
    reviewCountLabel: formatInteger(record.reviewCount),
    yearsOfExperience: record.yearsOfExperience,
    yearsOfExperienceLabel: formatInteger(record.yearsOfExperience),
    profileImageUrl: record.profileImageUrl,
    profileImageAlt: `${browseMessages.fallbackImageAlt} - ${record.user.fullName}`,
    specializations: record.specializations.map((specialization) => specialization.nameAr),
    credibilityCue: buildCredibilityCue({
      isVerified: record.isVerified,
      reviewCount: record.reviewCount,
      yearsOfExperience: record.yearsOfExperience,
    }),
    nextAvailableLabel: nextAvailable
      ? formatSaudiDateTime(nextAvailable.startsAtUtc)
      : null,
    nextAvailableSortValue: nextAvailable
      ? nextAvailable.startsAtUtc.toISOString()
      : null,
    recommendedScore: computeRecommendedScore(record),
  };
}

function mapToProfileViewModel(record: PublicTherapistRecord): TherapistProfileViewModel {
  const futureAvailabilitySlots = getFutureAvailableSlots(record).map(mapAvailabilitySlot);

  return {
    ...mapToCardViewModel(record),
    headlineAr: record.profile?.headlineAr ?? null,
    bioAr: record.profile?.bioAr ?? "",
    credentialsAr: record.profile?.credentialsAr ?? null,
    languages: record.profile?.languages ?? [],
    sessionModes:
      record.profile?.sessionModes.map(
        (mode) =>
          profileMessages.sessionModeLabels[
            mode as keyof typeof profileMessages.sessionModeLabels
          ] ?? mode,
      ) ?? [],
    futureAvailabilitySlots,
  };
}

async function getActiveTherapists() {
  return getPrisma().therapist.findMany({
    where: {
      status: TherapistStatus.ACTIVE,
    },
    include: publicTherapistInclude,
  });
}

export async function getTherapistSpecializations(): Promise<TherapistSpecializationOption[]> {
  return getPrisma().specialization.findMany({
    orderBy: {
      nameAr: "asc",
    },
    select: {
      slug: true,
      nameAr: true,
    },
  });
}

export async function getTopRecommendedTherapists(limit = 4) {
  const records = await getActiveTherapists();
  return sortRecords(records, "recommended").slice(0, limit).map(mapToCardViewModel);
}

export async function getAvailableSoonTherapists(limit = 4) {
  const records = await getActiveTherapists();

  return sortRecords(
    records.filter((record) => Boolean(getNextAvailableSlot(record))),
    "availability_soonest",
  )
    .slice(0, limit)
    .map(mapToCardViewModel);
}

export async function getBrowseTherapists(
  rawSearchParams?: RawSearchParams,
): Promise<PaginatedTherapistListResult> {
  const filters = parseTherapistListFilters(rawSearchParams);
  const allActiveRecords = await getActiveTherapists();
  const filteredRecords = allActiveRecords.filter((record) => matchesFilters(record, filters));
  const sortedRecords = sortRecords(filteredRecords, filters.sort);

  const totalItems = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
  const currentPage = Math.min(filters.page, totalPages);
  const startIndex = (currentPage - 1) * filters.pageSize;

  return {
    items: sortedRecords
      .slice(startIndex, startIndex + filters.pageSize)
      .map(mapToCardViewModel),
    totalItems,
    totalPages,
    currentPage,
    pageSize: filters.pageSize,
    filters: {
      ...filters,
      page: currentPage,
    },
    isFiltered: hasActiveFilters(filters),
    hasAnyActiveTherapists: allActiveRecords.length > 0,
  };
}

export async function getPublicTherapistProfile(slug: string) {
  const therapist = await getPrisma().therapist.findFirst({
    where: {
      slug,
      status: TherapistStatus.ACTIVE,
    },
    include: publicTherapistInclude,
  });

  if (!therapist) {
    return null;
  }

  return mapToProfileViewModel(therapist);
}

export function getTherapistProfileMetaDescription(profile: TherapistProfileViewModel) {
  const specializationSummary = profile.specializations.slice(0, 3).join("، ");
  const headlinePrefix = profile.headlineAr ? `${profile.headlineAr} - ` : "";

  return `${headlinePrefix}${profile.fullName} تقدم جلسات بسعر ${profile.sessionPriceSar} مع تخصصات تشمل ${specializationSummary}.`;
}

export { buildTherapistsQueryString };
