"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

type MoyasarPaymentFormProps = {
  amountHalalas: number;
  bookingId: string;
  callbackUrl: string;
  description: string;
  paymentId: string;
  publishableKey: string;
  scriptUrl: string;
  stylesheetUrl: string;
};

export function MoyasarPaymentForm({
  amountHalalas,
  bookingId,
  callbackUrl,
  description,
  paymentId,
  publishableKey,
  scriptUrl,
  stylesheetUrl,
}: MoyasarPaymentFormProps) {
  const containerId = `moyasar-form-${bookingId}`;
  const initializedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const existingLink = document.querySelector<HTMLLinkElement>(
      'link[data-moyasar-stylesheet="true"]',
    );

    if (existingLink) {
      return;
    }

    const stylesheetLink = document.createElement("link");
    stylesheetLink.rel = "stylesheet";
    stylesheetLink.href = stylesheetUrl;
    stylesheetLink.dataset.moyasarStylesheet = "true";
    document.head.appendChild(stylesheetLink);
  }, [stylesheetUrl]);

  useEffect(() => {
    if (!scriptLoaded || initializedRef.current || !window.Moyasar) {
      return;
    }

    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    window.Moyasar.init({
      element: `#${containerId}`,
      amount: amountHalalas,
      currency: "SAR",
      description,
      publishable_api_key: publishableKey,
      callback_url: callbackUrl,
      methods: ["creditcard"],
      metadata: {
        booking_id: bookingId,
        payment_record_id: paymentId,
      },
    });

    initializedRef.current = true;
  }, [
    amountHalalas,
    bookingId,
    callbackUrl,
    containerId,
    description,
    paymentId,
    publishableKey,
    scriptLoaded,
  ]);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.42)] sm:p-8">
      <Script src={scriptUrl} strategy="afterInteractive" onLoad={() => setScriptLoaded(true)} />
      <div id={containerId} />
    </div>
  );
}
