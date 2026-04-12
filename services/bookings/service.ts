import {
  AvailabilityStatus,
  BookingStatus,
  PaymentStatus,
  Prisma,
  TherapistStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import { formatCurrencySar, formatSaudiDateTime } from "@/lib/formatters";
import { verifyProviderPayment } from "@/services/payments";
import type {
  BookingStateTransition,
  BookingSummaryViewModel,
  PaymentVerificationResult,
  PaymentStateTransition,
  PaymentViewModel,
} from "@/services/bookings/types";

const prisma = getPrisma();
const HOLD_DURATION_MS = 10 * 60 * 1000;

const bookingTransitions: Record<BookingStatus, BookingStatus[]> = {
  HOLD: [BookingStatus.PAYMENT_PENDING, BookingStatus.EXPIRED, BookingStatus.CANCELLED],
  PAYMENT_PENDING: [
    BookingStatus.CONFIRMED,
    BookingStatus.PAYMENT_FAILED,
    BookingStatus.EXPIRED,
    BookingStatus.CANCELLED,
  ],
  CONFIRMED: [],
  PAYMENT_FAILED: [],
  EXPIRED: [],
  CANCELLED: [],
};

const paymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  INITIATED: [PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.EXPIRED],
  SUCCESS: [],
  FAILED: [],
  EXPIRED: [],
};

type TransactionClient = Prisma.TransactionClient;

type BookingRecord = Prisma.BookingGetPayload<{
  include: {
    therapist: {
      include: {
        user: {
          select: {
            fullName: true;
          };
        };
      };
    };
    availabilitySlot: true;
    payment: {
      include: {
        attempts: true;
      };
    };
  };
}>;

function getHoldExpirationDate(from = new Date()) {
  return new Date(from.getTime() + HOLD_DURATION_MS);
}

function isHoldWindowExpired(booking: { holdExpiresAt: Date }) {
  return booking.holdExpiresAt.getTime() <= Date.now();
}

function toHalalas(amount: Prisma.Decimal | number | string) {
  return Math.round(Number(amount) * 100);
}

function assertBookingTransition(transition: BookingStateTransition) {
  if (transition.from === null) {
    return;
  }

  const allowed = bookingTransitions[transition.from] ?? [];
  if (!allowed.includes(transition.to)) {
    throw new Error(
      `Invalid booking transition from ${transition.from} to ${transition.to}.`,
    );
  }
}

function assertPaymentTransition(transition: PaymentStateTransition) {
  if (transition.from === null) {
    return;
  }

  const allowed = paymentTransitions[transition.from] ?? [];
  if (!allowed.includes(transition.to)) {
    throw new Error(
      `Invalid payment transition from ${transition.from} to ${transition.to}.`,
    );
  }
}

async function addBookingHistoryTx(
  tx: TransactionClient,
  bookingId: string,
  transition: BookingStateTransition,
  actorUserId?: string,
) {
  await tx.bookingStatusHistory.create({
    data: {
      bookingId,
      fromStatus: transition.from,
      toStatus: transition.to,
      note: transition.note,
      actorUserId,
    },
  });
}

async function transitionBookingStatusTx(
  tx: TransactionClient,
  booking: { id: string; status: BookingStatus },
  transition: BookingStateTransition,
  actorUserId?: string,
) {
  assertBookingTransition(transition);

  const updated = await tx.booking.update({
    where: { id: booking.id },
    data: {
      status: transition.to,
      confirmedAt:
        transition.to === BookingStatus.CONFIRMED ? new Date() : undefined,
      cancelledAt:
        transition.to === BookingStatus.CANCELLED ? new Date() : undefined,
    },
  });

  await addBookingHistoryTx(tx, booking.id, transition, actorUserId);
  return updated;
}

async function transitionPaymentStatusTx(
  tx: TransactionClient,
  payment: { id: string; status: PaymentStatus },
  transition: PaymentStateTransition,
) {
  assertPaymentTransition(transition);

  return tx.payment.update({
    where: { id: payment.id },
    data: {
      status: transition.to,
      lastError: transition.note ?? undefined,
      completedAt:
        transition.to === PaymentStatus.SUCCESS ? new Date() : undefined,
    },
  });
}

