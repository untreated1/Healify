import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { BookingSummaryCard } from "@/components/bookings/booking-summary-card";
import { MoyasarPaymentForm } from "@/components/bookings/moyasar-payment-form";
import { PageContainer } from "@/components/layout/page-container";
import { requirePatientUser } from "@/lib/auth/session";
import { arMessages } from "@/lib/config/messages/ar";
import { buildPageMetadata } from "@/lib/seo";
import { prepareBookingForPayment } from "@/services/bookings";
import { buildCardPaymentProviderConfig } from "@/services/payments";

export const metadata: Metadata = buildPageMetadata({
  title: arMessages.bookings.paymentTitle,
  description: arMessages.bookings.paymentDescription,
  path: "/bookings/payment",
});

type BookingPaymentPageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getStatusMessage(status?: string) {
  if (status === "failed") {
    return arMessages.bookings.paymentFailureNotice;
  }

  if (status === "expired") {
    return arMessages.bookings.paymentExpiredNotice;
  }

  if (status === "processing") {
    return arMessages.bookings.paymentProcessingNotice;
  }

  return null;
}

export default async function BookingPaymentPage({
  params,
  searchParams,
}: BookingPaymentPageProps) {
  const { bookingId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const patient = await requirePatientUser(`/bookings/${bookingId}/payment`);
  const payment = await prepareBookingForPayment(bookingId, patient.id);

  if (!payment) {
    notFound();
  }

  const status =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  const statusMessage = getStatusMessage(status);

  const showHostedForm =
    payment.holdActive &&
    (payment.bookingStatus === BookingStatus.HOLD ||
      payment.bookingStatus === BookingStatus.PAYMENT_PENDING);

  const providerConfig = showHostedForm
    ? buildCardPaymentProviderConfig({
        amountHalalas: payment.amountHalalas,
        bookingId: payment.bookingId,
        paymentId: payment.paymentId,
        therapistName: payment.therapistName,
      })
    : null;

  return (
    <div className="py-10">
      <PageContainer className="space-y-6">
        {statusMessage ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
            {statusMessage}
          </div>
        ) : null}

        <BookingSummaryCard
          booking={payment}
          title={arMessages.bookings.paymentTitle}
          description={arMessages.bookings.paymentDescription}
          actions={
            payment.bookingStatus === BookingStatus.CONFIRMED ? (
              <Link
                href={`/bookings/${payment.bookingId}/confirmation`}
                className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                {arMessages.bookings.confirmationAction}
              </Link>
            ) : payment.canRetry ? (
              <Link
                href={`/therapists/${payment.therapistSlug}`}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {arMessages.bookings.retryAction}
              </Link>
            ) : undefined
          }
        />

        {showHostedForm && providerConfig ? (
          <MoyasarPaymentForm
            amountHalalas={providerConfig.amountHalalas}
            bookingId={payment.bookingId}
            callbackUrl={providerConfig.callbackUrl}
            description={providerConfig.description}
            paymentId={payment.paymentId}
            publishableKey={providerConfig.publishableKey}
            scriptUrl={providerConfig.scriptUrl}
            stylesheetUrl={providerConfig.stylesheetUrl}
          />
        ) : null}
      </PageContainer>
    </div>
  );
}
