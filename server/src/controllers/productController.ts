import type { NextFunction, Request, Response } from "express";
import { productService } from "../services/productService.js";

export const productController = {
  // GET /api/products?q=&category=&sort=  — secure, parameterized search.
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : undefined;
      const category = typeof req.query.category === "string" ? req.query.category : undefined;
      const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;
      res.json({ products: await productService.search({ q, category, sort }) });
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