async function ensureBookingPaymentPendingTx(
  tx: TransactionClient,
  booking: BookingRecord,
  actorUserId: string,
) {
  if (booking.status === BookingStatus.HOLD) {
    await transitionBookingStatusTx(
      tx,
      booking,
      {
        from: BookingStatus.HOLD,
        to: BookingStatus.PAYMENT_PENDING,
        note: "payment-started",
      },
      actorUserId,
    );

    return (await lockBookingTx(tx, booking.id)) as BookingRecord;
  }

  return booking;
}

async function upsertMoyasarPaymentTx(
  tx: TransactionClient,
  booking: BookingRecord,
) {
  if (!booking.payment) {
    await tx.payment.create({
      data: {
        bookingId: booking.id,
        status: PaymentStatus.INITIATED,
        amountSar: booking.sessionPriceSar,
        provider: "moyasar",
        initiatedAt: new Date(),
        expiresAt: booking.holdExpiresAt,
      },
    });

    return (await lockBookingTx(tx, booking.id)) as BookingRecord;
  }

  if (booking.payment.provider !== "moyasar") {
    await tx.payment.update({
      where: { id: booking.payment.id },
      data: {
        provider: "moyasar",
        expiresAt: booking.holdExpiresAt,
        initiatedAt: booking.payment.initiatedAt ?? new Date(),
      },
    });

    return (await lockBookingTx(tx, booking.id)) as BookingRecord;
  }

  await tx.payment.update({
    where: { id: booking.payment.id },
    data: {
      expiresAt: booking.holdExpiresAt,
      initiatedAt: booking.payment.initiatedAt ?? new Date(),
    },
  });

  return (await lockBookingTx(tx, booking.id)) as BookingRecord;
}

