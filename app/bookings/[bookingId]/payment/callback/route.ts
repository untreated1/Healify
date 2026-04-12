import { NextResponse } from "next/server";
import { getCurrentSessionUser, sanitizeRedirectPath } from "@/lib/auth/session";
import { verifyMoyasarPaymentForBooking } from "@/services/bookings";

export async function GET(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const requestUrl = new URL(request.url);
  const providerPaymentId = requestUrl.searchParams.get("id");
  const redirectTo = sanitizeRedirectPath(
    `${requestUrl.pathname}${requestUrl.search}`,
  );
  const patient = await getCurrentSessionUser();

  if (!patient || patient.role !== "PATIENT") {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  if (!providerPaymentId) {
    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}/payment?status=failed`, request.url),
      { status: 303 },
    );
  }

  if (!/^[A-Za-z0-9_-]{10,}$/.test(providerPaymentId)) {
    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}/payment?status=failed`, request.url),
      { status: 303 },
    );
  }

  try {
    const result = await verifyMoyasarPaymentForBooking({
      bookingId,
      patientUserId: patient.id,
      providerPaymentId,
    });

    if (!result) {
      return NextResponse.redirect(new URL(`/bookings/${bookingId}`, request.url), {
        status: 303,
      });
    }

    if (result.outcome === "confirmed") {
      return NextResponse.redirect(
        new URL(`/bookings/${bookingId}/confirmation`, request.url),
        { status: 303 },
      );
    }

    if (result.outcome === "expired") {
      return NextResponse.redirect(
        new URL(`/bookings/${bookingId}/payment?status=expired`, request.url),
        { status: 303 },
      );
    }

    if (result.outcome === "failed") {
      return NextResponse.redirect(
        new URL(`/bookings/${bookingId}/payment?status=failed`, request.url),
        { status: 303 },
      );
    }

    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}/payment?status=processing`, request.url),
      { status: 303 },
    );
  } catch {
    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}/payment?status=failed`, request.url),
      { status: 303 },
    );
  }
}
