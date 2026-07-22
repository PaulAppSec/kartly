import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas.js";

// ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #24 (No rate limiting). The
// per-credential-endpoint limiter (authLimiter) has been removed from login,
// register, and password reset, so brute force / credential stuffing / reset
// spraying run unthrottled. The fix (fix/rate-limit) reinstates authLimiter.
export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
