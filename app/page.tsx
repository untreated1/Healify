import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "اكتشاف جلسات نفسية رقمية",
  description: arMessages.landing.description,
  path: "/",
});

export default function HomePage() {
  const messages = arMessages.landing;

  return (
    <div className="py-8 sm:py-12">
      <PageContainer className="space-y-10">
        <section className="overflow-hidden rounded-[36px] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_45%,#eff6ff_100%)] px-6 py-10 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.5)] sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm text-emerald-800 shadow-sm">
                {messages.eyebrow}
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  {messages.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  {messages.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/therapists"
                  className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  {messages.primaryCta}
                </Link>
                <Link
                  href="/therapists?sort=availability_soonest"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  {messages.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {messages.trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm"
                >
                  <p className="text-sm leading-7 text-slate-700">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {messages.benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-44px_rgba(15,23,42,0.35)]"
            >
              <h2 className="text-xl font-semibold text-slate-950">
                {benefit.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.38)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                {messages.trustTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {arMessages.brand.tagline}
              </p>
            </div>

            <Link
              href="/therapists"
              className="w-full rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
            >
              {messages.primaryCta}
            </Link>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
