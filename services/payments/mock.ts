import { PaymentStatus } from "@prisma/client";

export type MockPaymentOutcome = "success" | "failed";

export function simulateMockPayment(outcome: MockPaymentOutcome) {
  if (outcome === "success") {
    return {
      status: PaymentStatus.SUCCESS,
      providerRef: `mock_success_${Date.now()}`,
      errorMessage: null,
    };
  }

  return {
    status: PaymentStatus.FAILED,
    providerRef: `mock_failed_${Date.now()}`,
    errorMessage: "mock-payment-failed",
  };
}
