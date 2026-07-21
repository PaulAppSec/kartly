import { Router } from "express";
import { productController } from "../controllers/productController.js";

// Thin router (spec §3). Read-only catalog is the Phase 1 end-to-end proof;
// search / filter / detail / cart are built out in Phase 2.
export const productsRouter = Router();

productsRouter.get("/", productController.list);
productsRouter.get("/:id", productController.getById);
