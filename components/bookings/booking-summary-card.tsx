import Link from "next/link";
import type { ReactNode } from "react";
import type { BookingSummaryViewModel, PaymentViewModel } from "@/services/bookings";
import { arMessages } from "@/lib/config/messages/ar";
import { BookingStatusPill } from "@/components/bookings/booking-status-pill";

type BookingSummaryCardProps = {
  booking: BookingSummaryViewModel | PaymentViewModel;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function BookingSummaryCard({
  booking,
  title,
  description,
  actions,
}: BookingSummaryCardProps) {
  const messages = arMessages.bookings;
  const bookingStatus = "status" in booking ? booking.status : booking.bookingStatus;

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.42)] sm:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <BookingStatusPill type="booking" status={bookingStatus} />
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <dl className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">{messages.therapistLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">{booking.therapistName}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">{messages.slotLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">{booking.selectedSlotLabel}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">{messages.priceLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">{booking.sessionPriceSar}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-sm text-slate-500">{messages.holdExpiresLabel}</dt>
          <dd className="mt-1 font-semibold text-slate-900">{booking.holdExpiresAtLabel}</dd>
        </div>
      </dl>

      {"paymentStatus" in booking && booking.paymentStatus ? (
        <div className="mt-4">
          <BookingStatusPill type="payment" status={booking.paymentStatus} />
        </div>
      ) : null}

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        {booking.holdActive ? messages.holdActiveNotice : messages.holdExpiredNotice}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {actions}
        <Link
          href={`/therapists/${booking.therapistSlug}`}
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {messages.backToTherapist}
        </Link>
      </div>
    </section>
  );
}
