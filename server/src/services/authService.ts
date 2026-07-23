import type { User } from "@prisma/client";
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

    // FIX (fix/mass-assignment) — VULNS.md #7: construct the create from an
    // EXPLICIT field allowlist; never spread the request body. An injected
    // `role` (even if it reached here) cannot set a privileged column.
    // (Password is still stored as-is here — hashing is the separate fix/auth.)
    const { email, name, password } = input;
    const user = await prisma.user.create({
      data: { email, name, passwordHash: password },
    });
    return { user: toPublicUser(user), ...issueTokens(user) };
  },

  // ⚠️ VULNERABLE (main) — VULNS.md #2 (SQLi auth bypass) + #4 (broken auth).
  // Both the email and the plaintext password are concatenated into raw SQL, so
  // `admin@kartly.test'-- ` comments out the password check and logs in as
  // admin. Fix (fix/sqli-login) parameterizes and compares a hash.
  async login(input: LoginInput) {
    const rows = await prisma.$queryRawUnsafe<User[]>(
      `SELECT * FROM "User" WHERE email = '${input.email}' AND "passwordHash" = '${input.password}'`,
    );
    const user = rows[0];
    if (!user) throw new HttpError(401, "Incorrect email or password.");
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
    // ⚠️ VULNERABLE (main) — #4 broken auth: stored in plaintext.
    await userRepo.update(user.id, { passwordHash: newPassword });
  },
};
