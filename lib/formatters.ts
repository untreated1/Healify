import { appConfig } from "@/lib/config/app";
import { arMessages } from "@/lib/config/messages/ar";

export function toNumber(value: number | string | { toString(): string }) {
  return Number(value);
}

export function formatCurrencySar(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatRating(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat(appConfig.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

export function formatInteger(value: number) {
  return new Intl.NumberFormat(appConfig.locale).format(value);
}

export function formatSaudiDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat(appConfig.locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: appConfig.timezone,
  }).format(date);
}

export function buildCredibilityCue(options: {
  isVerified: boolean;
  reviewCount: number;
  yearsOfExperience: number;
}) {
  const messages = arMessages.therapists.browse;

  if (options.isVerified && options.yearsOfExperience >= 10) {
    return messages.credibilityVerifiedSenior;
  }

  if (options.reviewCount >= 50) {
    return messages.credibilityHighlyReviewed;
  }

  if (options.yearsOfExperience >= 8) {
    return messages.credibilityExperienced;
  }

  return messages.credibilityCalm;
}
