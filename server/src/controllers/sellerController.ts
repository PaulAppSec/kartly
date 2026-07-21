import type { NextFunction, Request, Response } from "express";
import { announcementService } from "../services/announcementService.js";
import { sellerService } from "../services/sellerService.js";

export const sellerController = {
  async getAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const a = await announcementService.get(req.user!.id);
      res.json({ template: a?.template ?? "Welcome to our store!" });
    } catch (err) {
      next(err);
    }
  },
  async setAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const a = await announcementService.set(req.user!.id, req.body.template);
      res.json({ template: a.template });
    } catch (err) {
      next(err);
    }
  },
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ products: await sellerService.listMine(req.user!.id) });
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ product: await sellerService.create(req.user!.id, req.body) });
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await sellerService.update(req.user!.id, req.user!.role, req.params.id, req.body);
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await sellerService.setImageFromUpload(
        req.user!.id,
        req.user!.role,
        req.params.id,
        req.file,
      );
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },
  async importImageFromUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await sellerService.setImageFromUrl(
        req.user!.id,
        req.user!.role,
        req.params.id,
        req.body.url,
      );
      res.json({ product });
    } catch (err) {
      next(err);
    }
  },
  async importXml(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ products: await sellerService.importXml(req.user!.id, req.body.xml) });
    } catch (err) {
      next(err);
    }
  },
};
