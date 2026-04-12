export const appConfig = {
  name: "Healify",
  locale: "ar-SA",
  timezone: "Asia/Riyadh",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://healify.sa",
  socialImagePath: "/og-default.png",
  currency: "SAR",
} as const;
