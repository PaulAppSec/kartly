import { z } from "zod";

// Registration explicitly does NOT accept `role` — the field allowlist is the
// structural defense against mass assignment (#7). Phase 3 removes it on `main`.
export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8, "must be at least 8 characters").max(200),
  name: z.string().min(1).max(120),
});

// ⚠️ VULNERABLE (main) — loose on purpose (§2: "Zod absent/loose on main").
// Not requiring a valid email format lets the SQLi payload (#2) through to the
// raw query. Fix (fix/sqli-login) restores `.email()` + parameterized lookup.
export const loginSchema = z.object({
  email: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(200),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(2000),
  password: z.string().min(8, "must be at least 8 characters").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
