export const therapistSortOptions = [
  "recommended",
  "rating_desc",
  "price_asc",
  "price_desc",
  "availability_soonest",
] as const;

export type TherapistSortOption = (typeof therapistSortOptions)[number];

export type TherapistListFilters = {
  specialization?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: "future-slots";
  sort: TherapistSortOption;
  page: number;
  pageSize: number;
};

export type TherapistSpecializationOption = {
  slug: string;
  nameAr: string;
};

export type AvailabilitySlotViewModel = {
  id: string;
  startsAtUtc: string;
  endsAtUtc: string;
  formattedLabel: string;
};

export type TherapistCardViewModel = {
  id: string;
  slug: string;
  fullName: string;
  isVerified: boolean;
  sessionPriceSar: string;
  ratingLabel: string;
  reviewCount: number;
  reviewCountLabel: string;
  yearsOfExperience: number;
  yearsOfExperienceLabel: string;
  profileImageUrl: string | null;
  profileImageAlt: string;
  specializations: string[];
  credibilityCue: string;
  nextAvailableLabel: string | null;
  nextAvailableSortValue: string | null;
  recommendedScore: number;
};

export type TherapistProfileViewModel = {
  id: string;
  slug: string;
  fullName: string;
  isVerified: boolean;
  profileImageUrl: string | null;
  profileImageAlt: string;
  sessionPriceSar: string;
  ratingLabel: string;
  reviewCount: number;
  reviewCountLabel: string;
  yearsOfExperience: number;
  yearsOfExperienceLabel: string;
  specializations: string[];
  headlineAr: string | null;
  bioAr: string;
  credentialsAr: string | null;
  languages: string[];
  sessionModes: string[];
  credibilityCue: string;
  nextAvailableLabel: string | null;
  futureAvailabilitySlots: AvailabilitySlotViewModel[];
};

export type PaginatedTherapistListResult = {
  items: TherapistCardViewModel[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filters: TherapistListFilters;
  isFiltered: boolean;
  hasAnyActiveTherapists: boolean;
};
