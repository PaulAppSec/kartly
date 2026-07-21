import type { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService.js";

export const userController = {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: await userService.getMe(req.user!.id) });
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: await userService.updateMe(req.user!.id, req.body) });
    } catch (err) {
      next(err);
    }
  },

  async listAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ addresses: await userService.listAddresses(req.user!.id) });
    } catch (err) {
      next(err);
    }
  },

  async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ address: await userService.addAddress(req.user!.id, req.body) });
    } catch (err) {
      next(err);
    }
  },

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteAddress(req.user!.id, req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: await userService.setAvatarFromUpload(req.user!.id, req.file) });
    } catch (err) {
      next(err);
    }
  },

  async avatarFromUrl(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: await userService.setAvatarFromUrl(req.user!.id, req.body.url) });
    } catch (err) {
      next(err);
    }
  },
};
