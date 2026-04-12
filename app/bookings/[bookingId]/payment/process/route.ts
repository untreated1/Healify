import { NextResponse } from "next/server";
import { getCurrentSessionUser, sanitizeRedirectPath } from "@/lib/auth/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const patient = await getCurrentSessionUser();
  const paymentPath = sanitizeRedirectPath(`/bookings/${bookingId}/payment`);

  if (!patient || patient.role !== "PATIENT") {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", paymentPath);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  return NextResponse.redirect(new URL(paymentPath, request.url), {
    status: 303,
  });
}
