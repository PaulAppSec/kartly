import type { NextFunction, Request, Response } from "express";
import { adminService } from "../services/adminService.js";

const money = (n: number) => `$${n.toFixed(2)}`;

export const adminPageController = {
  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const [counts, report] = await Promise.all([adminService.counts(), adminService.report()]);
      res.render("admin/dashboard", { active: "dashboard", counts, report, money });
    } catch (err) {
      next(err);
    }
  },

  async users(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.users();
      res.render("admin/table", {
        active: "users",
        title: "Users",
        columns: ["Name", "Email", "Role", "Joined"],
        rows: users.map((u) => [u.name, u.email, u.role, u.createdAt.toISOString().slice(0, 10)]),
      });
    } catch (err) {
      next(err);
    }
  },

  async orders(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await adminService.orders();
      res.render("admin/table", {
        active: "orders",
        title: "Orders",
        columns: ["Order", "Customer", "Items", "Total", "Status", "Date"],
        rows: orders.map((o) => [
          o.id,
          o.customer.email,
          String(o.items.length),
          money(Number(o.total)),
          o.status,
          o.createdAt.toISOString().slice(0, 10),
        ]),
      });
    } catch (err) {
      next(err);
    }
  },

  async products(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await adminService.products();
      res.render("admin/table", {
        active: "products",
        title: "Products",
        columns: ["Name", "Category", "Price", "Stock", "Seller"],
        rows: products.map((p) => [
          p.name,
          p.category,
          money(Number(p.price)),
          String(p.stock),
          p.seller?.email ?? "—",
        ]),
      });
    } catch (err) {
      next(err);
    }
  },

  async coupons(_req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await adminService.coupons();
      res.render("admin/table", {
        active: "coupons",
        title: "Coupons",
        columns: ["Code", "% Off", "Uses", "Max Uses"],
        rows: coupons.map((c) => [c.code, `${c.percentOff}%`, String(c.uses), String(c.maxUses)]),
      });
    } catch (err) {
      next(err);
    }
  },

  async report(_req: Request, res: Response, next: NextFunction) {
    try {
      const report = await adminService.report();
      res.render("admin/report", { active: "report", report, money });
    } catch (err) {
      next(err);
    }
  },
};
