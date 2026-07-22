import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { adminService } from "../services/adminService.js";
import { userRepo } from "../data/userRepo.js";
import { HttpError } from "../middleware/errorHandler.js";

const pexec = promisify(exec);

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

  // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #15 (Command injection / RCE).
  // The "export report" tool builds a shell command by string-concatenating the
  // user-supplied label, so `label = "; cat …"` runs arbitrary commands.
  // Sandboxed per §7 — targets harmless bundled binaries and a decoy file; no
  // real secrets. The fix (fix/cmdi) uses execFile with an argument array (no
  // shell) and an allowlist.
  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const label = String(req.body?.label ?? "report").slice(0, 200);
      const cmd = `echo Kartly export ${label} && ls server/downloads | wc -l`;
      const { stdout } = await pexec(cmd);
      res.json({ ok: true, output: stdout });
    } catch (err: unknown) {
      // Even a non-zero exit leaks captured stdout — surface it (verbose).
      const stdout = (err as { stdout?: string })?.stdout;
      if (stdout) return res.json({ ok: true, output: stdout });
      next(err);
    }
  },
};
