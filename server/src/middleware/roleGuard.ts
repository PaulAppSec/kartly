import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { HttpError } from "./errorHandler.js";

// Object-level role gate. Runs after requireAuth. The "no role guard on API"
// privilege-escalation lesson (vuln #6) is introduced in Phase 3 by removing it.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Authentication required."));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "You don't have access to this resource."));
    }
    next();
  };
}
