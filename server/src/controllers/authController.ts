import type { NextFunction, Request, Response } from "express";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  issueCsrfToken,
  setAuthCookies,
} from "../lib/cookies.js";
import { authService } from "../services/authService.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setAuthCookies(res, accessToken, refreshToken);
      const csrfToken = issueCsrfToken(res);
      res.status(201).json({ user, accessToken, csrfToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      setAuthCookies(res, accessToken, refreshToken);
      const csrfToken = issueCsrfToken(res);
      res.json({ user, accessToken, csrfToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.refresh(
        req.cookies?.[REFRESH_COOKIE],
      );
      setAuthCookies(res, accessToken, refreshToken);
      const csrfToken = issueCsrfToken(res);
      res.json({ user, accessToken, csrfToken });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    clearAuthCookies(res);
    res.json({ ok: true });
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.requestPasswordReset(req.body.email);
      // Same response whether or not the account exists (no enumeration).
      res.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ ok: true, message: "Your password has been reset. You can sign in now." });
    } catch (err) {
      next(err);
    }
  },
};
