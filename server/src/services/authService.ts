import type { Prisma, User } from "@prisma/client";
import { prisma } from "../data/prisma.js";
import { userRepo } from "../data/userRepo.js";
import { env } from "../lib/env.js";
import { sendEmail } from "../lib/mailer.js";
import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/hashing.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { LoginInput, RegisterInput } from "../schemas/authSchemas.js";

// Public user shape — never includes passwordHash (secure baseline for the
// sensitive-data-exposure lesson #21). Reused across services.
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: User["role"];
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt.toISOString(),
  };
}

function issueTokens(user: User) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput & Record<string, unknown>) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw new HttpError(409, "An account with that email already exists.");

    // ⚠️ VULNERABLE (main) — VULNS.md #7 (mass assignment): the whole request
    // body is spread into the create, so `{"role":"ADMIN"}` self-promotes.
    // Also #4 (broken auth): password stored in PLAINTEXT.
    // Fix (fix/mass-assignment) whitelists fields; fix/auth hashes.
    // FIX (fix/auth) — VULNS.md #4: store a scrypt KDF hash, not cleartext.
    // (The mass-assignment spread of `...rest` is the separate fix/mass-assignment.)
    const { email, name, password, ...rest } = input;
    const data = { ...rest, email, name, passwordHash: hashPassword(password as string) };
    const user = await prisma.user.create({ data: data as Prisma.UserUncheckedCreateInput });
    return { user: toPublicUser(user), ...issueTokens(user) };
  },

  // ⚠️ VULNERABLE (main) — VULNS.md #2 (SQLi auth bypass) + #4 (broken auth).
  // Both the email and the plaintext password are concatenated into raw SQL, so
  // `admin@kartly.test'-- ` comments out the password check and logs in as
  // admin. Fix (fix/sqli-login) parameterizes and compares a hash.
  // FIX (fix/auth) — VULNS.md #4: verify the password against the stored scrypt
  // hash with a constant-time comparison (verifyPassword). Also parameterized.
  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new HttpError(401, "Incorrect email or password.");
    }
    return { user: toPublicUser(user), ...issueTokens(user) };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new HttpError(401, "No refresh token.");
    let sub: string;
    try {
      ({ sub } = verifyRefreshToken(refreshToken));
    } catch {
      throw new HttpError(401, "Invalid refresh token.");
    }
    const user = await userRepo.findById(sub);
    if (!user) throw new HttpError(401, "Session no longer valid.");
    return { user: toPublicUser(user), ...issueTokens(user) };
  },

  // Always resolves the same way whether or not the email exists — no account
  // enumeration. The rate limiting on this endpoint is the home of vuln #24
  // (removed on `main` in Phase 3).
  async requestPasswordReset(email: string) {
    const user = await userRepo.findByEmail(email);
    if (user) {
      const token = signResetToken(user.id);
      const resetUrl = `${env.clientOrigin}/reset-password?token=${encodeURIComponent(token)}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your Kartly password",
        template: "password-reset",
        data: { name: user.name, resetUrl },
      });
    }
  },

  async resetPassword(token: string, newPassword: string) {
    let userId: string;
    try {
      userId = verifyResetToken(token);
    } catch {
      throw new HttpError(400, "This reset link is invalid or has expired.");
    }
    const user = await userRepo.findById(userId);
    if (!user) throw new HttpError(400, "This reset link is invalid or has expired.");
    // FIX (fix/auth) — #4: store a scrypt hash of the new password.
    await userRepo.update(user.id, { passwordHash: hashPassword(newPassword) });
  },
};
