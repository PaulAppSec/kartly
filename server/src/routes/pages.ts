import { Router } from "express";
import { pageController } from "../controllers/pageController.js";
import { requirePageAuth } from "../middleware/pageAuth.js";

// Server-rendered surfaces that live outside the SPA.
export const pagesRouter = Router();

// Authenticated, owner-only documents.
pagesRouter.get("/receipt/:orderId", requirePageAuth, pageController.receipt);
pagesRouter.get("/invoice/:orderId", requirePageAuth, pageController.invoice);
pagesRouter.get("/order-confirmation/:orderId", requirePageAuth, pageController.orderConfirmation);

// Public.
pagesRouter.get("/share/product/:id", pageController.shareProduct);
pagesRouter.get("/store/:sellerId", pageController.store);
pagesRouter.get("/download", pageController.download);
