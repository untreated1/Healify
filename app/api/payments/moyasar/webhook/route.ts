import { getPrisma } from "@/lib/db/prisma";
import { verifyMoyasarPaymentForBooking } from "@/services/bookings";

type WebhookPayload = Record<string, unknown>;

function asObject(value: unknown): WebhookPayload | null {
  return typeof value === "object" && value !== null
    ? (value as WebhookPayload)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractWebhookFields(payload: WebhookPayload) {
  const data = asObject(payload.data) ?? payload;
  const metadata = asObject(data.metadata);

  return {
    providerPaymentId: asString(data.id),
    amount: asNumber(data.amount),
    currency: asString(data.currency),
    bookingId: asString(metadata?.booking_id),
  };
}

export async function POST(request: Request) {
  let payload: WebhookPayload = {};

  try {
    const parsed = await request.json();
    payload = asObject(parsed) ?? {};
  } catch {
    payload = {};
  }

  const { providerPaymentId, amount, currency, bookingId } =
    extractWebhookFields(payload);

  console.info("[payments] webhook received", {
    providerPaymentId,
    bookingId,
    amount,
    currency,
  });

  if (providerPaymentId && bookingId) {
    try {
      const booking = await getPrisma().booking.findUnique({
        where: { id: bookingId },
        select: {
          patientUserId: true,
        },
      });

      if (booking) {
        await verifyMoyasarPaymentForBooking({
          bookingId,
          patientUserId: booking.patientUserId,
          providerPaymentId,
        });
      }
    } catch (error) {
      console.error("[payments] webhook handling failed", {
        providerPaymentId,
        bookingId,
        error: error instanceof Error ? error.message : "unknown-error",
      });
    }
  }

  return new Response("ok", { status: 200 });
}
