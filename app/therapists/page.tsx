import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { TherapistCard } from "@/components/therapists/therapist-card";
import { TherapistFilters } from "@/components/therapists/therapist-filters";
import { TherapistPagination } from "@/components/therapists/therapist-pagination";
import { TherapistSection } from "@/components/therapists/therapist-section";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";
import {
  getAvailableSoonTherapists,
  getBrowseTherapists,
  getTherapistSpecializations,
  getTopRecommendedTherapists,
} from "@/services/therapists";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.therapists.browse.title,
  description: arMessages.therapists.browse.description,
  path: "/therapists",
});

type TherapistsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TherapistsPage({
  searchParams,
}: TherapistsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const messages = arMessages.therapists.browse;

  const [recommended, availableSoon, browseResult, specializations] =
    await Promise.all([
      getTopRecommendedTherapists(4),
      getAvailableSoonTherapists(4),
      getBrowseTherapists(resolvedSearchParams),
      getTherapistSpecializations(),
    ]);

  const showEmptyState = !browseResult.hasAnyActiveTherapists;
  const showNoResultsState =
    browseResult.hasAnyActiveTherapists && browseResult.items.length === 0;

  return (
    <div className="py-8 sm:py-10">
      <PageContainer className="space-y-10">
        <section className="rounded-[34px] border border-slate-200 bg-white px-6 py-8 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.45)] sm:px-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {messages.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              {messages.description}
            </p>
          </div>
        </section>

        {recommended.length > 0 ? (
          <div className="rounded-[34px] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-7 shadow-[0_32px_90px_-62px_rgba(16,185,129,0.45)] sm:px-8">
            <TherapistSection
              title={messages.sectionRecommended}
              hint={messages.sectionRecommendedHint}
            >
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                {recommended.map((therapist) => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            </TherapistSection>
          </div>
        ) : null}

        {availableSoon.length > 0 ? (
          <div className="rounded-[30px] border border-slate-200/80 bg-white/70 px-5 py-6 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:px-6">
            <TherapistSection title={messages.sectionSoon} hint={messages.sectionSoonHint}>
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                {availableSoon.map((therapist) => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </div>
            </TherapistSection>
          </div>
        ) : null}

        <div className="rounded-[30px] border border-slate-200/80 bg-white/75 px-5 py-6 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:px-6">
          <TherapistSection title={messages.sectionAll} hint={messages.sectionAllHint}>
            <TherapistFilters
              filters={browseResult.filters}
              specializations={specializations}
            />

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                {messages.resultsSummary}: {browseResult.totalItems}
              </p>
            </div>

            {showEmptyState ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold text-slate-950">
                  {messages.emptyTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {messages.emptyDescription}
                </p>
              </div>
            ) : null}

            {showNoResultsState ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold text-slate-950">
                  {messages.noResultsTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {messages.noResultsDescription}
                </p>
              </div>
            ) : null}

            {!showEmptyState && !showNoResultsState ? (
              <>
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {browseResult.items.map((therapist) => (
                    <TherapistCard key={therapist.id} therapist={therapist} />
                  ))}
                </div>

                <TherapistPagination
                  filters={browseResult.filters}
                  currentPage={browseResult.currentPage}
                  totalPages={browseResult.totalPages}
                />
              </>
            ) : null}
          </TherapistSection>
        </div>
      </PageContainer>
    </div>
  );
}
