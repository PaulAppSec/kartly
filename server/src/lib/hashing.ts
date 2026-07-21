import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Secure-baseline password hashing (scrypt, Node stdlib). Format:
//   scrypt$<saltHex>$<hashHex>
// This is the correct-by-default behaviour on the secure baseline; the
// broken-auth lesson (vuln #4) is introduced deliberately in Phase 3.

const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plain, salt, KEYLEN);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
