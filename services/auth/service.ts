import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import type { AuthPayload } from "@/services/auth/types";

const prisma = getPrisma();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateAuthPayload(payload: AuthPayload, mode: "login" | "signup") {
  const email = normalizeEmail(payload.email);
  const password = payload.password.trim();
  const fullName = payload.fullName?.trim();

  if (!email) {
    return { ok: false, error: "missing-email" as const };
  }

  if (password.length < 8) {
    return { ok: false, error: "weak-password" as const };
  }

  if (mode === "signup" && !fullName) {
    return { ok: false, error: "missing-name" as const };
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
      ok: false,
      error: parsed.error,
    };
  }

  const existing = await prisma.user.findUnique({
    where: {
      email: parsed.value.email,
    },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      error: "email-in-use",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.value.password, 12);
  const user = await prisma.user.create({
    data: {
      fullName: parsed.value.fullName!,
      email: parsed.value.email,
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
    ok: true,
    user,
  };
}

export async function loginPatient(payload: AuthPayload) {
  const parsed = validateAuthPayload(payload, "login");
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.value.email,
    },
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
      ok: false,
      error: "invalid-credentials",
    };
  }

  if (user.role !== UserRole.PATIENT) {
    return {
      ok: false,
      error: "patient-only",
    };
  }

  const passwordMatches = await bcrypt.compare(
    parsed.value.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return {
      ok: false,
      error: "invalid-credentials",
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}
