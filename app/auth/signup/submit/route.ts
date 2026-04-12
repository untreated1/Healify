import { NextResponse } from "next/server";
import { sanitizeRedirectPath, setSessionCookie } from "@/lib/auth/session";
import { registerPatient } from "@/services/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  const result = await registerPatient({
    fullName,
    email,
    password,
    redirectTo,
  });

  if (!result.ok) {
    const signupUrl = new URL("/auth/signup", request.url);
    signupUrl.searchParams.set("error", result.error ?? "unknown");

    if (redirectTo !== "/") {
      signupUrl.searchParams.set("redirectTo", redirectTo);
    }

    return NextResponse.redirect(signupUrl, { status: 303 });
  }

  await setSessionCookie({
    sub: result.user.id,
    role: result.user.role,
    email: result.user.email,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url), {
    status: 303,
  });
}
