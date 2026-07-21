import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { searchService } from "../services/searchService.js";

// GET /api/search?q=  — public product search.
// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #1 (SQL injection).
export const searchRouter = Router();

searchRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const results = await searchService.rawSearch(q);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});
