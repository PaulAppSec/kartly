import { resolve } from "node:path";
import ejs from "ejs";
import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../lib/cookies.js";
import { announcementService } from "../services/announcementService.js";
import { orderService } from "../services/orderService.js";
import { productService } from "../services/productService.js";
import { reviewService } from "../services/reviewService.js";
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

  // Public product share page. On `main` this template renders the search term
  // (#9), the product description and shopper reviews (#8), and a fragment-based
  // note (#10) as raw HTML — the reflected/stored/DOM XSS lessons.
  async shareProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      const reviews = await reviewService.listForProduct(req.params.id);
      const q = typeof req.query.q === "string" ? req.query.q : "";
      res.render("share", { product, reviews, q, money });
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
      const template = announcement?.template ?? "Welcome to our store!";
      // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #16 (SSTI). The seller-supplied
      // announcement is COMPILED as an EJS template instead of rendered as data,
      // so `<%= 7*7 %>` evaluates and `<%= process.env… %>` / require() give
      // secret disclosure → RCE. The fix (fix/ssti) renders it as escaped data.
      let announcementHtml: string;
      try {
        announcementHtml = ejs.render(template, {});
      } catch {
        announcementHtml = template;
      }
      res.render("store", {
        seller: { id: seller.id, name: seller.name },
        announcement: announcementHtml,
        products,
        money,
      });
    } catch (err) {
      next(err);
    }
  },

  // ⚠️ VULNERABLE ON PURPOSE (main) — VULNS.md #18 (Open redirect). When an
  // already-authenticated user hits /login?returnTo=…, they're bounced to the
  // target with NO validation, so `returnTo=//evil.com` or an absolute URL
  // sends them off-site (phishing / token-leaking landing). The fix
  // (fix/open-redirect) allows only same-origin relative paths. Anonymous users
  // fall through to the SPA login form.
  loginRedirect(req: Request, res: Response, next: NextFunction) {
    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "";
    const authenticated = Boolean(req.cookies?.[ACCESS_COOKIE]);
    if (returnTo && authenticated) {
      return res.redirect(returnTo);
    }
    next();
  },

  // FIX (fix/path-traversal) — VULNS.md #14. resolveWithinBase resolves the
  // joined path and verifies it still sits inside DOWNLOADS_DIR, so `..`
  // traversal is rejected (400) and nothing outside downloads/ can be read.
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
