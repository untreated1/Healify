import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthPayload } from "@/services/auth/types";

const prisma = getPrisma();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type AuthValidationSuccess = {
  ok: true;
  value: {
    email: string;
    password: string;
    fullName?: string;
  };
};

type AuthValidationFailure = {
  ok: false;
  error: "missing-email" | "weak-password" | "missing-name";
};

type AuthValidationResult = AuthValidationSuccess | AuthValidationFailure;

export function validateAuthPayload(
  payload: AuthPayload,
  mode: "login" | "signup",
): AuthValidationResult {
  const email = normalizeEmail(payload.email);
  const password = payload.password.trim();
  const fullName = payload.fullName?.trim();

  if (!email) {
    return { ok: false, error: "missing-email" };
  }

  if (password.length < 8) {
    return { ok: false, error: "weak-password" };
  }

  if (mode === "signup" && !fullName) {
    return { ok: false, error: "missing-name" };
  }

  return {
    ok: true,
    value: {
      email,
      password,
      fullName,
    },
  };
}

export async function registerPatient(payload: AuthPayload) {
  const parsed = validateAuthPayload(payload, "signup");

  if (!parsed.ok) {
    return {
      ok: false as const,
      error: parsed.error,
    };
  }

  const { email, password, fullName } = parsed.value;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false as const,
      error: "email-in-use" as const,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: fullName!,
      email,
      passwordHash,
      role: UserRole.PATIENT,
      patientProfile: {
        create: {},
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  return {
    ok: true as const,
    user,
  };
}

export async function loginPatient(payload: AuthPayload) {
  const parsed = validateAuthPayload(payload, "login");

  if (!parsed.ok) {
    return {
      ok: false as const,
      error: parsed.error,
    };
  }

  const { email, password } = parsed.value;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      ok: false as const,
      error: "invalid-credentials" as const,
    };
  }

  if (user.role !== UserRole.PATIENT) {
    return {
      ok: false as const,
      error: "patient-only" as const,
    };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      ok: false as const,
      error: "invalid-credentials" as const,
    };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}
