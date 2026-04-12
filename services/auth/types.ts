export type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
  redirectTo?: string | null;
};

export type AuthActionResult = {
  ok: boolean;
  error?: string;
};
