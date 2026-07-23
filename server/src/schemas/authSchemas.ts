import { z } from "zod";

// FIX (fix/mass-assignment) — VULNS.md #7. Dropping `.passthrough()` restores
// Zod's default: unknown keys (e.g. an injected `role`) are STRIPPED during
// parse, so only email/password/name survive to the user-create call.
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
