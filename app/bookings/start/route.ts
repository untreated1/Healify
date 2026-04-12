import { NextResponse } from "next/server";
import { getCurrentSessionUser, sanitizeRedirectPath } from "@/lib/auth/session";
import { createOrReuseBookingHold } from "@/services/bookings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slotId = searchParams.get("slotId");
  const therapistSlug = searchParams.get("therapistSlug");

  if (!slotId || !therapistSlug) {
    return NextResponse.redirect(new URL("/therapists", request.url));
  }

  const redirectPath = sanitizeRedirectPath(
    `/bookings/start?slotId=${encodeURIComponent(slotId)}&therapistSlug=${encodeURIComponent(therapistSlug)}`,
  );
  const patient = await getCurrentSessionUser();

  if (!patient || patient.role !== "PATIENT") {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", redirectPath);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  try {
    const booking = await createOrReuseBookingHold({
      patientUserId: patient.id,
      slotId,
    });

    return NextResponse.redirect(new URL(`/bookings/${booking.id}`, request.url), {
      status: 303,
    });
  } catch (error) {
    const profileUrl = new URL(`/therapists/${therapistSlug}`, request.url);
    const errorCode =
      error instanceof Error &&
      (error.message === "slot-expired" || error.message === "slot-unavailable")
        ? error.message
        : "slot-unavailable";

    profileUrl.searchParams.set("bookingError", errorCode);

    return NextResponse.redirect(profileUrl, { status: 303 });
  }
}
