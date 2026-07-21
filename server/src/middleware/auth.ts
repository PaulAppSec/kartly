import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../lib/cookies.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { HttpError } from "./errorHandler.js";

// Extract a bearer token from the Authorization header, if present.
function bearer(req: Request): string | undefined {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) return h.slice(7);
  return undefined;
}

function readToken(req: Request): string | undefined {
  return req.cookies?.[ACCESS_COOKIE] ?? bearer(req);
}

// Hard auth gate: 401 if no valid access token.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next(new HttpError(401, "Authentication required."));
  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, role: claims.role, email: claims.email };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session."));
  }
}

// Soft auth: attaches req.user when a valid token is present, else continues
// anonymously (used by endpoints that behave differently when logged in).
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    try {
      const claims = verifyAccessToken(token);
      req.user = { id: claims.sub, role: claims.role, email: claims.email };
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
