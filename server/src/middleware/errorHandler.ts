import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env.js";

// Typed application error the services layer can throw.
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Secure-baseline error handler: never leaks stack traces or internals to the
// client. (The "verbose errors" misconfig, vuln #20, is introduced in Phase 3.)
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Something went wrong.";

  if (status >= 500) {
    // Server-side logging only — the client sees a generic message.
    console.error(err);
  }

  res.status(status).json({ error: { message } });
  if (!env.isProd && status >= 500) {
    // dev convenience: keep going, response already sent
  }
}
