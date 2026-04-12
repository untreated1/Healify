import { BookingStatus, PaymentStatus } from "@prisma/client";
import { arMessages } from "@/lib/config/messages/ar";

type BookingStatusPillProps =
  | {
      type: "booking";
      status: BookingStatus;
    }
  | {
      type: "payment";
      status: PaymentStatus;
    };

export function BookingStatusPill(props: BookingStatusPillProps) {
  const bookingStateClasses: Record<BookingStatus, string> = {
    HOLD: "bg-amber-100 text-amber-800",
    PAYMENT_PENDING: "bg-sky-100 text-sky-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    PAYMENT_FAILED: "bg-rose-100 text-rose-800",
    EXPIRED: "bg-slate-200 text-slate-700",
    CANCELLED: "bg-slate-200 text-slate-700",
  };

  const paymentStateClasses: Record<PaymentStatus, string> = {
    INITIATED: "bg-sky-100 text-sky-800",
    SUCCESS: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-rose-100 text-rose-800",
    EXPIRED: "bg-slate-200 text-slate-700",
  };

  if (props.type === "booking") {
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${bookingStateClasses[props.status]}`}>
        {arMessages.bookings.states[props.status]}
      </span>
    );
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStateClasses[props.status]}`}>
      {arMessages.bookings.paymentStates[props.status]}
    </span>
  );
}