async function lockSlotTx(tx: TransactionClient, slotId: string) {
  await tx.$queryRaw`SELECT id FROM "TherapistAvailability" WHERE id = ${slotId} FOR UPDATE`;

  return tx.therapistAvailability.findUnique({
    where: { id: slotId },
    include: {
      therapist: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });
}

async function lockBookingTx(tx: TransactionClient, bookingId: string) {
  await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;

  return tx.booking.findUnique({
    where: { id: bookingId },
    include: {
      therapist: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
      availabilitySlot: true,
      payment: {
        include: {
          attempts: true,
        },
      },
    },
  }) as Promise<BookingRecord | null>;
}

async function releaseSlotTx(tx: TransactionClient, slotId: string) {
  await tx.therapistAvailability.update({
    where: { id: slotId },
    data: { status: AvailabilityStatus.AVAILABLE },
  });
}

async function expireBookingTx(
  tx: TransactionClient,
  booking: BookingRecord,
  note = "hold-expired",
) {
  if (
    booking.status !== BookingStatus.HOLD &&
    booking.status !== BookingStatus.PAYMENT_PENDING
  ) {
    return booking;
  }

  const updatedBooking = await transitionBookingStatusTx(
    tx,
    booking,
    {
      from: booking.status,
      to: BookingStatus.EXPIRED,
      note,
    },
    booking.patientUserId,
  );

  if (booking.payment && booking.payment.status === PaymentStatus.INITIATED) {
    await transitionPaymentStatusTx(tx, booking.payment, {
      from: booking.payment.status,
      to: PaymentStatus.EXPIRED,
      note,
    });
  }

  await releaseSlotTx(tx, booking.availabilitySlotId);

  return {
    ...booking,
    ...updatedBooking,
    status: BookingStatus.EXPIRED,
  };
}

function mapBookingSummary(record: BookingRecord): BookingSummaryViewModel {
  return {
    id: record.id,
    status: record.status,
    therapistName: record.therapist.user.fullName,
    therapistSlug: record.therapist.slug,
    sessionPriceSar: formatCurrencySar(record.sessionPriceSar),
    selectedSlotLabel: formatSaudiDateTime(record.availabilitySlot.startsAtUtc),
    holdExpiresAtIso: record.holdExpiresAt.toISOString(),
    holdExpiresAtLabel: formatSaudiDateTime(record.holdExpiresAt),
    holdActive:
      (record.status === BookingStatus.HOLD ||
        record.status === BookingStatus.PAYMENT_PENDING) &&
      !isHoldWindowExpired(record),
    paymentStatus: record.payment?.status ?? null,
  };
}

function mapPaymentViewModel(record: BookingRecord): PaymentViewModel {
  return {
    bookingId: record.id,
    paymentId: record.payment?.id ?? "",
    bookingStatus: record.status,
    paymentStatus: record.payment?.status ?? null,
    amountHalalas: toHalalas(record.sessionPriceSar),
    therapistName: record.therapist.user.fullName,
    therapistSlug: record.therapist.slug,
    sessionPriceSar: formatCurrencySar(record.sessionPriceSar),
    selectedSlotLabel: formatSaudiDateTime(record.availabilitySlot.startsAtUtc),
    holdExpiresAtIso: record.holdExpiresAt.toISOString(),
    holdExpiresAtLabel: formatSaudiDateTime(record.holdExpiresAt),
    holdActive:
      (record.status === BookingStatus.HOLD ||
        record.status === BookingStatus.PAYMENT_PENDING) &&
      !isHoldWindowExpired(record),
    canRetry: record.status === BookingStatus.PAYMENT_FAILED,
  };
}

export async function createOrReuseBookingHold(input: {
  patientUserId: string;
  slotId: string;
}) {
  const now = new Date();

  const booking = await prisma.$transaction(async (tx) => {
    const slot = await lockSlotTx(tx, input.slotId);

    if (!slot || slot.therapist.status !== TherapistStatus.ACTIVE) {
      throw new Error("slot-not-found");
    }

    if (slot.startsAtUtc.getTime() <= now.getTime()) {
      throw new Error("slot-expired");
    }

    const existingBookings = await tx.booking.findMany({
      where: {
        availabilitySlotId: input.slotId,
        status: {
          in: [
            BookingStatus.HOLD,
            BookingStatus.PAYMENT_PENDING,
            BookingStatus.CONFIRMED,
          ],
        },
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        availabilitySlot: true,
        payment: {
          include: {
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as BookingRecord[];

    for (const existing of existingBookings) {
      if (
        (existing.status === BookingStatus.HOLD ||
          existing.status === BookingStatus.PAYMENT_PENDING) &&
        isHoldWindowExpired(existing)
      ) {
        await expireBookingTx(tx, existing);
      }
    }

    const freshActiveBooking = await tx.booking.findFirst({
      where: {
        availabilitySlotId: input.slotId,
        status: {
          in: [
            BookingStatus.HOLD,
            BookingStatus.PAYMENT_PENDING,
            BookingStatus.CONFIRMED,
          ],
        },
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        availabilitySlot: true,
        payment: {
          include: {
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as BookingRecord | null;

    if (freshActiveBooking) {
      if (freshActiveBooking.patientUserId === input.patientUserId) {
        return freshActiveBooking;
      }

      throw new Error("slot-unavailable");
    }

    if (
      slot.status === AvailabilityStatus.BOOKED ||
      slot.status === AvailabilityStatus.BLOCKED
    ) {
      throw new Error("slot-unavailable");
    }

    const createdBooking = await tx.booking.create({
      data: {
        patientUserId: input.patientUserId,
        therapistId: slot.therapistId,
        availabilitySlotId: slot.id,
        status: BookingStatus.HOLD,
        holdExpiresAt: getHoldExpirationDate(now),
        sessionPriceSar: slot.therapist.sessionPriceSar,
      },
      include: {
        therapist: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        availabilitySlot: true,
        payment: {
          include: {
            attempts: true,
          },
        },
      },
    }) as BookingRecord;

    await tx.therapistAvailability.update({
      where: { id: slot.id },
      data: { status: AvailabilityStatus.HELD },
    });

    await addBookingHistoryTx(
      tx,
      createdBooking.id,
      {
        from: null,
        to: BookingStatus.HOLD,
        note: "hold-created",
      },
      input.patientUserId,
    );

    return createdBooking;
  });

  return mapBookingSummary(booking);
}

export async function getBookingSummaryForPatient(
  bookingId: string,
  patientUserId: string,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const lockedBooking = await lockBookingTx(tx, bookingId);

    if (!lockedBooking || lockedBooking.patientUserId !== patientUserId) {
      return null;
    }

    if (
      (lockedBooking.status === BookingStatus.HOLD ||
        lockedBooking.status === BookingStatus.PAYMENT_PENDING) &&
      isHoldWindowExpired(lockedBooking)
    ) {
      await expireBookingTx(tx, lockedBooking);

      return lockBookingTx(tx, bookingId);
    }

    return lockedBooking;
  });

  if (!booking) {
    return null;
  }

  return mapBookingSummary(booking);
}

export async function prepareBookingForPayment(
  bookingId: string,
  patientUserId: string,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const lockedBooking = await lockBookingTx(tx, bookingId);

    if (!lockedBooking || lockedBooking.patientUserId !== patientUserId) {
      return null;
    }

    if (
      (lockedBooking.status === BookingStatus.HOLD ||
        lockedBooking.status === BookingStatus.PAYMENT_PENDING) &&
      isHoldWindowExpired(lockedBooking)
    ) {
      await expireBookingTx(tx, lockedBooking);
      return lockBookingTx(tx, bookingId);
    }

    if (lockedBooking.status === BookingStatus.HOLD) {
      await transitionBookingStatusTx(tx, lockedBooking, {
        from: BookingStatus.HOLD,
        to: BookingStatus.PAYMENT_PENDING,
        note: "payment-started",
      }, patientUserId);
    }

    const refreshedBooking = (await lockBookingTx(tx, bookingId)) as BookingRecord;
    const bookingWithPayment = await upsertMoyasarPaymentTx(tx, refreshedBooking);

    return bookingWithPayment;
  });

  if (!booking) {
    return null;
  }

  return mapPaymentViewModel(booking);
}

export async function verifyMoyasarPaymentForBooking(input: {
  bookingId: string;
  patientUserId: string;
  providerPaymentId: string;
}): Promise<PaymentVerificationResult | null> {
  const verifiedPayment = await verifyProviderPayment("moyasar", input.providerPaymentId);

  console.info("[payments] payment verified", {
    bookingId: input.bookingId,
    providerPaymentId: verifiedPayment.providerPaymentId,
    status: verifiedPayment.rawStatus,
  });

  const booking = await prisma.$transaction(async (tx) => {
    const lockedBooking = await lockBookingTx(tx, input.bookingId);

    if (!lockedBooking || lockedBooking.patientUserId !== input.patientUserId) {
      return null;
    }

    await tx.$queryRaw`SELECT id FROM "TherapistAvailability" WHERE id = ${lockedBooking.availabilitySlotId} FOR UPDATE`;

    let workingBooking = await upsertMoyasarPaymentTx(tx, lockedBooking);
    const payment = workingBooking.payment;

    if (!payment) {
      throw new Error("payment-record-missing");
    }

    const existingProviderPayment = await tx.payment.findUnique({
      where: { providerPaymentId: verifiedPayment.providerPaymentId },
      select: {
        bookingId: true,
      },
    });

    if (
      existingProviderPayment &&
      existingProviderPayment.bookingId !== workingBooking.id
    ) {
      throw new Error("payment-provider-id-conflict");
    }

    if (workingBooking.status === BookingStatus.CONFIRMED) {
      return workingBooking;
    }

    if (verifiedPayment.currency !== "SAR") {
      throw new Error("payment-currency-mismatch");
    }

    if (verifiedPayment.amount !== toHalalas(workingBooking.sessionPriceSar)) {
      throw new Error("payment-amount-mismatch");
    }

    if (verifiedPayment.metadata.booking_id !== workingBooking.id) {
      throw new Error("payment-booking-mismatch");
    }

    if (
      verifiedPayment.metadata.payment_record_id &&
      verifiedPayment.metadata.payment_record_id !== payment.id
    ) {
      throw new Error("payment-record-mismatch");
    }

    if (payment.status === PaymentStatus.INITIATED) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          provider: "moyasar",
          providerPaymentId: verifiedPayment.providerPaymentId,
          providerRawStatus: verifiedPayment.rawStatus,
          providerTransactionUrl: verifiedPayment.transactionUrl,
          providerResponseSnapshot:
            verifiedPayment.responseSnapshot as Prisma.InputJsonValue,
          verifiedAt: new Date(),
        },
      });

      workingBooking = (await lockBookingTx(tx, input.bookingId)) as BookingRecord;
    }

    if (
      workingBooking.status === BookingStatus.EXPIRED ||
      workingBooking.status === BookingStatus.CANCELLED ||
      workingBooking.status === BookingStatus.PAYMENT_FAILED
    ) {
      return workingBooking;
    }

    if (verifiedPayment.normalizedStatus === "pending") {
      return ensureBookingPaymentPendingTx(
        tx,
        workingBooking,
        input.patientUserId,
      );
    }

    if (isHoldWindowExpired(workingBooking)) {
      if (workingBooking.payment?.status === PaymentStatus.INITIATED) {
        await transitionPaymentStatusTx(tx, workingBooking.payment, {
          from: PaymentStatus.INITIATED,
          to: PaymentStatus.EXPIRED,
          note: "verified-after-expiry",
        });
      }

      await transitionBookingStatusTx(
        tx,
        workingBooking,
        {
          from: workingBooking.status,
          to: BookingStatus.EXPIRED,
          note: "verified-after-expiry",
        },
        input.patientUserId,
      );

      await releaseSlotTx(tx, workingBooking.availabilitySlotId);
      return (await lockBookingTx(tx, input.bookingId)) as BookingRecord;
    }

    workingBooking = await ensureBookingPaymentPendingTx(tx, workingBooking, input.patientUserId);

    if (verifiedPayment.normalizedStatus === "failed") {
      if (workingBooking.payment?.status === PaymentStatus.INITIATED) {
        await transitionPaymentStatusTx(tx, workingBooking.payment, {
          from: PaymentStatus.INITIATED,
          to: PaymentStatus.FAILED,
          note: "moyasar-payment-failed",
        });
      }

      await transitionBookingStatusTx(
        tx,
        workingBooking,
        {
          from: BookingStatus.PAYMENT_PENDING,
          to: BookingStatus.PAYMENT_FAILED,
          note: "moyasar-payment-failed",
        },
        input.patientUserId,
      );

      await releaseSlotTx(tx, workingBooking.availabilitySlotId);
      return (await lockBookingTx(tx, input.bookingId)) as BookingRecord;
    }

    if (workingBooking.payment?.status === PaymentStatus.INITIATED) {
      await transitionPaymentStatusTx(tx, workingBooking.payment, {
        from: PaymentStatus.INITIATED,
        to: PaymentStatus.SUCCESS,
      });
    }

    await transitionBookingStatusTx(
      tx,
      workingBooking,
      {
        from: BookingStatus.PAYMENT_PENDING,
        to: BookingStatus.CONFIRMED,
        note: "moyasar-payment-verified",
      },
      input.patientUserId,
    );

    await tx.therapistAvailability.update({
      where: { id: workingBooking.availabilitySlotId },
      data: { status: AvailabilityStatus.BOOKED },
    });

    return (await lockBookingTx(tx, input.bookingId)) as BookingRecord;
  });

  if (!booking) {
    return null;
  }

  if (booking.status === BookingStatus.CONFIRMED) {
    console.info("[payments] booking confirmed", {
      bookingId: booking.id,
      providerPaymentId: input.providerPaymentId,
    });
  }

  if (booking.status === BookingStatus.PAYMENT_FAILED) {
    console.info("[payments] payment failed", {
      bookingId: booking.id,
      providerPaymentId: input.providerPaymentId,
    });
  }

  const paymentViewModel = mapPaymentViewModel(booking);

  if (booking.status === BookingStatus.CONFIRMED) {
    return {
      outcome: "confirmed",
      booking: paymentViewModel,
    };
  }

  if (booking.status === BookingStatus.EXPIRED) {
    return {
      outcome: "expired",
      booking: paymentViewModel,
    };
  }

  if (booking.status === BookingStatus.PAYMENT_FAILED) {
    return {
      outcome: "failed",
      booking: paymentViewModel,
    };
  }

  return {
    outcome: "pending",
    booking: paymentViewModel,
  };
}

export async function reconcilePendingPayments(options?: {
  olderThanMinutes?: number;
}) {
  const olderThanMinutes = options?.olderThanMinutes ?? 5;
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);

  const candidates = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PAYMENT_PENDING,
      createdAt: {
        lt: cutoff,
      },
      payment: {
        is: {
          status: PaymentStatus.INITIATED,
          provider: "moyasar",
          providerPaymentId: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
      patientUserId: true,
      payment: {
        select: {
          providerPaymentId: true,
        },
      },
    },
  });

  let processed = 0;

  for (const candidate of candidates) {
    const providerPaymentId = candidate.payment?.providerPaymentId;

    if (!providerPaymentId) {
      continue;
    }

    try {
      await verifyMoyasarPaymentForBooking({
        bookingId: candidate.id,
        patientUserId: candidate.patientUserId,
        providerPaymentId,
      });
      processed += 1;
    } catch (error) {
      console.error("[payments] reconcile pending payment failed", {
        bookingId: candidate.id,
        providerPaymentId,
        error: error instanceof Error ? error.message : "unknown-error",
      });
    }
  }

  return {
    scanned: candidates.length,
    processed,
  };
}

export async function getBookingConfirmationForPatient(
  bookingId: string,
  patientUserId: string,
) {
  const booking = await getBookingSummaryForPatient(bookingId, patientUserId);

  if (!booking || booking.status !== BookingStatus.CONFIRMED) {
    return null;
  }

  return booking;
}
