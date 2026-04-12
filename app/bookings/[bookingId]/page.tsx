import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookingStatus } from "@prisma/client";
import { BookingSummaryCard } from "@/components/bookings/booking-summary-card";
import { PageContainer } from "@/components/layout/page-container";
import { requirePatientUser } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";
import { getBookingSummaryForPatient } from "@/services/bookings";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.bookings.summaryTitle,
  description: arMessages.bookings.summaryDescription,
  path: "/bookings",
});

type BookingSummaryPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingSummaryPage({
  params,
}: BookingSummaryPageProps) {
  const { bookingId } = await params;
  const patient = await requirePatientUser(`/bookings/${bookingId}`);
  const booking = await getBookingSummaryForPatient(bookingId, patient.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="py-10">
      <PageContainer>
        <BookingSummaryCard
          booking={booking}
          title={arMessages.bookings.summaryTitle}
          description={arMessages.bookings.summaryDescription}
          actions={
            booking.status === BookingStatus.HOLD ||
            booking.status === BookingStatus.PAYMENT_PENDING ? (
              <Link
                href={`/bookings/${booking.id}/payment`}
                className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                {arMessages.bookings.continueToPayment}
              </Link>
            ) : undefined
          }
        />
      </PageContainer>
    </div>
  );
}
