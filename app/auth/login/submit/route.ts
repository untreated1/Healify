import { NextResponse } from "next/server";
import { sanitizeRedirectPath, setSessionCookie } from "@/lib/auth/session";
import { loginPatient } from "@/services/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  const result = await loginPatient({
    email,
    password,
    redirectTo,
  });

  if (!result.ok) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", result.error ?? "unknown");

    if (redirectTo !== "/") {
      loginUrl.searchParams.set("redirectTo", redirectTo);
    }

    return NextResponse.redirect(loginUrl, { status: 303 });
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
