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

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #19 (JWT weaknesses). The verifier
// honours the token's OWN `alg` header and accepts `alg:none`, so an attacker
// forges an unsigned token (`{"alg":"none"}` + arbitrary claims) and becomes
// any user/role. The signing secret is also the weak, known default. The fix
// (fix/jwt) pins `algorithms:["HS256"]`, requires a strong secret, and checks
// expiry.
export function verifyAccessToken(token: string): AccessClaims {
  const decoded = jwt.decode(token, { complete: true });
  if (decoded && (decoded.header as { alg?: string }).alg === "none") {
    return decoded.payload as AccessClaims; // trusts an unsigned token
  }
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: [ALG, "none"] }) as AccessClaims;
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
