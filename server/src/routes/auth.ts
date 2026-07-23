import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas.js";

// FIX (fix/rate-limit) — VULNS.md #24. Reinstate the tight per-credential
// limiter on login, register, and password reset so brute force / credential
// stuffing / reset spraying are throttled (429).
export const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", authLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
