import { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db/prisma";

const SESSION_COOKIE_NAME = "healify_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  role: UserRole;
  email?: string | null;
};

type SessionClaims = {
  userId: string;
  role: UserRole;
  email: string | null;
};

export function sanitizeRedirectPath(value?: string | null) {
  const path = value?.trim();

  if (!path) {
    return "/";
  }

  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(path)
  ) {
    return "/";
  }

  try {
    const parsed = new URL(path, "http://healify.local");

    if (
      parsed.origin !== "http://healify.local" ||
      !parsed.pathname.startsWith("/")
    ) {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required.");
  }

  return new TextEncoder().encode(secret);
}

export async function readSessionPayload(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (!payload.sub || !payload.role) {
      return null;
    }

    return {
      userId: String(payload.sub),
      role: payload.role as UserRole,
      email: (payload.email as string | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({
    role: payload.role,
    email: payload.email ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getCurrentSessionUser() {
  const session = await readSessionPayload();

  if (!session) {
    return null;
  }

  return getPrisma().user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });
}

export async function requireAuthenticatedUser(redirectTo?: string) {
  const user = await getCurrentSessionUser();

  if (!user) {
    const safeRedirectTo = sanitizeRedirectPath(redirectTo);
    const loginPath =
      safeRedirectTo === "/"
        ? "/auth/login"
        : `/auth/login?redirectTo=${encodeURIComponent(safeRedirectTo)}`;

    redirect(loginPath);
  }

  return user;
}

export async function requirePatientUser(redirectTo?: string) {
  const user = await requireAuthenticatedUser(redirectTo);

  if (user.role !== UserRole.PATIENT) {
    throw new Error("Only patient accounts can continue this action.");
  }

  return user;
}
