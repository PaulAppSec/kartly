import type { Response } from "express";
import { randomBytes } from "node:crypto";
import { env } from "./env.js";

// Cookie names
export const ACCESS_COOKIE = "kartly_access";
export const REFRESH_COOKIE = "kartly_refresh";
export const CSRF_COOKIE = "kartly_csrf";

// Secure-baseline cookie flags. httpOnly for auth tokens (JS can't read them),
// SameSite=Lax to blunt CSRF, path-scoped refresh. `secure` stays false because
// Kartly runs on http://localhost only.
const baseAuth = {
  httpOnly: true,
  secure: env.isProd ? false : false, // localhost http — never deployed
  sameSite: "lax" as const,
};

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15m
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseAuth, maxAge: ACCESS_MAX_AGE });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseAuth,
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseAuth });
  res.clearCookie(REFRESH_COOKIE, { ...baseAuth, path: "/api/auth" });
  res.clearCookie(CSRF_COOKIE, { sameSite: "lax", secure: false });
}

// Double-submit CSRF token: readable by JS (not httpOnly) so the SPA can echo
// it back in a header, which server-side is compared to the cookie value.
export function issueCsrfToken(res: Response): string {
  const token = randomBytes(24).toString("hex");
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: REFRESH_MAX_AGE,
  });
  return token;
}
