import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { HttpError } from "./errorHandler.js";

type Part = "body" | "query" | "params";

// Zod validation middleware. Parses + REPLACES the request part with the typed,
// stripped result — so only allowlisted fields survive (this is the structural
// defense against mass assignment #7 that Phase 3 removes on `main`).
export function validate(schema: ZodSchema, part: Part = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // query/params are read-only getters in some Express versions; assign safely
      Object.defineProperty(req, part, { value: parsed, writable: true, configurable: true });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.errors[0];
        return next(new HttpError(400, first ? `${first.path.join(".")}: ${first.message}` : "Invalid request."));
      }
      next(err);
    }
  };
}
