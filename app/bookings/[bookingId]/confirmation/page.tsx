import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookingSummaryCard } from "@/components/bookings/booking-summary-card";
import { PageContainer } from "@/components/layout/page-container";
import { requirePatientUser } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";
import { getBookingConfirmationForPatient } from "@/services/bookings";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.bookings.confirmationTitle,
  description: arMessages.bookings.confirmationDescription,
  path: "/bookings/confirmation",
});

type BookingConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const { bookingId } = await params;
  const patient = await requirePatientUser(`/bookings/${bookingId}/confirmation`);
  const booking = await getBookingConfirmationForPatient(bookingId, patient.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="py-10">
      <PageContainer>
        <BookingSummaryCard
          booking={booking}
          title={arMessages.bookings.confirmationTitle}
          description={arMessages.bookings.confirmationDescription}
          actions={
            <Link
              href="/therapists"
              className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              {arMessages.bookings.confirmationAction}
            </Link>
          }
        />
      </PageContainer>
    </div>
  );
}
