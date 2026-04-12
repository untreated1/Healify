import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { appConfig } from "@/lib/config/app";
import { arMessages } from "@/lib/config/messages/ar";
import { getMetadataBase } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: arMessages.brand.name,
    template: `%s | ${arMessages.brand.name}`,
  },
  description: arMessages.brand.tagline,
  openGraph: {
    siteName: appConfig.name,
    locale: appConfig.locale,
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="text-slate-950 antialiased">
        <SiteHeader />
        <main className="min-h-[calc(100vh-9rem)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
