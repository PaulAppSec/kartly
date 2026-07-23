import { Router } from "express";
import { orderController } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { couponLimiter } from "../middleware/rateLimit.js";
import { csrfGuard } from "../middleware/csrf.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema } from "../schemas/orderSchemas.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", orderController.list);
ordersRouter.get("/:id", orderController.getById);
// FIX (fix/rate-limit) — VULNS.md #24: reinstate couponLimiter on checkout to
// blunt coupon brute force / apply-race abuse.
ordersRouter.post("/", couponLimiter, csrfGuard, validate(checkoutSchema), orderController.checkout);
