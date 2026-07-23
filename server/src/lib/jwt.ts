import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "./env.js";

// Secure-baseline JWT. HS256 only, explicit algorithm on verify (no `alg:none`,
// vuln #19), separate strong secrets for access/refresh, short-lived access
// tokens with expiry. The JWT weaknesses lesson is introduced in Phase 3.

export interface AccessClaims {
  sub: string; // user id
  role: Role;
  email: string;
}

export interface RefreshClaims {
  sub: string;
  // token version could be added here to support revocation lists
}

const ALG: jwt.Algorithm = "HS256";

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign(claims, env.jwtAccessSecret, {
    algorithm: ALG,
    expiresIn: env.jwtAccessTtl as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(claims: RefreshClaims): string {
  return jwt.sign(claims, env.jwtRefreshSecret, {
    algorithm: ALG,
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions["expiresIn"],
  });
}

// FIX (fix/jwt) — VULNS.md #19. Verify with a pinned algorithm list
// (`["HS256"]`) and never trust the token's own `alg`, so `alg:none` and
// algorithm-confusion tokens are rejected. `jwt.verify` also enforces the `exp`
// claim. (In production the secret must be a strong random value, not the
// weak default.)
export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: [ALG] }) as AccessClaims;
}

export function verifyRefreshToken(token: string): RefreshClaims {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: [ALG] }) as RefreshClaims;
}

// Password-reset token: a short-lived, purpose-scoped JWT signed with a
// dedicated secret. Verified explicitly for algorithm + purpose.
export function signResetToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: "reset" }, env.jwtResetSecret, {
    algorithm: ALG,
    expiresIn: env.jwtResetTtl as jwt.SignOptions["expiresIn"],
  });
}

export function verifyResetToken(token: string): string {
  const claims = jwt.verify(token, env.jwtResetSecret, { algorithms: [ALG] }) as {
    sub: string;
    purpose?: string;
  };
  if (claims.purpose !== "reset") throw new Error("Not a reset token");
  return claims.sub;
}
