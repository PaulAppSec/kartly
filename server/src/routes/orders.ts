import { Router } from "express";
import { orderController } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { csrfGuard } from "../middleware/csrf.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema } from "../schemas/orderSchemas.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", orderController.list);
ordersRouter.get("/:id", orderController.getById);
// #24: couponLimiter removed — coupon brute force / apply-race runs unthrottled.
ordersRouter.post("/", csrfGuard, validate(checkoutSchema), orderController.checkout);
