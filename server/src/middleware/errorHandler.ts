import type { NextFunction, Request, Response } from "express";

// Typed application error the services layer can throw.
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ⚠️ MISCONFIGURED ON PURPOSE (main) — VULNS.md #20 (Security misconfig). The
// handler leaks the real error message AND the full stack trace to the client
// on 500s, disclosing internal paths, library versions, and query fragments.
// The fix (fix/misconfig) returns a generic message and logs server-side only.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    console.error(err);
    const e = err as Error;
    return res.status(status).json({
      error: { message: e?.message ?? "Error", stack: e?.stack, name: e?.name },
    });
  }

  const message = err instanceof HttpError ? err.message : "Something went wrong.";
  res.status(status).json({ error: { message } });
}
