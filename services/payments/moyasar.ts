import { Buffer } from "node:buffer";
import { getMoyasarClientConfig, getMoyasarServerConfig } from "@/lib/config/moyasar";
import type { HostedCardPaymentConfig, VerifiedProviderPayment } from "@/services/payments/types";

type MoyasarPaymentResponse = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown> | null;
  source?: {
    type?: string;
    company?: string | null;
    gateway_id?: string | null;
    message?: string | null;
    transaction_url?: string | null;
  } | null;
};

function buildAuthorizationHeader(secretKey: string) {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

function normalizeStatus(status: string): VerifiedProviderPayment["normalizedStatus"] {
  if (status === "paid" || status === "captured" || status === "verified") {
    return "success";
  }

  if (status === "failed") {
    return "failed";
  }

  return "pending";
}

function normalizeMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata) {
    return {};
  }

  return Object.entries(metadata).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === "string") {
      result[key] = value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      result[key] = String(value);
    }

    return result;
  }, {});
}

export function buildHostedCardPaymentConfig(input: {
  amountHalalas: number;
  bookingId: string;
  paymentId: string;
  therapistName: string;
}) {
  const clientConfig = getMoyasarClientConfig();

  const config: HostedCardPaymentConfig = {
    amountHalalas: input.amountHalalas,
    callbackUrl: new URL(
      `/bookings/${input.bookingId}/payment/callback`,
      clientConfig.siteUrl,
    ).toString(),
    currency: "SAR",
    description: `جلسة علاجية مع ${input.therapistName}`,
    metadata: {
      booking_id: input.bookingId,
      payment_record_id: input.paymentId,
    },
    publishableKey: clientConfig.publishableKey,
  };

  return {
    ...config,
    scriptUrl: clientConfig.scriptUrl,
    stylesheetUrl: clientConfig.stylesheetUrl,
  };
}

export async function fetchVerifiedMoyasarPayment(paymentId: string) {
  const serverConfig = getMoyasarServerConfig();
  const response = await fetch(
    `${serverConfig.apiBaseUrl}/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: buildAuthorizationHeader(serverConfig.secretKey),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`moyasar-fetch-failed:${response.status}`);
  }

  const data = (await response.json()) as MoyasarPaymentResponse;

  const verifiedPayment: VerifiedProviderPayment = {
    provider: "moyasar",
    providerPaymentId: data.id,
    rawStatus: data.status,
    normalizedStatus: normalizeStatus(data.status),
    amount: data.amount,
    currency: data.currency,
    transactionUrl: data.source?.transaction_url ?? null,
    metadata: normalizeMetadata(data.metadata),
    responseSnapshot: data as unknown as Record<string, unknown>,
  };

  return verifiedPayment;
}
