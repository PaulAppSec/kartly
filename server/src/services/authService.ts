import type { User } from "@prisma/client";
import { userRepo } from "../data/userRepo.js";
import { env } from "../lib/env.js";
import { hashPassword, verifyPassword } from "../lib/hashing.js";
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
  async register(input: RegisterInput) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) throw new HttpError(409, "An account with that email already exists.");

    // role is intentionally NOT taken from input — always CUSTOMER on signup.
    const user = await userRepo.create({
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.name,
    });
    return { user: toPublicUser(user), ...issueTokens(user) };
  },

  async login(input: LoginInput) {
    const user = await userRepo.findByEmail(input.email);
    // Generic failure message — don't reveal whether the email exists.
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
    await userRepo.update(user.id, { passwordHash: hashPassword(newPassword) });
  },
};
