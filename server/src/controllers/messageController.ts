import type { NextFunction, Request, Response } from "express";
import { messageService } from "../services/messageService.js";

export const messageController = {
  async inbox(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ messages: await messageService.inbox(req.user!.id) });
    } catch (err) {
      next(err);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ message: await messageService.getById(req.user!.id, req.params.id) });
    } catch (err) {
      next(err);
    }
  },
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ message: await messageService.send(req.user!.id, req.body) });
    } catch (err) {
      next(err);
    }
  },
};
