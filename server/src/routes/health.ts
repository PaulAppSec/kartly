import { Router } from "express";
import { prisma } from "../data/prisma.js";

export const healthRouter = Router();

// Liveness + DB readiness. Used by humans and by the compose stack.
healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});
