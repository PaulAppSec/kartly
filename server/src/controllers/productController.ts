import type { NextFunction, Request, Response } from "express";
import { productService } from "../services/productService.js";

export const productController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ products: await productService.list() });
    } catch (err) {
      next(err);
    }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ product: await productService.getById(req.params.id) });
    } catch (err) {
      next(err);
    }
  },
};
