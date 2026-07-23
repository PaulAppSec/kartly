import type { NextFunction, Request, Response } from "express";

// Typed application error the services layer can throw.
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// FIX (fix/misconfig) — VULNS.md #20. Never leak internals: 500s are logged
// server-side only and the client receives a generic message (no stack, no
// error name).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Something went wrong.";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: { message } });
}
