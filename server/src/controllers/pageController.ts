import { resolve } from "node:path";
import type { NextFunction, Request, Response } from "express";
import { announcementService } from "../services/announcementService.js";
import { orderService } from "../services/orderService.js";
import { productService } from "../services/productService.js";
import { sellerService } from "../services/sellerService.js";
import { userRepo } from "../data/userRepo.js";
import { HttpError } from "../middleware/errorHandler.js";
import { resolveWithinBase } from "../lib/safePath.js";

const DOWNLOADS_DIR = resolve(process.cwd(), "server/downloads");
const money = (n: number) => `$${n.toFixed(2)}`;

export const pageController = {
  // Server-rendered receipt (ownership enforced by orderService.getById).
  async receipt(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.user!.id, req.params.orderId);
      res.render("receipt", { order, email: req.user!.email, money });
    } catch (err) {
      next(err);
    }
  },

  async invoice(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.user!.id, req.params.orderId);
      res.render("invoice", { order, email: req.user!.email, money });
    } catch (err) {
      next(err);
    }
  },

  async orderConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.user!.id, req.params.orderId);
      res.render("order-confirmation", { order, money });
    } catch (err) {
      next(err);
    }
  },

  // Public product share page. EJS <%= %> escapes output → XSS-safe baseline
  // (reflected/stored XSS lessons #8/#9 render raw HTML in Phase 3).
  async shareProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      const q = typeof req.query.q === "string" ? req.query.q : "";
      res.render("share", { product, q, money });
    } catch (err) {
      next(err);
    }
  },

  // Public seller store page + announcement (rendered as escaped DATA on the
  // secure baseline; the SSTI lesson #16 compiles it in Phase 3).
  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const seller = await userRepo.findById(req.params.sellerId);
      if (!seller) throw new HttpError(404, "Store not found.");
      const [announcement, products] = await Promise.all([
        announcementService.get(seller.id),
        sellerService.listMine(seller.id),
      ]);
      res.render("store", {
        seller: { id: seller.id, name: seller.name },
        announcement: announcement?.template ?? "Welcome to our store!",
        products,
        money,
      });
    } catch (err) {
      next(err);
    }
  },

  // File download, confined to the downloads directory (path-traversal safe #14).
  download(req: Request, res: Response, next: NextFunction) {
    try {
      const file = typeof req.query.file === "string" ? req.query.file : "";
      if (!file) throw new HttpError(400, "Specify a file.");
      const target = resolveWithinBase(DOWNLOADS_DIR, file);
      res.download(target, (err) => {
        if (err && !res.headersSent) next(new HttpError(404, "File not found."));
      });
    } catch (err) {
      next(err);
    }
  },
};
