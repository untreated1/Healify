import { BookingStatus, PaymentStatus } from "@prisma/client";

export type BookingStateTransition = {
  from: BookingStatus | null;
  to: BookingStatus;
  note?: string;
};

export type PaymentStateTransition = {
  from: PaymentStatus | null;
  to: PaymentStatus;
  note?: string;
};

export type BookingSummaryViewModel = {
  id: string;
  status: BookingStatus;
  therapistName: string;
  therapistSlug: string;
  sessionPriceSar: string;
  selectedSlotLabel: string;
  holdExpiresAtIso: string;
  holdExpiresAtLabel: string;
  holdActive: boolean;
  paymentStatus: PaymentStatus | null;
};

export type PaymentViewModel = {
  bookingId: string;
  paymentId: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus | null;
  amountHalalas: number;
  therapistName: string;
  therapistSlug: string;
  sessionPriceSar: string;
  selectedSlotLabel: string;
  holdExpiresAtIso: string;
  holdExpiresAtLabel: string;
  holdActive: boolean;
  canRetry: boolean;
};

export type PaymentVerificationResult = {
  outcome: "confirmed" | "failed" | "expired" | "pending";
  booking: PaymentViewModel;
};
