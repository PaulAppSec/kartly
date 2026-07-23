import { Router } from "express";
import { adminApiController } from "../controllers/adminApiController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

// FIX (fix/authz-admin) — VULNS.md #6. Deny by default: the admin JSON API now
// requires the ADMIN role, so a CUSTOMER/SELLER token is rejected with 403.
export const adminApiRouter = Router();

adminApiRouter.use(requireAuth, requireRole("ADMIN"));

adminApiRouter.get("/users", adminApiController.listUsers);
adminApiRouter.post("/users/:id/role", adminApiController.setRole);
// #15 command injection lives in the report exporter.
adminApiRouter.post("/export", adminApiController.exportReport);
