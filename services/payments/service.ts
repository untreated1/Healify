import {
  buildHostedCardPaymentConfig,
  fetchVerifiedMoyasarPayment,
} from "@/services/payments/moyasar";

export function buildCardPaymentProviderConfig(input: {
  amountHalalas: number;
  bookingId: string;
  paymentId: string;
  therapistName: string;
}) {
  return buildHostedCardPaymentConfig(input);
}

export async function verifyProviderPayment(provider: string, paymentId: string) {
  if (provider !== "moyasar") {
    throw new Error(`Unsupported payment provider: ${provider}`);
  }

  return fetchVerifiedMoyasarPayment(paymentId);
}
