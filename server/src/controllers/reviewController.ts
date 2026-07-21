import type { NextFunction, Request, Response } from "express";
import { reviewService } from "../services/reviewService.js";

export const reviewController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ reviews: await reviewService.listForProduct(req.params.id) });
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.create(req.params.id, req.user!.id, req.body);
      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  },
};
