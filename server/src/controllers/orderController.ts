import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env.js";
import { sendEmail } from "../lib/mailer.js";
import { orderService } from "../services/orderService.js";

export const orderController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ orders: await orderService.listForUser(req.user!.id) });
    } catch (err) {
      next(err);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ order: await orderService.getById(req.user!.id, req.params.id) });
    } catch (err) {
      next(err);
    }
  },
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.checkout(req.user!.id, req.body);
      // Fire-and-forget order receipt email (written to the local outbox).
      void sendEmail({
        to: req.user!.email,
        subject: `Your Kartly order ${order.id}`,
        template: "order-receipt",
        data: { order, receiptUrl: `${env.clientOrigin}/receipt/${order.id}` },
      });
      res.status(201).json({ order });
    } catch (err) {
      next(err);
    }
  },
};
