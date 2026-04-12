import Link from "next/link";
import { TherapistAvatar } from "@/components/therapists/therapist-avatar";
import { arMessages } from "@/lib/config/messages/ar";
import type { TherapistCardViewModel } from "@/services/therapists";

type TherapistCardProps = {
  therapist: TherapistCardViewModel;
};

export function TherapistCard({ therapist }: TherapistCardProps) {
  const messages = arMessages.therapists.browse;

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-38px_rgba(15,23,42,0.42)]">
      <div className="flex items-start gap-4">
        <TherapistAvatar
          fullName={therapist.fullName}
          profileImageUrl={therapist.profileImageUrl}
          alt={therapist.profileImageAlt}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">
              {therapist.fullName}
            </h3>
            {therapist.isVerified ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                {messages.verifiedLabel}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {therapist.credibilityCue}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {therapist.specializations.map((specialization) => (
          <span
            key={specialization}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
          >
            {specialization}
          </span>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">{messages.priceLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {therapist.sessionPriceSar}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">{messages.ratingLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {therapist.ratingLabel} ({therapist.reviewCountLabel})
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">{messages.experienceLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {therapist.yearsOfExperienceLabel}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">{messages.nextAvailable}</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {therapist.nextAvailableLabel ?? messages.nextAvailableNone}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {messages.reviewsLabel}: {therapist.reviewCountLabel}
        </p>
        <Link
          href={`/therapists/${therapist.slug}`}
          className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {messages.browseProfile}
        </Link>
      </div>
    </article>
  );
}
