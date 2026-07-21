import { Router } from "express";
import { adminPageController } from "../controllers/adminPageController.js";
import { requirePageAuth, requirePageRole } from "../middleware/pageAuth.js";

// Server-rendered admin back office. Cookie session auth + ADMIN role guard
// (correct baseline for privilege escalation #6). Distinct "operator" look.
export const adminRouter = Router();

adminRouter.use(requirePageAuth, requirePageRole("ADMIN"));

adminRouter.get("/", adminPageController.dashboard);
adminRouter.get("/users", adminPageController.users);
adminRouter.get("/orders", adminPageController.orders);
adminRouter.get("/products", adminPageController.products);
adminRouter.get("/coupons", adminPageController.coupons);
adminRouter.get("/report", adminPageController.report);
