export type HostedCardPaymentConfig = {
  amountHalalas: number;
  callbackUrl: string;
  currency: "SAR";
  description: string;
  metadata: Record<string, string>;
  publishableKey: string;
};

export type VerifiedProviderPayment = {
  provider: "moyasar";
  providerPaymentId: string;
  rawStatus: string;
  normalizedStatus: "pending" | "success" | "failed";
  amount: number;
  currency: string;
  transactionUrl: string | null;
  metadata: Record<string, string>;
  responseSnapshot: Record<string, unknown>;
};
