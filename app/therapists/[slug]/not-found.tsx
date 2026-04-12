import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { arMessages } from "@/lib/config/messages/ar";

export default function TherapistProfileNotFound() {
  const messages = arMessages.therapists.profile;

  return (
    <div className="py-14">
      <PageContainer>
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">
            {messages.therapistNotFound}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {messages.therapistNotFoundHint}
          </p>
          <Link
            href="/therapists"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {messages.backToBrowse}
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
