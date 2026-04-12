import type { Metadata } from "next";
import { appConfig } from "@/lib/config/app";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
};

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildAbsoluteUrl(path: string) {
  return new URL(normalizePath(path), appConfig.siteUrl).toString();
}

export function getMetadataBase() {
  return new URL(appConfig.siteUrl);
}

export function buildPageMetadata({
  title,
  description,
  path,
  imagePath,
}: PageMetadataInput): Metadata {
  const canonical = buildAbsoluteUrl(path);
  const image = buildAbsoluteUrl(imagePath ?? appConfig.socialImagePath);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: appConfig.name,
      locale: appConfig.locale,
      images: [
        {
          url: image,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
