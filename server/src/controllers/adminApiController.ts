import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { adminService } from "../services/adminService.js";
import { userRepo } from "../data/userRepo.js";
import { HttpError } from "../middleware/errorHandler.js";

const pexecFile = promisify(execFile);

// JSON admin API. ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #6 (privilege
// escalation): the router is protected by requireAuth only, with NO role guard,
// so any logged-in CUSTOMER can call these admin endpoints — including promoting
// themselves to ADMIN. Fix (fix/authz-admin) adds requireRole('ADMIN').
export const adminApiController = {
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = (await adminService.users()).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      }));
      res.json({ users });
    } catch (err) {
      next(err);
    }
  },

  async setRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.body?.role as Role;
      if (!["CUSTOMER", "SELLER", "ADMIN"].includes(role)) {
        throw new HttpError(400, "Invalid role.");
      }
      const user = await userRepo.update(req.params.id, { role });
      res.json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      next(err);
    }
  },

  // FIX (fix/cmdi) — VULNS.md #15. Run the report via execFile with an argument
  // ARRAY and a fixed allowlisted binary — no shell is spawned, so the label is
  // a single inert argument and metacharacters (`;`, `|`, `` ` ``) can't chain
  // commands.
  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const label = String(req.body?.label ?? "report").slice(0, 200);
      const { stdout } = await pexecFile("echo", ["Kartly export:", label]);
      res.json({ ok: true, output: stdout });
    } catch (err) {
      next(err);
    }
  },
};
