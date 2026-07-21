import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ACCESS_COOKIE } from "../lib/cookies.js";
import { verifyAccessToken } from "../lib/jwt.js";

// Auth for server-rendered pages: redirect to the SPA login (carrying a
// RELATIVE returnTo) instead of returning JSON 401. returnTo is built from
// req.originalUrl (server-controlled, same-origin) and encoded.
export function requirePageAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (token) {
    try {
      const claims = verifyAccessToken(token);
      req.user = { id: claims.sub, role: claims.role, email: claims.email };
      return next();
    } catch {
      /* fall through to redirect */
    }
  }
  const returnTo = encodeURIComponent(req.originalUrl);
  res.redirect(`/login?returnTo=${returnTo}`);
}

export function requirePageRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) return next();
    res.status(403).render("error", {
      title: "Forbidden",
      heading: "You don't have access to this area",
      message: "This part of Kartly is for staff only.",
    });
  };
}
