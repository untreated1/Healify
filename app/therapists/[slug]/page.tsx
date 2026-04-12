import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { TherapistAvatar } from "@/components/therapists/therapist-avatar";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";
import {
  getPublicTherapistProfile,
  getTherapistProfileMetaDescription,
} from "@/services/therapists";

type TherapistProfilePageProps = {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  params,
}: TherapistProfilePageProps): Promise<Metadata> {
  const { slug } = params;
  const profile = await getPublicTherapistProfile(slug);

  if (!profile) {
    return buildPageMetadata({
      title: arMessages.therapists.profile.therapistNotFound,
      description: arMessages.therapists.profile.therapistNotFoundHint,
      path: `/therapists/${slug}`,
    });
  }

  return buildPageMetadata({
    title: profile.fullName,
    description: getTherapistProfileMetaDescription(profile),
    path: `/therapists/${profile.slug}`,
  });
}

export default async function TherapistProfilePage({
  params,
  searchParams,
}: TherapistProfilePageProps) {
  const { slug } = params;
  const paramsData = searchParams ?? {};
  const bookingError =
    typeof paramsData.bookingError === "string"
      ? paramsData.bookingError
      : undefined;
  const profile = await getPublicTherapistProfile(slug);
  const messages = arMessages.therapists.profile;
  const browseMessages = arMessages.therapists.browse;

  if (!profile) {
    notFound();
  }

  return (
    <div className="py-8 sm:py-10">
      <PageContainer className="space-y-8">
        <Link
          href="/therapists"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          {messages.backToBrowse}
        </Link>

        {bookingError ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <p className="font-medium">{messages.bookingErrorTitle}</p>
            <p className="mt-2">
              {bookingError === "slot-expired"
                ? messages.bookingErrorExpired
                : messages.bookingErrorSlotUnavailable}
            </p>
          </div>
        ) : null}

        <article className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.45)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="space-y-6 rounded-[30px] bg-slate-50 p-6">
              <div className="flex items-center gap-4">
                <TherapistAvatar
                  fullName={profile.fullName}
                  profileImageUrl={profile.profileImageUrl}
                  alt={profile.profileImageAlt}
                  size="lg"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold text-slate-950">
                      {profile.fullName}
                    </h1>
                    {profile.isVerified ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                        {browseMessages.verifiedLabel}
                      </span>
                    ) : null}
                  </div>

                  {profile.headlineAr ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {profile.headlineAr}
                    </p>
                  ) : null}
                </div>
              </div>

              <dl className="grid gap-3 text-sm">
                <div className="rounded-2xl bg-white p-4">
                  <dt className="text-slate-500">{browseMessages.priceLabel}</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {profile.sessionPriceSar}
                  </dd>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <dt className="text-slate-500">{browseMessages.ratingLabel}</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {profile.ratingLabel} ({profile.reviewCountLabel})
                  </dd>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <dt className="text-slate-500">{browseMessages.experienceLabel}</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {profile.yearsOfExperienceLabel} {messages.experienceSuffix}
                  </dd>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <dt className="text-slate-500">{browseMessages.nextAvailable}</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {profile.nextAvailableLabel ?? messages.noAvailability}
                  </dd>
                </div>
              </dl>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-sm leading-7 text-slate-600">
                  {profile.credibilityCue}
                </p>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  {messages.specializationsTitle}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.specializations.map((specialization) => (
                    <span
                      key={specialization}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  {messages.aboutTitle}
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-700">
                  {profile.bioAr}
                </p>
              </section>

              {profile.credentialsAr ? (
                <section className="rounded-[28px] border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {messages.credentialsTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-slate-700">
                    {profile.credentialsAr}
                  </p>
                </section>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-[28px] border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {messages.languagesTitle}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {messages.sessionModesTitle}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.sessionModes.map((mode) => (
                      <span
                        key={mode}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <section className="rounded-[28px] border border-slate-200 p-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {messages.slotSelectionTitle}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {messages.slotSelectionHint}
                  </p>
                </div>

                {profile.futureAvailabilitySlots.length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {profile.futureAvailabilitySlots.map((slot) => (
                      <Link
                        key={slot.id}
                        href={`/bookings/start?slotId=${encodeURIComponent(slot.id)}&therapistSlug=${encodeURIComponent(profile.slug)}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="block">{slot.formattedLabel}</span>
                        <span className="mt-2 block text-xs text-emerald-800">
                          {messages.selectSlotCta}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {messages.noAvailability}
                  </p>
                )}
              </section>
            </div>
          </div>
        </article>
      </PageContainer>
    </div>
  );
}
