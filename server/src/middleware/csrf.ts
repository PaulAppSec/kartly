import type { NextFunction, Request, Response } from "express";
import { CSRF_COOKIE } from "../lib/cookies.js";
import { HttpError } from "./errorHandler.js";

// Double-submit CSRF check for cookie-authenticated, state-changing requests.
// The SPA reads the (non-httpOnly) CSRF cookie and echoes it in X-CSRF-Token;
// this compares the two. Requests carrying a Bearer token instead of the auth
// cookie are exempt (not cross-site forgeable). The CSRF lesson (#11) is
// introduced in Phase 3 by dropping this guard.
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  const usesBearer = req.headers.authorization?.startsWith("Bearer ");
  if (usesBearer) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get("x-csrf-token");
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new HttpError(403, "Invalid or missing CSRF token."));
  }
  next();
}
