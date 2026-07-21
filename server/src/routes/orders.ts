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
ordersRouter.post("/", couponLimiter, csrfGuard, validate(checkoutSchema), orderController.checkout);
