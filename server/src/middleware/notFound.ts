import type { Request, Response } from "express";

// JSON 404 for unmatched /api routes. Non-API paths fall through to the SPA.
export function apiNotFound(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Not found." } });
}
