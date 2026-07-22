import { Router } from "express";
import { adminApiController } from "../controllers/adminApiController.js";
import { requireAuth } from "../middleware/auth.js";

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #6 (privilege escalation).
// requireAuth only — the ADMIN role guard is missing.
export const adminApiRouter = Router();

adminApiRouter.use(requireAuth); // <-- fix/authz-admin adds requireRole("ADMIN")

adminApiRouter.get("/users", adminApiController.listUsers);
adminApiRouter.post("/users/:id/role", adminApiController.setRole);
// #15 command injection lives in the report exporter.
adminApiRouter.post("/export", adminApiController.exportReport);
