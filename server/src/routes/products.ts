import { Router } from "express";
import { productController } from "../controllers/productController.js";
import { reviewController } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";
import { csrfGuard } from "../middleware/csrf.js";
import { validate } from "../middleware/validate.js";
import { reviewSchema } from "../schemas/reviewSchemas.js";

// Thin router (spec §3). Public reads; authenticated + CSRF-guarded writes.
export const productsRouter = Router();

productsRouter.get("/", productController.list);
productsRouter.get("/:id", productController.getById);

productsRouter.get("/:id/reviews", reviewController.list);
productsRouter.post(
  "/:id/reviews",
  requireAuth,
  csrfGuard,
  validate(reviewSchema),
  reviewController.create,
);
