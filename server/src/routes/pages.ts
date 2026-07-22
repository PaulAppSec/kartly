import { Router } from "express";
import { pageController } from "../controllers/pageController.js";
import { requirePageAuth } from "../middleware/pageAuth.js";

// Server-rendered surfaces that live outside the SPA.
export const pagesRouter = Router();

// Authenticated, owner-only documents.
pagesRouter.get("/receipt/:orderId", requirePageAuth, pageController.receipt);
pagesRouter.get("/invoice/:orderId", requirePageAuth, pageController.invoice);
pagesRouter.get("/order-confirmation/:orderId", requirePageAuth, pageController.orderConfirmation);

// Post-login redirect (open redirect on `main`, #18). Anonymous users fall
// through (next()) to the SPA login form.
pagesRouter.get("/login", pageController.loginRedirect);

// Public.
pagesRouter.get("/share/product/:id", pageController.shareProduct);
pagesRouter.get("/store/:sellerId", pageController.store);
pagesRouter.get("/download", pageController.download);
